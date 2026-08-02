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

export const laundryRepository = {
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
