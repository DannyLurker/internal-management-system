import { StockRequestCreateSchema } from "@/shared/lib/zods/stock-request.zod";
import { Prisma, PrismaClient } from "@prisma/client";

const stockRequestRepository = {
  create: async (
    userId: string,
    data: StockRequestCreateSchema,
    tx: Prisma.TransactionClient | PrismaClient,
  ) => {
    return await tx.stockRequest.create({
      data: {
        itemId: data.itemId,
        requestedById: userId,
        quantity: data.quantity,
        sourceLocationId: data.sourceLocationId,
        destinationLocationId: data.destinationLocationId,
      },
    });
  },
};

export default stockRequestRepository;
