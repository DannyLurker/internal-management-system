import { Prisma, PrismaClient } from "@prisma/client";

export const createSelectStockMovementData = <
  T extends Prisma.StockMovementSelect,
>(
  select: T,
): T => select;

const stockMovementsRepository = {
  create: async (
    data: Prisma.StockMovementUncheckedCreateInput,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return await tx.stockMovement.create({
      data,
    });
  },

  getById: async (
    movementId: string,
    select: Prisma.StockMovementSelect,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return await tx.stockMovement.findUnique({
      where: { id: movementId },
      select,
    });
  },

  getMany: async (
    where: Prisma.StockMovementWhereInput,
    select: Prisma.StockMovementSelect,
    skip: number,
    take: number,
    sortBy: string,
    sortOrder: "asc" | "desc",
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return await tx.stockMovement.findMany({
      where,
      select,
      skip,
      take,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });
  },

  count: async (
    where: Prisma.StockMovementWhereInput,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return await tx.stockMovement.count({
      where,
    });
  },

  update: async (
    movementId: string,
    data: Prisma.StockMovementUpdateInput,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return await tx.stockMovement.update({
      where: { id: movementId },
      data,
    });
  },

  delete: async (
    movementId: string,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return await tx.stockMovement.delete({
      where: { id: movementId },
    });
  },
};

export default stockMovementsRepository;
