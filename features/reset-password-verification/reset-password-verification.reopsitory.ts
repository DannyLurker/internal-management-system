import { Prisma, PrismaClient } from "@prisma/client";

export const resetPasswordVerificationRepository = {
  findById: async (
    id: string,
    select: Prisma.ResetPasswordOtpVerificationSelect,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return tx.resetPasswordOtpVerification.findUnique({
      where: {
        id,
      },
      select,
    });
  },

  create: async (
    data: Prisma.ResetPasswordOtpVerificationCreateInput,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return tx.resetPasswordOtpVerification.create({
      data,
    });
  },

  update: async (
    id: string,
    data: Prisma.ResetPasswordOtpVerificationUpdateInput,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return tx.resetPasswordOtpVerification.update({
      where: {
        id,
      },
      data,
    });
  },

  delete: async (id: string, tx: PrismaClient | Prisma.TransactionClient) => {
    return tx.resetPasswordOtpVerification.delete({
      where: {
        id,
      },
    });
  },
};
