import { laundryService } from "@/features/laundries/laundry.service";
import {
  LaundryCUDApiResponse,
  LaundryGetManyApiResponse,
} from "@/features/laundries/laundry.types";
import prisma from "@/shared/db/prisma";
import { forbidden } from "@/shared/lib/error-handlers";
import {
  handleError,
  printConsoleError,
} from "@/shared/lib/error-handlers/handleError";
import { canManageLaundry } from "@/shared/lib/validations/user-access-validation";
import sessionValidation from "@/shared/lib/validations/user-session-validation";
import {
  laundryCreateSchema,
  laundryGetManySchema,
} from "@/shared/lib/zods/laundry.zod";

export async function GET(req: Request) {
  try {
    const session = await sessionValidation();

    if (!canManageLaundry(session.role)) {
      throw forbidden("You're not allowed to access this feature.");
    }

    const { searchParams } = new URL(req.url);
    const queryObj = Object.fromEntries(searchParams.entries());

    const params = laundryGetManySchema.parse(queryObj);

    const result = await laundryService.getMany(session, params, prisma);

    const response: LaundryGetManyApiResponse = {
      data: result,
      message: "Laundry records fetched successfully",
      status: 200,
    };

    return Response.json(response, { status: 200 });
  } catch (error) {
    printConsoleError(error, "GET", req.url);
    return handleError(error);
  }
}

export async function POST(req: Request) {
  try {
    const session = await sessionValidation();

    if (!canManageLaundry(session.role)) {
      throw forbidden("You're not allowed to access this feature.");
    }

    const body = await req.json();

    const data = laundryCreateSchema.parse(body);

    const result = await laundryService.create(session, data, prisma);

    const response: LaundryCUDApiResponse = {
      data: {
        id: result.laundryId,
      },
      message: result.message,
      status: 201,
    };

    return Response.json(response, { status: 200 });
  } catch (error) {
    printConsoleError(error, "POST", req.url);
    return handleError(error);
  }
}

