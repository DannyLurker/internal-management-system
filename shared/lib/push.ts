import webpush from "web-push";
import prisma from "../db/prisma";
import { Role } from "@prisma/client";

webpush.setVapidDetails(
  "mailto:you@yourdomain.com", // contact info push services may use if there's a problem
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export async function sendPushToUser(
  userId: string | null,
  roles: Role[] | null,
  payload: { title: string; body: string; url?: string },
) {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: {
      OR: [
        {
          userId: userId ? userId : undefined,
        },
        {
          user: {
            role: {
              in: roles ? roles : undefined,
            },
          },
        },
      ],
    },
  });

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload),
          {
            urgency: "high",
            TTL: 60,
          },
        );
      } catch (err: any) {
        // 410 Gone / 404 = the subscription is dead (user revoked permission,
        // cleared browser data, etc). Clean it up so you stop retrying it.
        if (err.statusCode === 410 || err.statusCode === 404) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } });
        } else {
          console.error("Push failed:", err);
        }
      }
    }),
  );
}
