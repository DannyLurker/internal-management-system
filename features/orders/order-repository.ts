import { Prisma, PrismaClient } from "@prisma/client";

const orderRepository = {
  findById: async (id: string, tx: PrismaClient | Prisma.TransactionClient) => {
    return await tx.item.findUnique({
      where: { id },
    });
  },
};

export default orderRepository;
