import stockRequestService from "@/features/stock-requests/stock-request.service";
import {
  StockRequestCUDApiResponse,
  StockRequestGetManyApiResponse,
} from "@/features/stock-requests/stock-request.types";
import prisma from "@/shared/db/prisma";
import { forbidden } from "@/shared/lib/error-handlers";
import {
  handleError,
  printConsoleError,
} from "@/shared/lib/error-handlers/handleError";
import {
  canCreateStockRequest,
  canUpdateReviewGetDeleteStockRequest,
} from "@/shared/lib/validations/user-access-validation";
import sessionValidation from "@/shared/lib/validations/user-session-validation";
import {
  stockRequestCreateSchema,
  stockRequestFilterSchema,
} from "@/shared/lib/zods/stock-request.zod";
export async function POST(req: Request) {
  try {
    const session = await sessionValidation();

    if (!canCreateStockRequest(session.role)) {
      throw forbidden("You're not allowed to access this feature.");
    }

    const body = await req.json();
    const data = stockRequestCreateSchema.parse(body);

    const result = await stockRequestService.create(session, data, prisma);

    const response: StockRequestCUDApiResponse = {
      data: {
        id: result.data.id,
      },
      message: result.message,
      status: 201,
    };

    return Response.json(response, { status: 201 });
  } catch (error) {
    printConsoleError(error, "POST", req.url);
    return handleError(error);
  }
}

export async function GET(req: Request) {
  try {
    const session = await sessionValidation();

    if (!canUpdateReviewGetDeleteStockRequest(session.role)) {
      throw forbidden("You're not allowed to access this feature");
    }

    const { searchParams } = new URL(req.url);
    const rawFilters = Object.fromEntries(searchParams.entries());
    const filters = stockRequestFilterSchema.parse(rawFilters);

    const { data, message } = await stockRequestService.getMany(
      session,
      filters,
      prisma,
    );

    const responseData: StockRequestGetManyApiResponse = {
      message,
      data: {
        stockRequests: data.stockRequests,
        totalStockRequests: data.totalStockRequests,
      },
      status: 200,
    };

    return Response.json(responseData, { status: 200 });
  } catch (error) {
    printConsoleError(error, "GET", req.url);
    return handleError(error);
  }
}
