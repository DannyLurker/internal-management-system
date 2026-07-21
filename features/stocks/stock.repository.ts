import { SortOrder } from "@/shared/lib/types/zod.type";
import { Prisma, PrismaClient } from "@prisma/client";
import { describeStockStatusFilter } from "./stock.rule";
import { StockGetManySchema } from "@/shared/lib/zods/stock.zod";

export interface StockStatusFilterParams {
  sortBy: string;
  stockStatusType?: string;
  itemSearchQuery: string | null;
}

export const stockWhereInput = (where: Prisma.StockWhereInput) => where;

export const stockWhereUniqueInput = (where: Prisma.StockWhereUniqueInput) =>
  where;

export const stockSelectData = <T extends Prisma.StockSelect>(select: T): T =>
  select;

export const stockRepository = {
  create: async (
    data: Prisma.StockCreateInput,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return tx.stock.create({
      data,
    });
  },

  findById: async (id: string, tx: PrismaClient | Prisma.TransactionClient) => {
    return await tx.stock.findUnique({
      where: { id },
    });
  },

  findFirst: async (
    where: Prisma.StockWhereInput,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return await tx.stock.findFirst({
      where,
    });
  },

  findOrUpdateOrCreate: async (
    where: Prisma.StockWhereInput,
    update: Prisma.StockUpdateInput,
    create: Prisma.StockCreateInput,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    let stock = await tx.stock.findFirst({
      where,
    });

    if (stock) {
      stock = await tx.stock.update({
        where: {
          id: stock.id,
        },
        data: { ...update },
      });
    } else {
      stock = await tx.stock.create({
        data: {
          ...create,
        },
      });
    }

    return stock;
  },

  getMany: async <T extends Prisma.StockSelect>(
    where: Prisma.StockWhereInput,
    select: T,
    skip: number | undefined,
    take: number | undefined,
    sortOrder: SortOrder | "asc",
    sortBy: StockGetManySchema["sortBy"],
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return tx.stock.findMany({
      where,
      select,
      skip,
      take,
      ...(sortBy === "stockType"
        ? {
            orderBy: {
              quantity: sortOrder,
            },
          }
        : {
            orderBy: {
              [sortBy]: sortOrder,
            },
          }),
    });
  },

  getById: async <T extends Prisma.StockSelect>(
    where: Prisma.StockWhereInput,
    select: T,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return tx.stock.findFirst({
      where,
      select,
    });
  },

  // currently buildStockWhereClause is used for location page stock status filter. Check /features/location
  // TODO: need to refactor it when we implement to other domain
  buildStockWhereClause: (
    locationId: string | null,
    params: StockStatusFilterParams,
  ): Prisma.StockWhereInput => {
    const stockWhereClause: Prisma.StockWhereInput = {};

    if (locationId) stockWhereClause.locationId = locationId;

    if (params.itemSearchQuery && params.itemSearchQuery.length >= 3) {
      stockWhereClause.item = {
        name: {
          contains: params.itemSearchQuery,
          mode: "insensitive",
        },
      };
    }

    if (params.sortBy !== "stockType") return stockWhereClause;

    const descriptor = describeStockStatusFilter(params.stockStatusType);
    if (!descriptor) return stockWhereClause;

    switch (descriptor.kind) {
      case "exactType":
        stockWhereClause.type = descriptor.type;
        break;
      case "expiredBefore":
        stockWhereClause.OR = [{ type: "EXPIRED" }, { type: "READY" }];
        stockWhereClause.expiredAt = { lt: descriptor.today };
        break;
      case "expiringWithinWindow":
        stockWhereClause.OR = [{ type: "READY" }, { type: "EXPIRED" }];
        stockWhereClause.expiredAt = {
          gte: descriptor.today,
          lte: descriptor.windowEnd,
        };
        break;
    }

    return stockWhereClause;
  },

  buildStockCountWhereClause: (
    baseStockWhere: Prisma.StockWhereInput,
    itemSearchQuery?: string,
  ): Prisma.StockWhereInput => {
    if (!itemSearchQuery || itemSearchQuery.length < 3) {
      return baseStockWhere;
    }

    return {
      ...baseStockWhere,
      item: {
        name: {
          contains: itemSearchQuery,
          mode: "insensitive",
        },
      },
    };
  },

  totalInventoryValue: async (
    where: Prisma.StockWhereInput,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    // 1. Group by itemId and sum the quantities in the database
    const stockGroups = await tx.stock.groupBy({
      by: ["itemId"],
      where,
      _sum: {
        quantity: true,
      },
    });

    // 2. Fetch the selling prices for those specific items
    const itemIds = stockGroups.map((g) => g.itemId);
    const items = await tx.item.findMany({
      where: { id: { in: itemIds } },
      select: { id: true, sellingPrice: true },
    });

    // Create a quick lookup map for prices
    const priceMap = new Map(items.map((i) => [i.id, i.sellingPrice || 0]));

    // 3. Calculate the total value
    const totalValue = stockGroups.reduce((acc, group) => {
      const quantity = group._sum.quantity || 0;
      const price = priceMap.get(group.itemId) || 0;
      return acc + quantity * price;
    }, 0);

    return totalValue;
  },

  countQuantity: async (
    where: Prisma.StockWhereInput,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    const result = await tx.stock.aggregate({
      where,
      _sum: {
        quantity: true,
      },
    });

    return result._sum.quantity;
  },
  getGroupedStockQuantities: async (
    by: Prisma.StockGroupByArgs["by"],
    itemId: string,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return tx.stock.groupBy({
      // Use Array.isArray check or spread to handle both single strings and arrays safely
      by: Array.isArray(by) ? by : [by],
      where: { itemId },
      _sum: {
        quantity: true,
      },
    });
  },

  countRows: async (
    where: Prisma.StockWhereInput,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    const result = await tx.stock.count({
      where,
    });

    return result;
  },

  update: async (
    stockId: string,
    data: Prisma.StockUpdateInput,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return tx.stock.update({
      where: { id: stockId },
      data,
    });
  },

  delete: async (
    stockId: string,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return tx.stock.delete({
      where: { id: stockId },
    });
  },
};
