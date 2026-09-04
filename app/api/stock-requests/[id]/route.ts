import stockRequestService from "@/features/stock-requests/stock-request.service";
import {
  requesterRoles,
  reviewerRoles,
  StockRequestCUDApiResponse,
  StockRequestGetByIdResponse,
} from "@/features/stock-requests/stock-request.types";
import prisma from "@/shared/db/prisma";
import { badRequest, forbidden } from "@/shared/lib/error-handlers";
import {
  handleError,
  printConsoleError,
} from "@/shared/lib/error-handlers/handleError";
import { canUpdateReviewGetDeleteStockRequest } from "@/shared/lib/validations/user-access-validation";
import sessionValidation from "@/shared/lib/validations/user-session-validation";
import {
  stockRequestReviewSchema,
  stockRequestUpdateSchema,
} from "@/shared/lib/zods/stock-request.zod";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await sessionValidation();

    if (!canUpdateReviewGetDeleteStockRequest(session.role))
      throw forbidden("You're not allowed to access this feature");

    const { id } = await params;

    if (!id) throw badRequest("Stock request id is missing");

    const body = await req.json();

    let updatedStockRequest;

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

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await sessionValidation();

    if (!canUpdateReviewGetDeleteStockRequest(session.role)) {
      throw forbidden("You're not allowed to access this feature");
    }

    const { id } = await params;

    if (!id) throw badRequest("Id is misisng");

    const { stockRequest, message } = await stockRequestService.getById(
      session,
      id,
      prisma,
    );

    const responseData: StockRequestGetByIdResponse = {
      message,
      data: {
        stockRequest: stockRequest,
      },
      status: 200,
    };

    return Response.json(responseData, { status: 200 });
  } catch (error) {
    printConsoleError(error, "GET", req.url);
    return handleError(error);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await sessionValidation();

    if (!canUpdateReviewGetDeleteStockRequest(session.role)) {
      throw forbidden("You're not allowed to access this feature");
    }

    const { id: paramId } = await params;

    if (!paramId) throw badRequest("Id is misisng");

    const { message, data } = await stockRequestService.delete(
      session,
      paramId,
      prisma,
    );

    const responseData: StockRequestCUDApiResponse = {
      data: {
        id: data.id,
      },
      message,
      status: 200,
    };

    return Response.json(responseData, { status: 200 });
  } catch (error) {
    printConsoleError(error, "DELETE", req.url);
    return handleError(error);
  }
}
