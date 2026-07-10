import { SortOrder } from "@/shared/lib/types/zod.type";
import { Prisma, PrismaClient } from "@prisma/client";
import { describeStockStatusFilter } from "./stock.rule";

export interface StockStatusFilterParams {
  sortBy: string;
  stockStatusType?: string;
  itemSearchQuery?: string;
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
    sortBy: string,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return tx.stock.findMany({
      where,
      select,
      skip,
      take,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });
  },

  get: async <T extends Prisma.StockSelect>(
    where: Prisma.StockWhereUniqueInput,
    select: T,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return tx.stock.findUnique({
      where,
      select,
    });
  },

  // currently buildStockWhereClause is used for location page stock status filter. Check /features/location
  // TODO: need to refactor it when we implement to other domain
  buildStockWhereClause: (
    locationId: string,
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
