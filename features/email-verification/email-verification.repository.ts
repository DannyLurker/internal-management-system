import { Prisma, PrismaClient } from "@prisma/client";

export const emailVerificationRepository = {
  create: async (
    data: Prisma.EmailOtpVerificationCreateInput,
    tx: Prisma.TransactionClient | PrismaClient,
  ) => {
    return tx.emailOtpVerification.create({
      data,
    });
  },
  findById: async (
    id: string,
    select: Prisma.EmailOtpVerificationSelect,
    tx: Prisma.TransactionClient | PrismaClient,
  ) => {
    return tx.emailOtpVerification.findUnique({
      where: {
        id,
      },
      select,
    });
  },
  updateById: async (
    options: Prisma.EmailOtpVerificationUpdateArgs,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return tx.emailOtpVerification.update({
      where: options.where,
      data: options.data,
    });
  },
  deleteById: async (
    id: string,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return tx.emailOtpVerification.delete({
      where: {
        id,
      },
    });
  },
};
