import { SortLocationBy, SortOrder } from "@/shared/lib/types/zod.type";
import { LocationGetManySchema } from "@/shared/lib/zods/location.zod";
import { Prisma, PrismaClient } from "@prisma/client";

export const locationWhereInput = (where: Prisma.LocationWhereInput) => where;

export const locationWhereUniqueInput = (
  where: Prisma.LocationWhereUniqueInput,
) => where;

export const locationSelectData = <T extends Prisma.LocationSelect>(
  select: T,
): T => select;

export const locationRepository = {
  buildLocationWhereClause: (
    params: LocationGetManySchema,
  ): Prisma.LocationWhereInput => {
    const whereQuery: Prisma.LocationWhereInput = {};

    if (params.searchQuery && params.searchQuery.length >= 3) {
      whereQuery.name = {
        contains: params.searchQuery,
        mode: "insensitive",
      };
    }

    if (params.locationType) {
      whereQuery.type = params.locationType;
    }

    return whereQuery;
  },

  create: async (
    data: Prisma.LocationCreateInput,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return tx.location.create({
      data,
    });
  },

  findById: async (id: string, tx: PrismaClient | Prisma.TransactionClient) => {
    return await tx.location.findUnique({
      where: { id: id },
    });
  },

  getMany: async <T extends Prisma.LocationSelect>(
    where: Prisma.LocationWhereInput,
    select: T,
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

  get: async <T extends Prisma.LocationSelect>(
    where: Prisma.LocationWhereUniqueInput,
    select: T,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return tx.location.findUnique({
      where,
      select,
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
};
