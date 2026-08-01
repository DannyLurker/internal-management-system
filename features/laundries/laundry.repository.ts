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
  create: async (
    data: Prisma.LaundryCreateInput,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return await tx.laundry.create({
      data,
    });
  },
};
