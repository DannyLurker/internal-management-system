import { userService } from "@/features/users/user.service";
import { UserVerifyApiResponse } from "@/features/users/user.types";
import prisma from "@/shared/db/prisma";
import { badRequest } from "@/shared/lib/error-handlers";
import {
  handleError,
  printConsoleError,
} from "@/shared/lib/error-handlers/handleError";
import { userVerifySchema } from "@/shared/lib/zods/user.zod";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) throw badRequest("Id is missing");

    const body = await req.json();
    const data = userVerifySchema.parse(body);

    const result = await userService.verify(id, data, prisma);

    const response: UserVerifyApiResponse = {
      data: {
        success: result.success,
      },
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
