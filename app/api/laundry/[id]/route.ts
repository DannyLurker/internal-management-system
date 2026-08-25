import { laundryService } from "@/features/laundry/laundry.service";
import { LaundryGetByIdApiResponse } from "@/features/laundry/laundry.types";
import prisma from "@/shared/db/prisma";
import { forbidden } from "@/shared/lib/error-handlers";
import {
  handleError,
  printConsoleError,
} from "@/shared/lib/error-handlers/handleError";
import { canManageLaundry } from "@/shared/lib/validations/user-access-validation";
import sessionValidation from "@/shared/lib/validations/user-session-validation";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await sessionValidation();

    if (!canManageLaundry(session.role)) {
      throw forbidden("You're not allowed to access this feature.");
    }

    const { id } = await params;
    const result = await laundryService.getById(session, id, prisma);

    const response: LaundryGetByIdApiResponse = {
      data: result.laundry,
      message: "Laundry details fetched successfully",
      status: 200,
    };

    return Response.json(response, { status: 200 });
  } catch (error) {
    printConsoleError(error, "GET", req.url);
    return handleError(error);
  }
}
