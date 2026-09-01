import stockRequestService from "@/features/stock-requests/stock-request.service";
import { StockRequestCUDApiResponse } from "@/features/stock-requests/stock-request.types";
import prisma from "@/shared/db/prisma";
import { forbidden } from "@/shared/lib/error-handlers";
import {
  handleError,
  printConsoleError,
} from "@/shared/lib/error-handlers/handleError";
import { canCreateStockRequest } from "@/shared/lib/validations/user-access-validation";
import sessionValidation from "@/shared/lib/validations/user-session-validation";
import { stockRequestCreateSchema } from "@/shared/lib/zods/stock-request.zod";
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
