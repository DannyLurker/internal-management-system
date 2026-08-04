import { LaundryGetManySchema } from "@/shared/lib/zods/laundry.zod";
import { Prisma, PrismaClient } from "@prisma/client";

export const createLaundrySelectData = <T extends Prisma.LaundrySelect>(
  select: T,
): T => select;

export const createLaundryWhereInput = <T extends Prisma.LaundryWhereInput>(
  select: T,
): T => select;

export const createLaundryWhereUniqueInput = <
  T extends Prisma.LaundryWhereUniqueInput,
>(
  select: T,
): T => select;

export const defaultLaundryInclude = {
  item: {
    select: {
      id: true,
      name: true,
      costPrice: true,
      image: true,
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
  vendorLaundryStock: {
    select: {
      id: true,
      type: true,
      totalCost: true,
      quantity: true,
      expiredAt: true,
      createdAt: true,
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  },
} as const;

export const laundryRepository = {
  buildWhereClause: (
    params: LaundryGetManySchema,
  ): Prisma.LaundryWhereInput => {
    const where: Prisma.LaundryWhereInput = {};

    if (params.searchQuery && params.searchQuery.trim().length >= 3) {
      const search = params.searchQuery.trim();
      where.OR = [
        { item: { name: { contains: search, mode: "insensitive" } } },
        { reason: { contains: search, mode: "insensitive" } },
      ];
    }

    if (params.status && params.status !== "ALL") {
      where.status = params.status as LaundryStatus;
    }

    if (params.sourceLocationId) {
      where.sourceLocationId = params.sourceLocationId;
    }

    if (params.destinationLocationId) {
      where.destinationLocationId = params.destinationLocationId;
    }

    return where;
  },

  findById: async (id: string, tx: PrismaClient | Prisma.TransactionClient) => {
    return await tx.laundry.findUnique({
      where: {
        id: id,
      },
      include: {
        item: {
          select: {
            name: true,
          },
        },
      },
    });
  },

  getById: async (id: string, tx: PrismaClient | Prisma.TransactionClient) => {
    return await tx.laundry.findUnique({
      where: { id },
      include: defaultLaundryInclude,
    });
  },

  getMany: async (
    where: Prisma.LaundryWhereInput,
    page: number = 1,
    dataPerPage: number = 10,
    sortBy: LaundryGetManySchema["sortBy"] = "sentAt",
    sortOrder: LaundryGetManySchema["sortOrder"] = "desc",
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    const skip = (page - 1) * dataPerPage;
    return await tx.laundry.findMany({
      where,
      skip,
      take: dataPerPage,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: defaultLaundryInclude,
    });
  },

  countRows: async (
    where: Prisma.LaundryWhereInput,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return await tx.laundry.count({ where });
  },

  create: async (
    data: Prisma.LaundryCreateInput,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return await tx.laundry.create({
      data,
    });
  },

  update: async (
    id: string,
    data: Prisma.LaundryUpdateInput,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return await tx.laundry.update({
      where: {
        id,
      },
      data: data,
    });
  },
};
