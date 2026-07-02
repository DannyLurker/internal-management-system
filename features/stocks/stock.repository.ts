import { SortOrder } from "@/shared/lib/types/zod.type";
import { Prisma, PrismaClient } from "@prisma/client";

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
