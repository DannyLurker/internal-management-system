import { Prisma, PrismaClient } from "@prisma/client";

const pushSubscriptionRepository = {
  getMany: async (
    whereClause: Prisma.PushSubscriptionWhereInput,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return tx.pushSubscription.findMany({
      where: whereClause,
    });
  },

  upsert: async (
    where: Prisma.PushSubscriptionWhereInput,
    update: Prisma.PushSubscriptionUpdateInput,
    create: Prisma.PushSubscriptionCreateInput,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    const findPushSubscription = await tx.pushSubscription.findFirst({
      where,
    });

    let createOrUpdatePushSubscription;

    if (findPushSubscription) {
      createOrUpdatePushSubscription = tx.pushSubscription.update({
        where: {
          id: findPushSubscription.id,
        },
        data: update,
      });
    } else {
      createOrUpdatePushSubscription = tx.pushSubscription.create({
        data: create,
      });
    }

    return createOrUpdatePushSubscription;
  },

  delete: async (
    pushSubscriptionId: string,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return tx.pushSubscription.delete({
      where: {
        id: pushSubscriptionId,
      },
    });
  },
};

export default pushSubscriptionRepository;
