import { badRequest, forbidden, notFound } from "@/shared/lib/error-handlers";
import { canManageItem } from "@/shared/lib/validations/user-access-validation";
import {
  StockMovementCreateSchema,
  StockMovementGetManySchema,
  stockMovementGetManySchema,
  StockMovementUpdateSchema,
} from "@/shared/lib/zods/stock-movements.zod";
import stockMovementsRepository, {
  createSelectStockMovementData,
} from "./stock-movements.repository";
import auditLogsRepository from "../audit-logs/audit-log.repository";
import { MovementType, Prisma, PrismaClient } from "@prisma/client";
import itemRepository from "../items/item.repository";
import { locationRepository } from "../locations/location.repository";
import { stockRepository, stockWhereInput } from "../stocks/stock.repository";
import orderRepository from "../orders/order-repository";
import { TargetStockType } from "./stock-movements.types";
import {
  automaticTotalCostCalculationType,
  markStockAs,
} from "./stock-movements.utils";
import { Session } from "next-auth";
import { laundryRepository } from "../laundries/laundry.repository";

const stockMovementsService = {
  create: async (
    session: Session["user"],
    payload: StockMovementCreateSchema,
    prisma: PrismaClient,
  ) => {
    const result = await prisma.$transaction(async (tx) => {
      const [item, currentStock, destLoc, order] = await Promise.all([
        itemRepository.findById(payload.itemId, tx),
        payload.stockId ? stockRepository.findById(payload.stockId, tx) : null,
        payload.destinationLocationId
          ? locationRepository.findById(payload.destinationLocationId, tx)
          : null,
        payload.orderId ? orderRepository.findById(payload.orderId, tx) : null,
      ]);

      if (!item) throw notFound("Item not found");
      if (payload.stockId && !currentStock) throw notFound("Stock not found");
      if (payload.destinationLocationId && !destLoc)
        throw notFound("Destination location not found");
      if (payload.orderId && !order) throw notFound("Order not found");

      // Rule 1: Movement types below require an existing stock row to operate on.
      const TYPES_REQUIRING_STOCK_ID: MovementType[] = [
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
        TYPES_REQUIRING_STOCK_ID.includes(payload.stockMovementType) &&
        !currentStock &&
        !payload.isGlobalStock
      ) {
        throw badRequest(
          `stockId is required for movement type '${payload.stockMovementType}'`,
        );
      }

      // Rule 2: LAUNDRY_IN can only target READY stocks
      if (
        payload.stockMovementType === "LAUNDRY_IN" &&
        currentStock &&
        currentStock.type !== "READY"
      ) {
        throw badRequest(
          "'Laundry In' type can only be located to the stock with ready type",
        );
      }

      let movement;

      const createdStockMovement: Prisma.StockMovementUncheckedCreateInput = {
        itemId: payload.itemId,
        itemName: item.name,
        stockId: payload.stockId,
        type: payload.stockMovementType,
        quantity: payload.quantity,
        totalCost: payload.totalCost,
        reason: payload.reason,
        destinationLocationId: payload.destinationLocationId,
        orderId: payload.orderId,
        createdBy: session.id,
      };

      // Allows stockId to be null for 'RECEIVE' movements to record a global
      // intake transaction. This unassigned stock can later be distributed
      // to specific locations and stock records.
      if (payload.stockMovementType === "RECEIVE" && !payload.stockId) {
        movement = await stockMovementsRepository.create(
          { ...createdStockMovement, sourceLocationId: null },
          tx,
        );
      }

      // Skip source location validation for TRANSFER movements involving unlocated (global) stock.
      if (payload.isGlobalStock && payload.stockMovementType === "TRANSFER") {
        const globalStockQuantity =
          await stockMovementsRepository.countQuantity(
            {
              stockId: null,
              itemId: item?.id,
              destinationLocationId: null,
              sourceLocationId: null,
              type: "RECEIVE",
            },
            tx,
          );

        if (!globalStockQuantity) throw badRequest("Global stock not found");

        if (globalStockQuantity < payload.quantity)
          throw badRequest("Insufficient stock quantity.");

        const destinationStock = await stockRepository.findOrUpdateOrCreate(
          // Find
          {
            expiredAt: payload.expiredAt ?? null,
            locationId: destLoc?.id,
            itemId: item.id,
            type: "READY",
          },
          // Update
          {
            quantity: {
              increment: payload.quantity,
            },
            totalCost: {
              increment: payload.totalCost ?? 0,
            },
          },
          // Create
          {
            item: { connect: { id: payload.itemId } },
            creator: { connect: { id: session.id } },
            quantity: payload.quantity,
            location: {
              connect: { id: payload.destinationLocationId },
            },
            expiredAt: payload.expiredAt,
            type: "READY",
          },
          prisma,
        );

        await stockMovementsRepository.create(
          {
            ...createdStockMovement,
            stockId: null,
            destinationLocationId: null,
            sourceLocationId: null,
            type: "TRANSFER",
            quantity: -payload.quantity,
          },
          tx,
        );

        movement = await stockMovementsRepository.create(
          {
            ...createdStockMovement,
            stockId: destinationStock.id,
            totalCost: null,
          },
          tx,
        );
      }

      // RECEIVE
      if (currentStock?.id && payload.stockMovementType === "RECEIVE") {
        movement = await stockMovementsRepository.create(
          {
            ...createdStockMovement,
            sourceLocationId: null,
            destinationLocationId: currentStock.locationId,
          },
          tx,
        );

        await stockRepository.update(
          currentStock.id,
          {
            quantity: { increment: payload.quantity },
            totalCost: { increment: payload.totalCost },
          },
          tx,
        );
      }

      // TRANSFER, in a regular transfer, current location is needed and the system takes it from retrieving stock data
      if (
        currentStock &&
        payload.stockMovementType === "TRANSFER" &&
        !payload.isGlobalStock
      ) {
        if (payload.destinationLocationId === currentStock.locationId)
          throw badRequest(
            "Source location and destination location can't be same",
          );

        if (currentStock.quantity < payload.quantity)
          throw badRequest("Insufficient stock quantity.");

        // Calculate proportional transfer cost based on source unit cost
        const unitCost =
          currentStock.quantity > 0
            ? (currentStock.totalCost ?? 0) / currentStock.quantity
            : 0;
        const transferCost = payload.quantity * unitCost;

        const destinationStock = await stockRepository.findOrUpdateOrCreate(
          {
            expiredAt: currentStock.expiredAt,
            locationId: destLoc?.id,
            itemId: currentStock.itemId,
            type: currentStock.type,
          },
          {
            quantity: { increment: payload.quantity },
            totalCost: { increment: transferCost }, // Fixed
          },
          {
            item: { connect: { id: payload.itemId } },
            creator: { connect: { id: session.id } },
            quantity: payload.quantity,
            totalCost: transferCost,
            location: { connect: { id: payload.destinationLocationId } },
            expiredAt: currentStock.expiredAt,
            type: currentStock.type,
          },
          prisma,
        );

        await stockRepository.update(
          currentStock.id,
          {
            quantity: { decrement: payload.quantity },
            totalCost: { decrement: transferCost }, // Fixed
          },
          prisma,
        );

        movement = await stockMovementsRepository.create(
          {
            ...createdStockMovement,
            stockId: destinationStock.id,
            sourceLocationId: currentStock.locationId,
            totalCost: transferCost,
          },
          tx,
        );
      }

      // ADJUSTMENT (quantity can be positive or negative)
      if (currentStock && payload.stockMovementType === "ADJUSTMENT") {
        const calculatedQuantity = currentStock.quantity + payload.quantity;

        if (calculatedQuantity < 0)
          throw badRequest("Insufficient stock quantity.");

        // Calculate adjustment cost
        const unitCost =
          currentStock.quantity > 0
            ? (currentStock.totalCost ?? 0) / currentStock.quantity
            : 0;
        const adjustmentCost = payload.totalCost ?? payload.quantity * unitCost;

        movement = await stockMovementsRepository.create(
          {
            ...createdStockMovement,
            sourceLocationId: currentStock.locationId,
            destinationLocationId: currentStock.locationId,
            totalCost: adjustmentCost,
          },
          tx,
        );

        await stockRepository.update(
          currentStock.id,
          {
            quantity: { increment: payload.quantity },
            totalCost: { increment: adjustmentCost }, // Fixed
          },
          tx,
        );
      }

      // MARK_AS_DAMAGED / MARK_AS_DIRTY / MARK_AS_LOST / MARK_AS_EXPIRED
      if (
        currentStock &&
        (payload.stockMovementType === "MARK_AS_DAMAGED" ||
          payload.stockMovementType === "MARK_AS_DIRTY" ||
          payload.stockMovementType === "MARK_AS_LOST" ||
          payload.stockMovementType === "MARK_AS_EXPIRED")
      ) {
        const targetType = payload.stockMovementType.replace(
          "MARK_AS_",
          "",
        ) as TargetStockType;

        movement = await markStockAs(
          currentStock,
          targetType,
          payload.quantity,
          session,
          createdStockMovement,
          tx,
        );
      }

      if (
        currentStock &&
        currentStock.type === "LOST" &&
        payload.stockMovementType === "DISCARD"
      ) {
        throw badRequest("Can't delete a lost item");
      }

      if (
        currentStock &&
        automaticTotalCostCalculationType.includes(payload.stockMovementType)
      ) {
        if (currentStock.quantity < payload.quantity) {
          throw badRequest("Insufficient stock quantity.");
        }

        const unitCost =
          currentStock.quantity > 0
            ? (currentStock.totalCost ?? 0) / currentStock.quantity
            : 0;
        const costToDeduct = payload.quantity * unitCost;

        movement = await stockMovementsRepository.create(
          {
            ...createdStockMovement,
            destinationLocationId: null,
            totalCost: costToDeduct,
          },
          tx,
        );

        await stockRepository.update(
          currentStock.id,
          {
            quantity: { decrement: payload.quantity },
            totalCost: { decrement: costToDeduct }, // Fixed
          },
          tx,
        );
      }

      // Laundry IN
      if (currentStock && payload.stockMovementType === "LAUNDRY_IN") {
        // const laundryOutStockWhereQuery = stockWhereInput({
        //   id: currentStock.id,
        //   type: "EXPIRED"
        // });

        // const laundryOutStocks = stockRepository.getMany();

        const unitCost =
          currentStock.quantity > 0
            ? (currentStock.totalCost ?? 0) / currentStock.quantity
            : 0;
        const costToAdd = payload.quantity * unitCost;

        movement = await stockMovementsRepository.create(
          {
            ...createdStockMovement,
            destinationLocationId: null,
            totalCost: costToAdd,
          },
          tx,
        );

        await stockRepository.update(
          currentStock.id,
          {
            quantity: { increment: payload.quantity },
            totalCost: { increment: costToAdd },
          },
          tx,
        );
      }

      // Laundry Out
      if (currentStock && payload.stockMovementType === "LAUNDRY_OUT") {
        if (currentStock.location?.type === "VENDOR_LAUNDRY") {
          throw badRequest(
            "Can't make a movement from location with 'Vendor Laundry' type.",
          );
        }

        if (currentStock.quantity < payload.quantity) {
          throw badRequest("Insufficient stock quantity.");
        }

        const unitCost =
          currentStock.quantity > 0
            ? (currentStock.totalCost ?? 0) / currentStock.quantity
            : 0;
        const totalCost = unitCost * payload.quantity;

        const destinationStockWhereInput = stockWhereInput({
          locationId: payload.destinationLocationId,
          itemId: currentStock.itemId,
          expiredAt: currentStock.expiredAt,
          type: currentStock.type,
        });

        const createDestinationStock: Prisma.StockCreateInput = {
          location: {
            connect: { id: payload.destinationLocationId },
          },
          quantity: payload.quantity,
          item: { connect: { id: currentStock.itemId } },
          totalCost: totalCost,
          expiredAt: currentStock.expiredAt,
          type: currentStock.type,
          creator: {
            connect: {
              id: session.id,
            },
          },
        };

        const destinationStock = await stockRepository.findOrUpdateOrCreate(
          destinationStockWhereInput,
          {
            quantity: {
              increment: payload.quantity,
            },
            totalCost: {
              increment: totalCost,
            },
          },
          createDestinationStock,
          tx,
        );

        const location = await locationRepository.findById(
          destinationStock.locationId,
          tx,
        );

        if (location && location.type !== "VENDOR_LAUNDRY") {
          throw badRequest(
            "When perform a 'Laundry Out' the destination location must be 'Vendor Laundry' type ",
          );
        }

        await laundryRepository.create(
          {
            item: {
              connect: { id: currentStock.itemId },
            },
            vendorLaundryStock: {
              connect: { id: destinationStock.id },
            },
            quantity: payload.quantity,
            totalLaundryPrice: payload.laundryTotalCost,
            status: "SENT",
            sourceLocation: { connect: { id: currentStock.locationId } },
            destinationLocation: {
              connect: { id: destinationStock.locationId },
            },
            reason: payload.reason,
          },
          tx,
        );

        movement = await stockMovementsRepository.create(
          {
            ...createdStockMovement,
            stockId: destinationStock.id,
            destinationLocationId: destinationStock.locationId,
            totalCost: totalCost,
          },
          tx,
        );

        await stockRepository.update(
          currentStock.id,
          {
            quantity: { decrement: payload.quantity },
            totalCost: { decrement: totalCost },
          },
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
      stockMovementId: result.id,
      stockmovementType: result.type,
      stockId: result.stockId,
      itemId: result.itemId,
    };
  },

  getById: async (
    session: Session["user"],
    movementId: string,
    prisma: PrismaClient,
  ) => {
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

  getMany: async (
    session: Session["user"],
    params: StockMovementGetManySchema,
    prisma: PrismaClient,
  ) => {
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
          itemName: {
            contains: validatedParams.searchQuery,
            mode: "insensitive",
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
      itemName: true,
      stockId: true,
      sourceLocationId: true,
      destinationLocationId: true,
      orderId: true,
      createdAt: true,
      item: { select: { id: true } },
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

  update: async (
    session: Session["user"],
    movementId: string,
    data: StockMovementUpdateSchema,
    prisma: PrismaClient,
  ) => {
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
        { reason: data.reason },
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
      itemId: result.itemId,
      stockId: result.stockId,
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
