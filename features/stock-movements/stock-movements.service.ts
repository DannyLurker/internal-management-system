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

const stockMovementsService = {
  create: async (rawData: StockMovementCreateSchema) => {
    const session = await sessionValidation();
    const validatedData = stockMovementCreateSchema.parse(rawData);

    if (!canManageItem(session.role)) {
      throw forbidden("You're not allowed to access this feature");
    }

    const result = await prisma.$transaction(async (tx) => {
      // Check if item exists
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

      // Allows stockId to be null for 'RECEIVE' movements to record a global intake transaction.
      // This unassigned stock can later be distributed to specific locations and stock records.
      if (
        validatedData.stockMovementType === "RECEIVE" &&
        validatedData.stockId === null
      ) {
        movement = await stockMovementsRepository.create(
          createdStockMovement,
          tx,
        );
      }

      // increment the quantity field in the stock model if the stock.id is found and the stock movement type is increaseStockQuantityMovementType
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

        stockRepository.update(
          currentStock.id,
          {
            quantity: {
              increment: validatedData.quantity,
            },
          },
          tx,
        );
      }

      // stock movement type === "TRANSFER" case
      const isSourceLocationValid =
        currentStock?.locationId === validatedData.sourceLocationId;

      if (
        currentStock &&
        validatedData.stockMovementType === "TRANSFER" &&
        validatedData.stockTransferType &&
        isSourceLocationValid &&
        validatedData.destinationLocationId !== currentStock.locationId
      ) {
        let destinationStock = await stockRepository.findFirst(
          {
            itemId: validatedData.itemId,
            locationId: validatedData.destinationLocationId,
            expiredAt: currentStock?.expiredAt,
            type: validatedData.stockTransferType,
          },
          tx,
        );

        if (currentStock.quantity < validatedData.quantity)
          throw badRequest("Insufficient stock quantity.");

        if (!destinationStock) {
          destinationStock = await stockRepository.create(
            {
              item: {
                connect: { id: validatedData.itemId },
              },
              creator: {
                connect: { id: session.id },
              },
              quantity: validatedData.quantity,
              location: {
                connect: { id: validatedData.destinationLocationId },
              },
              expiredAt: currentStock.expiredAt,
              type: validatedData.stockTransferType,
            },
            tx,
          );
        } else {
          await stockRepository.update(
            destinationStock.id,
            {
              quantity: {
                increment: validatedData.quantity,
              },
            },
            tx,
          );

          await stockRepository.update(
            currentStock.id,
            {
              quantity: {
                decrement: validatedData.quantity,
              },
            },
            tx,
          );
        }

        movement = await stockMovementsRepository.create(
          { ...createdStockMovement, stockId: destinationStock.id },
          tx,
        );
      }

      // Quantity which is in ADJUSTMENT stock movement type can be positive or negative
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
          {
            quantity: {
              increment: validatedData.quantity,
            },
          },
          tx,
        );
      }

      //Mark as damaged
      if (
        currentStock &&
        validatedData.stockMovementType === "MARK_AS_DAMAGED"
      ) {
        const calculatedQuantity =
          currentStock.quantity - validatedData.quantity;

        if (calculatedQuantity < 0)
          throw badRequest("Insufficient stock quantity.");

        let damagedStock = await stockRepository.findFirst(
          {
            itemId: currentStock.itemId,
            locationId: currentStock.locationId,
            type: "DAMAGED",
            expiredAt: currentStock.expiredAt,
          },
          tx,
        );

        await stockRepository.update(
          currentStock.id,
          {
            quantity: {
              decrement: validatedData.quantity,
            },
          },
          tx,
        );

        if (damagedStock) {
          await stockRepository.update(
            damagedStock.id,
            {
              quantity: {
                increment: validatedData.quantity,
              },
            },
            tx,
          );
        } else {
          damagedStock = await stockRepository.create(
            {
              item: {
                connect: {
                  id: currentStock.itemId,
                },
              },
              location: {
                connect: {
                  id: currentStock.locationId,
                },
              },
              creator: {
                connect: {
                  id: session.id,
                },
              },
              quantity: validatedData.quantity,
              type: "DAMAGED",
              expiredAt: currentStock.expiredAt,
            },
            tx,
          );
        }

        movement = await stockMovementsRepository.create(
          {
            ...createdStockMovement,
            stockId: damagedStock.id,
            type: "MARK_AS_DAMAGED",
            sourceLocationId: currentStock.locationId,
            destinationLocationId: currentStock.locationId,
          },
          tx,
        );
      }

      // Laundry out case (manual)
      if (currentStock && validatedData.stockMovementType === "MARK_AS_DIRTY") {
        const calculatedQuantity =
          currentStock.quantity - validatedData.quantity;

        if (calculatedQuantity < 0)
          throw badRequest("Insufficient stock quantity.");

        let dirtyStock = await stockRepository.findFirst(
          {
            itemId: currentStock.itemId,
            locationId: currentStock.locationId,
            type: "DIRTY",
            expiredAt: currentStock.expiredAt,
          },
          tx,
        );

        await stockRepository.update(
          currentStock.id,
          {
            quantity: {
              decrement: validatedData.quantity,
            },
          },
          tx,
        );

        if (dirtyStock) {
          await stockRepository.update(
            dirtyStock.id,
            {
              quantity: {
                increment: validatedData.quantity,
              },
            },
            tx,
          );
        } else {
          dirtyStock = await stockRepository.create(
            {
              item: {
                connect: {
                  id: currentStock.itemId,
                },
              },
              location: {
                connect: {
                  id: currentStock.locationId,
                },
              },
              creator: {
                connect: {
                  id: session.id,
                },
              },
              quantity: validatedData.quantity,
              type: "DIRTY",
              expiredAt: currentStock.expiredAt,
            },
            tx,
          );
        }

        movement = await stockMovementsRepository.create(
          {
            ...createdStockMovement,
            stockId: dirtyStock.id,
            type: "MARK_AS_DIRTY",
            sourceLocationId: currentStock.locationId,
            destinationLocationId: currentStock.locationId,
          },
          tx,
        );
      }

      // Consume caseh
      if (
        currentStock &&
        (validatedData.stockMovementType === "CONSUME" ||
          validatedData.stockMovementType === "SALE")
      ) {
        movement = await stockMovementsRepository.create(
          { ...createdStockMovement, destinationLocationId: null },
          tx,
        );

        stockRepository.update(
          currentStock.id,
          {
            quantity: {
              decrement: validatedData.quantity,
            },
          },
          tx,
        );
      }

      if (
        (currentStock?.type === "DAMAGED" || currentStock?.type === "DIRTY") &&
        (validatedData.stockMovementType === "LAUNDRY_OUT" ||
          validatedData.stockMovementType == "DISCARD")
      ) {
        movement = await stockMovementsRepository.create(
          { ...createdStockMovement, destinationLocationId: null },
          tx,
        );

        stockRepository.update(
          currentStock.id,
          {
            quantity: {
              decrement: validatedData.quantity,
            },
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
        "No movement record has created. Can't directly delete or laundry out item from the stock that is not in type of DAMAGED or DIRTY",
      );

    return {
      message: "Stock movement created successfully",
      id: result?.id,
    };
  },

  quickDiscard: async (rawData: StockMovementCreateSchema) => {},

  quickLaundryOut: async (rawData: StockMovementCreateSchema) => {},

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
