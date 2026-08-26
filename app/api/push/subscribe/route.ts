import prisma from "@/shared/db/prisma";
import { badRequest } from "@/shared/lib/error-handlers";
import {
  handleError,
  printConsoleError,
} from "@/shared/lib/error-handlers/handleError";
import sessionValidation from "@/shared/lib/validations/user-session-validation";

export async function POST(req: Request) {
  try {
    const session = await sessionValidation();
    if (!session?.id) {
      throw badRequest(
        "User session is required to subscribe to push notifications.",
      );
    }

    const subscription = await req.json();

    await prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userId: session.id,
      },
      create: {
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userId: session.id,
      },
    });

    return Response.json({ success: true });
  } catch (error) {
    printConsoleError(error, "POST", req.url);
    return handleError(error);
  }
}
