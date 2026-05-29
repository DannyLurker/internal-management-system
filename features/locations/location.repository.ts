import { SortLocationBy, SortOrder } from "@/shared/lib/types/zod.type";
import { Prisma, PrismaClient } from "@prisma/client";

export const locationWhereInput = (where: Prisma.LocationWhereInput) => where;

export const locationWhereUniqueInput = (
  where: Prisma.LocationWhereUniqueInput,
) => where;

export const locationSelectData = (where: Prisma.LocationSelect) => where;

export const locationRepository = {
  create: async (
    data: Prisma.LocationCreateInput,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return tx.location.create({
      data,
    });
  },

  update: async (
    locationId: string,
    data: Prisma.LocationUpdateInput,

    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return tx.location.update({
      where: { id: locationId },
      data,
    });
  },

  delete: async (
    locationId: string,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return tx.location.delete({
      where: { id: locationId },
    });
  },

  getMany: async (
    where: Prisma.LocationWhereInput,
    select: Prisma.LocationSelect,
    skip: number | undefined,
    take: number | undefined,
    sortOrder: SortOrder | "asc",
    sortBy: SortLocationBy,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return tx.location.findMany({
      where,
      select,
      skip,
      take,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });
  },

  get: async (
    where: Prisma.LocationWhereUniqueInput,
    select: Prisma.LocationSelect,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return tx.location.findUnique({
      where,
      select,
    });
  },
};
