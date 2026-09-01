import {
  StockRequestCreateSchema,
  StockRequestFilterSchema,
  StockRequestReviewSchema,
  StockRequestUpdateSchema,
} from "@/shared/lib/zods/stock-request.zod";
import { Prisma, PrismaClient } from "@prisma/client";

export const createStockRequestSelect = <T extends Prisma.StockRequestSelect>(
  select: T,
): T => select;

export const createStockRequestWhereQuery = (
  baseFilter: StockRequestFilterSchema,
): Prisma.StockRequestWhereInput => {
  const where: Prisma.StockRequestWhereInput = {};

  // Filtering by search keyword (minimum 3 characters)
  if (baseFilter.search && baseFilter.search.trim().length >= 3) {
    where.OR = [
      {
        item: {
          name: {
            contains: baseFilter.search.trim(),
            mode: "insensitive",
          },
        },
      },
    ];
  }

  // Filtering by request type and status
  if (baseFilter.type) where.type = baseFilter.type;
  if (baseFilter.status) where.status = baseFilter.status;

  // Filtering by location IDs
  if (baseFilter.destinationLocationId) {
    where.destinationLocationId = baseFilter.destinationLocationId;
  }
  if (baseFilter.sourceLocationId) {
    where.sourceLocationId = baseFilter.sourceLocationId;
  }

  return where;
};

export const createStockRequestOrderByQuery = (
  sortBy: StockRequestFilterSchema["sortBy"],
  sortOrder: StockRequestFilterSchema["sortOrder"],
): Prisma.StockRequestOrderByWithRelationInput => {
  // Mapping nested relational fields vs scalar fields for sorting
  switch (sortBy) {
    case "itemName":
      return { item: { name: sortOrder } };
    case "sourceLocation":
      return { sourceLocation: { name: sortOrder } };
    case "destinationLocation":
      return { destinationLocation: { name: sortOrder } };
    default:
      return { [sortBy]: sortOrder };
  }
};

export const stockRequestRepository = {
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
        reason: data.reason,
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
