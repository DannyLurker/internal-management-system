import { Prisma, PrismaClient } from "@prisma/client";

export const createlocationWhereInput = <T extends Prisma.LocationWhereInput>(
  whereInput: T,
): T => whereInput;

export const locationRepository = {
  create: async (
    userId: string,
    data: Prisma.LocationCreateInput,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return tx.location.create({
      data: {
        name: data.name,
        type: data.type,
        description: data.description,
        createdBy: userId,
      },
    });
  },
};
