import { userService } from "@/features/users/user.service";
import { UserRequestOtpApiResponse } from "@/features/users/user.types";
import prisma from "@/shared/db/prisma";
import {
  handleError,
  printConsoleError,
} from "@/shared/lib/error-handlers/handleError";
import { userRequestOtpSchema } from "@/shared/lib/zods/user.zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const data = userRequestOtpSchema.parse(body);

    const result = await userService.requestOtp(data, prisma);

    const response: UserRequestOtpApiResponse = {
      data: null,
      message: result.message,
      status: 201,
    };

    return Response.json(response, {
      status: 201,
    });
  } catch (error) {
    printConsoleError(error, "POST", req.url);
    return handleError(error);
  }
}
