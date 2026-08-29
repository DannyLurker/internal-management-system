import { Prisma, PrismaClient } from "@prisma/client";
import { Session } from "next-auth";
import pushSubscriptionRepository from "./push-subscription.repository";
import { PushSubscriptionData } from "./push-subscription.types";

const pushSubscriptionService = {
  create: async (
    session: Session["user"],
    subscriptionData: PushSubscriptionData,
    prisma: PrismaClient | Prisma.TransactionClient,
  ) => {
    await pushSubscriptionRepository.upsert(
      { endpoint: subscriptionData.endpoint },
      {
        p256dh: subscriptionData.keys.p256dh,
        auth: subscriptionData.keys.auth,
        user: {
          connect: {
            id: session.id,
          },
        },
      },
      {
        endpoint: subscriptionData.endpoint,
        p256dh: subscriptionData.keys.p256dh,
        auth: subscriptionData.keys.auth,
        user: {
          connect: {
            id: session.id,
          },
        },
      },
      prisma,
    );
  },
};

export default pushSubscriptionService;
