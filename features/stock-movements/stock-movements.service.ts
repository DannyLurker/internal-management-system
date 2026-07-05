import prisma from "@/shared/db/prisma";
import { badRequest, forbidden, notFound } from "@/shared/lib/error-handlers";
import { canManageItem } from "@/shared/lib/validations/user-access-validation";
import sessionValidation from "@/shared/lib/validations/user-session-validation";
import {
  stockMovementCreateSchema,
  StockMovementCreateSchema,
  stockMovementGetManySchema,
  stockMovementUpdateSchema,
  StockMovementUpdateSchema,
} from "@/shared/lib/zods/stock-movements.zod";
import stockMovementsRepository, {
  createSelectStockMovementData,
} from "./stock-movements.repository";
import auditLogsRepository from "../audit-logs/audit-log.repository";
import { MovementType, Prisma } from "@prisma/client";
import itemRepository from "../items/item.repository";
import { locationRepository } from "../locations/location.repository";
import { stockRepository } from "../stocks/stock.repository";
import orderRepository from "../orders/order-repository";
import { TargetStockType } from "./stock-movements.types";
import { markStockAs } from "./stock-movements.utils";

const stockMovementsService = {
  create: async (rawData: StockMovementCreateSchema) => {
    const session = await sessionValidation();
    const validatedData = stockMovementCreateSchema.parse(rawData);

    if (!canManageItem(session.role)) {
      throw forbidden("You're not allowed to access this feature");
    }

    const result = await prisma.$transaction(async (tx) => {
      const [item, currentStock, sourceLoc, destLoc, order] = await Promise.all(
        [
          itemRepository.findById(validatedData.itemId, tx),
          validatedData.stockId
            ? stockRepository.findById(validatedData.stockId, tx)
            : null,
          validatedData.sourceLocationId
            ? locationRepository.findById(validatedData.sourceLocationId, tx)
            : null,
          validatedData.destinationLocationId
            ? locationRepository.findById(
                validatedData.destinationLocationId,
                tx,
              )
            : null,
          validatedData.orderId
            ? orderRepository.findById(validatedData.orderId, tx)
            : null,
        ],
      );

      if (!item) throw notFound("Item not found");
      if (validatedData.stockId && !currentStock)
        throw notFound("Stock not found");
      if (validatedData.sourceLocationId && !sourceLoc)
        throw notFound("Source location not found");
      if (validatedData.destinationLocationId && !destLoc)
        throw notFound("Destination location not found");
      if (validatedData.orderId && !order) throw notFound("Order not found");

      // Movement types below require an existing stock row to operate on.
      // Fail fast with a specific message instead of silently no-op'ing
      // (previously this fell through every branch and produced a generic
      // "No movement record has created" error).
      const TYPES_REQUIRING_STOCK: MovementType[] = [
        "TRANSFER",
        "ADJUSTMENT",
        "MARK_AS_DAMAGED",
        "MARK_AS_DIRTY",
        "MARK_AS_LOST",
        "MARK_AS_EXPIRED",
        "CONSUME",
        "SALE",
        "LAUNDRY_OUT",
        "DISCARD",
      ];
      if (
        TYPES_REQUIRING_STOCK.includes(validatedData.stockMovementType) &&
        !currentStock
      ) {
        throw badRequest(
          `stockId is required for movement type '${validatedData.stockMovementType}'`,
        );
      }

      let movement;

      const increaseStockQuantityMovementType: MovementType[] = [
        "RECEIVE",
        "LAUNDRY_IN",
      ];

      const createdStockMovement: Prisma.StockMovementUncheckedCreateInput = {
        itemId: validatedData.itemId,
        stockId: validatedData.stockId,
        type: validatedData.stockMovementType,
        quantity: validatedData.quantity,
        totalCost: validatedData.totalCost,
        reason: validatedData.reason,
        sourceLocationId: validatedData.sourceLocationId,
        destinationLocationId: validatedData.destinationLocationId,
        orderId: validatedData.orderId,
        createdBy: session.id,
      };

      // Allows stockId to be null for 'RECEIVE' movements to record a global
      // intake transaction. This unassigned stock can later be distributed
      // to specific locations and stock records.
      if (
        validatedData.stockMovementType === "RECEIVE" &&
        !validatedData.stockId
      ) {
        movement = await stockMovementsRepository.create(
          { ...createdStockMovement, sourceLocationId: null },
          tx,
        );
      }

      // RECEIVE / LAUNDRY_IN against an existing stock row: increment in place.
      if (
        currentStock?.id &&
        increaseStockQuantityMovementType.includes(
          validatedData.stockMovementType,
        )
      ) {
        movement = await stockMovementsRepository.create(
          createdStockMovement,
          tx,
        );

        await stockRepository.update(
          currentStock.id,
          { quantity: { increment: validatedData.quantity } },
          tx,
        );
      }

      // TRANSFER
      const isSourceLocationValid =
        currentStock?.locationId === validatedData.sourceLocationId;

      if (
        currentStock &&
        validatedData.stockMovementType === "TRANSFER" &&
        isSourceLocationValid &&
        validatedData.destinationLocationId !== currentStock.locationId
      ) {
        if (currentStock.quantity < validatedData.quantity)
          throw badRequest("Insufficient stock quantity.");

        let destinationStock = await stockRepository.findFirst(
          {
            itemId: validatedData.itemId,
            locationId: validatedData.destinationLocationId,
            expiredAt: currentStock?.expiredAt,
            type: currentStock.type,
          },
          tx,
        );

        if (!destinationStock) {
          destinationStock = await stockRepository.create(
            {
              item: { connect: { id: validatedData.itemId } },
              creator: { connect: { id: session.id } },
              quantity: validatedData.quantity,
              location: {
                connect: { id: validatedData.destinationLocationId },
              },
              expiredAt: currentStock.expiredAt,
              type: currentStock.type,
            },
            tx,
          );

          await stockRepository.update(
            currentStock.id,
            { quantity: { decrement: validatedData.quantity } },
            tx,
          );
        } else {
          await stockRepository.update(
            destinationStock.id,
            { quantity: { increment: validatedData.quantity } },
            tx,
          );

          await stockRepository.update(
            currentStock.id,
            { quantity: { decrement: validatedData.quantity } },
            tx,
          );
        }

        movement = await stockMovementsRepository.create(
          {
            ...createdStockMovement,
            stockId: destinationStock.id,
            totalCost: null,
          },
          tx,
        );
      }

      // ADJUSTMENT (quantity can be positive or negative)
      if (currentStock && validatedData.stockMovementType === "ADJUSTMENT") {
        const calculatedQuantity =
          currentStock.quantity + validatedData.quantity;

        if (calculatedQuantity < 0)
          throw badRequest("Insufficient stock quantity.");

        movement = await stockMovementsRepository.create(
          createdStockMovement,
          tx,
        );

        await stockRepository.update(
          currentStock.id,
          { quantity: { increment: validatedData.quantity } },
          tx,
        );
      }

      // MARK_AS_DAMAGED / MARK_AS_DIRTY / MARK_AS_LOST / MARK_AS_EXPIRED
      if (
        currentStock &&
        (validatedData.stockMovementType === "MARK_AS_DAMAGED" ||
          validatedData.stockMovementType === "MARK_AS_DIRTY" ||
          validatedData.stockMovementType === "MARK_AS_LOST" ||
          validatedData.stockMovementType === "MARK_AS_EXPIRED")
      ) {
        const targetType = validatedData.stockMovementType.replace(
          "MARK_AS_",
          "",
        ) as TargetStockType;

        movement = await markStockAs(
          currentStock,
          targetType,
          validatedData.quantity,
          session,
          createdStockMovement,
          tx,
        );
      }

      // CONSUME / SALE
      if (
        currentStock &&
        (validatedData.stockMovementType === "CONSUME" ||
          validatedData.stockMovementType === "SALE")
      ) {
        movement = await stockMovementsRepository.create(
          { ...createdStockMovement, destinationLocationId: null },
          tx,
        );

        await stockRepository.update(
          currentStock.id,
          { quantity: { decrement: validatedData.quantity } },
          tx,
        );
      }

      // DISCARD Case
      if (currentStock && validatedData.stockMovementType === "DISCARD") {
        movement = await stockMovementsRepository.create(
          { ...createdStockMovement, destinationLocationId: null },
          tx,
        );

        await stockRepository.update(
          currentStock.id,
          { quantity: { decrement: validatedData.quantity } },
          tx,
        );
      }

      // LANDURY_OUT Case
      if (currentStock && validatedData.stockMovementType === "LAUNDRY_OUT") {
        movement = await stockMovementsRepository.create(
          { ...createdStockMovement, destinationLocationId: null },
          tx,
        );

        await stockRepository.update(
          currentStock.id,
          { quantity: { decrement: validatedData.quantity } },
          tx,
        );
      }

      if (movement) {
        await auditLogsRepository.create(
          {
            userId: session.id,
            action: "CREATE",
            entity: "STOCK_MOVEMENT",
            entityId: movement.id,
            metadata: {
              itemId: movement.itemId,
              stockId: movement.stockId,
              type: movement.type,
              quantity: movement.quantity,
              totalCost: movement.totalCost,
              sourceLocationId: movement.sourceLocationId,
              destinationLocationId: movement.destinationLocationId,
              orderId: movement.orderId,
            },
          },
          tx,
        );
      }

      return movement;
    });

    if (!result)
      throw badRequest(
        "Something went wrong, no stock movement record has created",
      );

    return {
      message: "Stock movement created successfully",
      id: result?.id,
    };
  },

  getById: async (movementId: string) => {
    const session = await sessionValidation();

    if (!canManageItem(session.role)) {
      throw forbidden("You're not allowed to access this feature");
    }

    const selectData = createSelectStockMovementData({
      id: true,
      quantity: true,
      totalCost: true,
      type: true,
      reason: true,
      itemId: true,
      stockId: true,
      sourceLocationId: true,
      destinationLocationId: true,
      orderId: true,
      createdAt: true,
      item: { select: { id: true, name: true } },
      stock: { select: { id: true, quantity: true, type: true } },
      sourceLocation: { select: { id: true, name: true } },
      destinationLocation: { select: { id: true, name: true } },
      order: { select: { id: true, roomNumber: true, guestName: true } },
      user: { select: { id: true, name: true } },
    });

    const movement = await stockMovementsRepository.getById(
      movementId,
      selectData,
      prisma,
    );

    if (!movement) throw notFound("Stock movement not found");

    return {
      message: "Stock movement retrieved successfully",
      data: movement,
    };
  },

  getMany: async (params: { [key: string]: string }) => {
    const session = await sessionValidation();
    const validatedParams = stockMovementGetManySchema.parse(params);

    if (!canManageItem(session.role)) {
      throw forbidden("You're not allowed to access this feature");
    }

    let whereQuery: Prisma.StockMovementWhereInput = {};

    if (
      validatedParams.searchQuery &&
      validatedParams.searchQuery.length >= 3 &&
      validatedParams.sortBy === "name"
    ) {
      whereQuery.OR = [
        {
          item: {
            name: {
              contains: validatedParams.searchQuery,
              mode: "insensitive",
            },
          },
        },
        {
          reason: {
            contains: validatedParams.searchQuery,
            mode: "insensitive",
          },
        },
      ];
    }

    if (validatedParams.type && validatedParams.sortBy === "type") {
      whereQuery.type = validatedParams.type;
    }

    if (
      validatedParams.sourceLocationId &&
      validatedParams.sortBy === "sourceLocation"
    ) {
      whereQuery.sourceLocationId = validatedParams.sourceLocationId;
    }

    if (
      validatedParams.destinationLocationId &&
      validatedParams.sortBy === "destinationLocation"
    ) {
      whereQuery.destinationLocationId = validatedParams.destinationLocationId;
    }

    const selectData = createSelectStockMovementData({
      id: true,
      quantity: true,
      totalCost: true,
      type: true,
      reason: true,
      itemId: true,
      stockId: true,
      sourceLocationId: true,
      destinationLocationId: true,
      orderId: true,
      createdAt: true,
      item: { select: { id: true, name: true } },
      stock: { select: { id: true, quantity: true, type: true } },
      sourceLocation: { select: { id: true, name: true } },
      destinationLocation: { select: { id: true, name: true } },
      order: { select: { id: true, roomNumber: true, guestName: true } },
      user: { select: { id: true, name: true } },
    });

    const skip = (validatedParams.page - 1) * validatedParams.dataPerPage;
    const take = validatedParams.dataPerPage;

    const [movements, totalCount] = await Promise.all([
      stockMovementsRepository.getMany(
        whereQuery,
        selectData,
        skip,
        take,
        validatedParams.sortBy,
        validatedParams.sortOrder,
        prisma,
      ),
      stockMovementsRepository.countRows(whereQuery, prisma),
    ]);

    return {
      message: "Stock movements retrieved successfully",
      data: { movements, totalCount },
    };
  },

  update: async (movementId: string, rawData: StockMovementUpdateSchema) => {
    const session = await sessionValidation();
    const validatedData = stockMovementUpdateSchema.parse(rawData);

    if (!canManageItem(session.role)) {
      throw forbidden("You're not allowed to access this feature");
    }

    const result = await prisma.$transaction(async (tx) => {
      const existing = await stockMovementsRepository.getById(
        movementId,
        { id: true, reason: true },
        tx,
      );

      if (!existing) throw notFound("Stock movement not found");

      const movement = await stockMovementsRepository.update(
        movementId,
        { reason: validatedData.reason },
        tx,
      );

      await auditLogsRepository.create(
        {
          userId: session.id,
          action: "UPDATE",
          entity: "STOCK_MOVEMENT",
          entityId: movement.id,
          metadata: {
            id: movement.id,
            old: { reason: existing.reason },
            new: { reason: movement.reason },
          },
        },
        tx,
      );

      return movement;
    });

    return {
      message: "Stock movement updated successfully",
      id: result.id,
    };
  },

  // Disable for a while, not allowed to do regular delete
  //   delete: async (movementId: string) => {
  //     const session = await sessionValidation();

  //     if (!canDeleteItem(session.role)) {
  //       throw forbidden("You're not allowed to access this feature");
  //     }

  //     await prisma.$transaction(async (tx) => {
  //       const existing = await stockMovementsRepository.getById(
  //         movementId,
  //         { id: true, itemId: true, type: true, quantity: true },
  //         tx,
  //       );

  //       if (!existing) throw notFound("Stock movement not found");

  //       const movement = await stockMovementsRepository.delete(movementId, tx);

  //       await auditLogsRepository.create(
  //         {
  //           userId: session.id,
  //           action: "DELETE",
  //           entity: "STOCK_MOVEMENT",
  //           entityId: movement.id,
  //           metadata: {
  //             id: existing.id,
  //             itemId: existing.itemId,
  //             type: existing.type,
  //             quantity: existing.quantity,
  //           },
  //         },
  //         tx,
  //       );

  //       return movement;
  //     });

  //     return {
  //       message: "Stock movement deleted successfully",
  //     };
  //   },
};

export default stockMovementsService;
