import {
  StockRequestCreateSchema,
  StockRequestReviewSchema,
  StockRequestUpdateSchema,
} from "@/shared/lib/zods/stock-request.zod";
import { Prisma, PrismaClient } from "@prisma/client";

const stockRequestRepository = {
  findById: async (
    stockRequestId: string,
    tx: Prisma.TransactionClient | PrismaClient,
  ) => {
    return await tx.stockRequest.findUnique({
      where: {
        id: stockRequestId,
      },
    });
  },

  create: async (
    userId: string,
    data: StockRequestCreateSchema,
    tx: Prisma.TransactionClient | PrismaClient,
  ) => {
    return await tx.stockRequest.create({
      data: {
        itemId: data.itemId,
        requestedById: userId,
        requestedQuantity: data.quantity,
        sourceLocationId: data.sourceLocationId,
        destinationLocationId: data.destinationLocationId,
      },
    });
  },

  update: async (
    stockRequestId: string,
    data: StockRequestUpdateSchema,
    tx: Prisma.TransactionClient | PrismaClient,
  ) => {
    return await tx.stockRequest.update({
      where: {
        id: stockRequestId,
      },
      data: {
        requestedQuantity: data.requestedQuantity,
        sourceLocationId: data.destinationLocationId,
        destinationLocationId: data.sourceLocationId,
        type: data.type,
      },
    });
  },

  review: async (
    userId: string,
    stockRequestId: string,
    data: StockRequestReviewSchema,
    tx: Prisma.TransactionClient | PrismaClient,
  ) => {
    return await tx.stockRequest.update({
      where: {
        id: stockRequestId,
      },
      data: {
        status: data.stockRequestStatus,
        approvedBy: {
          connect: { id: userId },
        },
        decisionNotes: data.decisitonNotes,
        approvedQuantity: data.approvedQuantity,
      },
    });
  },
};

export default stockRequestRepository;
