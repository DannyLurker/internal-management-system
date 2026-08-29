import pushSubscriptionService from "@/features/push-subscriptions/push-subscription.service";
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

    await pushSubscriptionService.create(session, subscription, prisma);

    return Response.json({ success: true });
  } catch (error) {
    printConsoleError(error, "POST", req.url);
    return handleError(error);
  }
}
