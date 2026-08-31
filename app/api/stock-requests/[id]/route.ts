import stockRequestService from "@/features/stock-requests/stock-request.service";
import { StockRequestCUDApiResponse } from "@/features/stock-requests/stock-request.types";
import prisma from "@/shared/db/prisma";
import { badRequest, forbidden } from "@/shared/lib/error-handlers";
import {
  handleError,
  printConsoleError,
} from "@/shared/lib/error-handlers/handleError";
import { canUpdateReviewStockRequest } from "@/shared/lib/validations/user-access-validation";
import sessionValidation from "@/shared/lib/validations/user-session-validation";
import {
  stockRequestReviewSchema,
  stockRequestUpdateSchema,
} from "@/shared/lib/zods/stock-request.zod";
import { Role } from "@prisma/client";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await sessionValidation();

    if (!canUpdateReviewStockRequest(session.role))
      throw forbidden("You're not allowed to access this feature");

    const { id } = await params;

    if (!id) throw badRequest("Stock request id is missing");

    const body = await req.json();

    let updatedStockRequest;

    const reviewerRoles: Role[] = ["HOTEL_MANAGER", "SUPERVISOR"];
    const requesterRoles: Role[] = ["HOUSEKEEPING", "FRONT_DESK"];

    if (reviewerRoles.includes(session.role)) {
      const data = stockRequestReviewSchema.parse(body);
      updatedStockRequest = await stockRequestService.review(
        session,
        id,
        data,
        prisma,
      );
    }

    if (requesterRoles.includes(session.role)) {
      const data = stockRequestUpdateSchema.parse(body);
      updatedStockRequest = await stockRequestService.update(
        session,
        id,
        data,
        prisma,
      );
    }

    const responseData: StockRequestCUDApiResponse = {
      message: updatedStockRequest?.message as string,
      data: {
        id: updatedStockRequest?.stockRequestId as string,
      },
      status: 200,
    };

    return Response.json(responseData, { status: 200 });
  } catch (error) {
    printConsoleError(error, "PATCH", req.url);
    return handleError(error);
  }
}
