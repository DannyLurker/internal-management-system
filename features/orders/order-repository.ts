import { Prisma, PrismaClient } from "@prisma/client";

const orderRepository = {
  findById: async (id: string, tx: PrismaClient | Prisma.TransactionClient) => {
    return await tx.order.findUnique({
      where: { id },
    });
  },
};

export default orderRepository;
