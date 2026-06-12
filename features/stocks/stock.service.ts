import prisma from "@/shared/db/prisma";
import { badRequest, forbidden, notFound } from "@/shared/lib/error-handlers";
import {
  canDeleteItem,
  canManageItem,
} from "@/shared/lib/validations/user-access-validation";
import sessionValidation from "@/shared/lib/validations/user-session-validation";
import {
  stockCreateSchema,
  StockCreateSchema,
  stockGetSchema,
  stockUpdateSchema,
  StockUpdateSchema,
} from "@/shared/lib/zods/stock.zod";
import auditLogsRepository from "../audit-logs/audit-log.repository";
import {
  stockRepository,
  stockSelectData,
  stockWhereUniqueInput,
} from "./stock.repository";
import { Prisma, StockType } from "@prisma/client";

const stockService = {
  create: async (rawData: StockCreateSchema) => {
    const session = await sessionValidation();
    const validatedData = stockCreateSchema.parse(rawData);

    if (!canManageItem(session.role)) {
      throw forbidden("You're not allowed to access this feature");
    }

    const created = await prisma.$transaction(async (tx) => {
      // Check if stock with same itemId, locationId, and type already exists
      const existing = await tx.stock.findFirst({
        where: {
          itemId: validatedData.itemId,
          locationId: validatedData.locationId,
          type: validatedData.type as StockType,
          expiredAt: validatedData.expiredAt,
        },
      });

      // Check if item exists
      const item = await tx.item.findUnique({
        where: { id: validatedData.itemId },
      });
      if (!item) {
        throw notFound("Item not found");
      }

      // Check if location exists
      const location = await tx.location.findUnique({
        where: { id: validatedData.locationId },
      });
      if (!location) {
        throw notFound("Location not found");
      }

      let stock;

      if (existing) {
        stock = await stockRepository.update(
          existing.id,
          {
            quantity: {
              increment: validatedData.quantity,
            },
            movements: {
              create: {
                type: "RECEIVE",
                quantity: validatedData.quantity,
                itemId: validatedData.itemId,
                destinationLocationId: validatedData.locationId,
                createdBy: session.id,
                reason: validatedData.reason,
                totalCost: validatedData.totalCost,
              },
            },
          },
          tx,
        );
      } else {
        stock = await stockRepository.create(
          {
            quantity: validatedData.quantity,
            type: validatedData.type as StockType,
            expiredAt: validatedData.expiredAt,
            item: {
              connect: {
                id: validatedData.itemId,
              },
            },
            location: {
              connect: {
                id: validatedData.locationId,
              },
            },
            creator: {
              connect: {
                id: session.id,
              },
            },
            movements: {
              create: {
                type: "RECEIVE",
                quantity: validatedData.quantity,
                itemId: validatedData.itemId,
                destinationLocationId: validatedData.locationId,
                createdBy: session.id,
                reason: validatedData.reason,
                totalCost: validatedData.totalCost,
              },
            },
          },
          tx,
        );
      }

      await auditLogsRepository.create(
        {
          userId: session.id,
          action: "CREATE",
          entity: "STOCK",
          entityId: stock.id,
          metadata: {
            itemId: stock.itemId,
            locationId: stock.locationId,
            quantity: stock.quantity,
            type: stock.type,
            expiredAt: stock.expiredAt,
          },
        },
        tx,
      );

      return stock;
    });

    return {
      message: `Stock created successfully`,
      id: created.id,
    };
  },

  get: async (stockId: string) => {
    const session = await sessionValidation();

    if (!canManageItem(session.role)) {
      throw forbidden("You're not allowed to access this feature");
    }

    const whereQuery = stockWhereUniqueInput({
      id: stockId,
    });

    const selectData = stockSelectData({
      id: true,
      quantity: true,
      type: true,
      expiredAt: true,
      itemId: true,
      locationId: true,
      createdAt: true,
      updatedAt: true,
      item: {
        select: {
          id: true,
          name: true,
        },
      },
      location: {
        select: {
          id: true,
          name: true,
        },
      },
      creator: {
        select: {
          id: true,
          name: true,
        },
      },
    });

    const stock = await stockRepository.get(whereQuery, selectData, prisma);

    if (!stock) throw notFound("Stock not found");

    return {
      message: "Stock retrieved successfully",
      data: stock,
    };
  },

  getMany: async (params: { [key: string]: string }) => {
    const session = await sessionValidation();
    const validatedParams = stockGetSchema.parse(params);

    if (!canManageItem(session.role)) {
      throw forbidden("You're not allowed to access this feature");
    }

    let whereQuery: Prisma.StockWhereInput = {};

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
          location: {
            name: {
              contains: validatedParams.searchQuery,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    if (validatedParams.type) {
      whereQuery.type = validatedParams.type;
    }
    if (validatedParams.locationId) {
      whereQuery.locationId = validatedParams.locationId;
    }
    if (validatedParams.itemId) {
      whereQuery.itemId = validatedParams.itemId;
    }

    const selectData = stockSelectData({
      id: true,
      quantity: true,
      type: true,
      expiredAt: true,
      itemId: true,
      locationId: true,
      createdAt: true,
      updatedAt: true,
      item: {
        select: {
          id: true,
          name: true,
        },
      },
      location: {
        select: {
          id: true,
          name: true,
        },
      },
      creator: {
        select: {
          id: true,
          name: true,
        },
      },
    });

    const skip = (validatedParams.page - 1) * validatedParams.dataPerPage;
    const take = validatedParams.dataPerPage;

    const stocks = await stockRepository.getMany(
      whereQuery,
      selectData,
      skip,
      take,
      validatedParams.sortOrder,
      validatedParams.sortBy,
      prisma,
    );

    const totalCount = await prisma.stock.count({
      where: whereQuery,
    });

    return {
      message: "Stocks retrieved successfully",
      data: { stocks, totalCount },
    };
  },

  update: async (rawData: StockUpdateSchema) => {
    const session = await sessionValidation();
    const validatedData = stockUpdateSchema.parse(rawData);

    if (!canManageItem(session.role)) {
      throw forbidden("You're not allowed to access this feature");
    }

    await prisma.$transaction(async (tx) => {
      const selectData = stockSelectData({
        quantity: true,
        type: true,
        expiredAt: true,
        locationId: true,
        itemId: true,
      });

      const existing = await stockRepository.get(
        { id: validatedData.stockId },
        selectData,
        tx,
      );
      if (!existing) throw notFound("Stock not found");

      // Check unique constraint if locationId or type is changing
      if (
        validatedData.locationId !== existing.locationId ||
        validatedData.type !== existing.type ||
        validatedData.expiredAt !== existing.expiredAt
      ) {
        const existingConflict = await tx.stock.findFirst({
          where: {
            itemId: existing.itemId,
            locationId: validatedData.locationId,
            type: validatedData.type as StockType,
            expiredAt: validatedData.expiredAt,
          },
        });

        if (existingConflict && existingConflict.id !== validatedData.stockId) {
          throw badRequest(
            "Another stock with this item, location, and type already exists",
          );
        }
      }

      // Check if location exists
      const location = await tx.location.findUnique({
        where: { id: validatedData.locationId },
      });
      if (!location) {
        throw notFound("Location not found");
      }

      const stock = await stockRepository.update(
        validatedData.stockId,
        {
          quantity: validatedData.quantity,
          type: validatedData.type as StockType,
          expiredAt: validatedData.expiredAt,
          location: {
            connect: {
              id: validatedData.locationId,
            },
          },
        },
        tx,
      );

      await auditLogsRepository.create(
        {
          userId: session.id,
          action: "UPDATE",
          entity: "STOCK",
          entityId: stock.id,
          metadata: {
            id: stock.id,
            old: {
              quantity: existing.quantity,
              type: existing.type,
              expiredAt: existing.expiredAt,
              locationId: existing.locationId,
            },
            new: {
              quantity: stock.quantity,
              type: stock.type,
              expiredAt: stock.expiredAt,
              locationId: stock.locationId,
            },
          },
        },
        tx,
      );
    });

    return {
      message: `Stock updated successfully`,
    };
  },

  delete: async (stockId: string) => {
    const session = await sessionValidation();

    if (!canDeleteItem(session.role)) {
      throw forbidden("You're not allowed to access this feature");
    }

    await prisma.$transaction(async (tx) => {
      const selectData = stockSelectData({
        id: true,
        quantity: true,
        type: true,
        expiredAt: true,
        itemId: true,
        locationId: true,
        movements: {
          select: {
            id: true,
          },
          take: 1,
        },
      });

      const existing = await stockRepository.get(
        { id: stockId },
        selectData,
        tx,
      );

      if (!existing) throw notFound("Stock not found");

      if (existing.movements && existing.movements.length > 0) {
        throw badRequest(
          "Stock cannot be deleted because it has history of stock movements. Adjust the stock quantity instead.",
        );
      }

      const stock = await stockRepository.delete(stockId, tx);

      await auditLogsRepository.create(
        {
          userId: session.id,
          action: "DELETE",
          entity: "STOCK",
          entityId: stock.id,
          metadata: {
            id: existing.id,
            itemId: existing.itemId,
            locationId: existing.locationId,
            quantity: existing.quantity,
            type: existing.type,
          },
        },
        tx,
      );

      return stock;
    });

    return {
      message: `Stock deleted successfully`,
    };
  },
};

export default stockService;
