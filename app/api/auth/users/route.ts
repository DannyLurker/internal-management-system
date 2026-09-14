import { userService } from "@/features/users/user.service";
import {
  UserGuestCreateApiResponse,
  UserStaffCreateApiResponse,
} from "@/features/users/user.types";
import prisma from "@/shared/db/prisma";
import { internalServerError } from "@/shared/lib/error-handlers";
import {
  handleError,
  printConsoleError,
} from "@/shared/lib/error-handlers/handleError";
import sessionValidation from "@/shared/lib/validations/user-session-validation";
import { userCreateSchema } from "@/shared/lib/zods/user.zod";

export async function POST(req: Request) {
  try {
    let user = null;

    try {
      user = await sessionValidation();
    } catch (error) {}

    const body = await req.json();
    const data = userCreateSchema.parse(body);

    let response: UserGuestCreateApiResponse | UserStaffCreateApiResponse;

    if (data.creationType === "GUEST") {
      const result = await userService.create(user, data, prisma);

      response = {
        message: result.message,
        data: {
          userId: result.userId,
          emailVerificationId: result.emailVerificationId,
        },
        status: 201,
      };

      return Response.json(response, { status: 201 });
    }

    internalServerError("Something went wrong");
  } catch (error) {
    printConsoleError(error, "POST", req.url);
    return handleError(error);
  }
}
