import prisma from "@/shared/db/prisma";
import { forbidden, notFound } from "@/shared/lib/error-handlers";
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
import { Prisma } from "@prisma/client";
import itemRepository from "../items/item.repository";
import { locationRepository } from "../locations/location.repository";
import { stockRepository } from "../stocks/stock.repository";
import orderRepository from "../orders/order-repository";

const stockMovementsService = {
  create: async (rawData: StockMovementCreateSchema) => {
    const session = await sessionValidation();
    const validatedData = stockMovementCreateSchema.parse(rawData);

    if (!canManageItem(session.role)) {
      throw forbidden("You're not allowed to access this feature");
    }

    const result = await prisma.$transaction(async (tx) => {
      // Check if item exists
      const [item, stock, sourceLoc, destLoc, order] = await Promise.all([
        itemRepository.findById(validatedData.itemId, tx),
        validatedData.stockId
          ? stockRepository.findById(validatedData.stockId, tx)
          : null,
        validatedData.sourceLocationId
          ? locationRepository.findById(validatedData.sourceLocationId, tx)
          : null,
        validatedData.destinationLocationId
          ? locationRepository.findById(validatedData.destinationLocationId, tx)
          : null,
        validatedData.orderId
          ? orderRepository.findById(validatedData.orderId, tx)
          : null,
      ]);

      if (!item) throw notFound("Item not found");
      if (validatedData.stockId && !stock) throw notFound("Stock not found");
      if (validatedData.sourceLocationId && !sourceLoc)
        throw notFound("Source location not found");
      if (validatedData.destinationLocationId && !destLoc)
        throw notFound("Destination location not found");
      if (validatedData.orderId && !order) throw notFound("Order not found");

      const movement = await stockMovementsRepository.create(
        {
          itemId: validatedData.itemId,
          stockId: validatedData.stockId,
          type: validatedData.type,
          quantity: validatedData.quantity,
          totalCost: validatedData.totalCost,
          reason: validatedData.reason,
          sourceLocationId: validatedData.sourceLocationId,
          destinationLocationId: validatedData.destinationLocationId,
          orderId: validatedData.orderId,
          createdBy: session.id,
        },
        tx,
      );

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

      return movement;
    });

    return {
      message: "Stock movement created successfully",
      id: result.id,
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
      item: {
        select: {
          id: true,
          name: true,
        },
      },
      stock: {
        select: {
          id: true,
          quantity: true,
          type: true,
        },
      },
      sourceLocation: {
        select: {
          id: true,
          name: true,
        },
      },
      destinationLocation: {
        select: {
          id: true,
          name: true,
        },
      },
      order: {
        select: {
          id: true,
          roomNumber: true,
          guestName: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
        },
      },
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

    if (validatedParams.searchQuery) {
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

    if (validatedParams.type) {
      whereQuery.type = validatedParams.type;
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
      item: {
        select: {
          id: true,
          name: true,
        },
      },
      stock: {
        select: {
          id: true,
          quantity: true,
          type: true,
        },
      },
      sourceLocation: {
        select: {
          id: true,
          name: true,
        },
      },
      destinationLocation: {
        select: {
          id: true,
          name: true,
        },
      },
      order: {
        select: {
          id: true,
          roomNumber: true,
          guestName: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
        },
      },
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
      stockMovementsRepository.count(whereQuery, prisma),
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
            old: {
              reason: existing.reason,
            },
            new: {
              reason: movement.reason,
            },
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
