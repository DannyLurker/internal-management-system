import stockMovementsService from "@/features/stock-movements/stock-movements.service";
import {
  StockMovementCUDApiResponse,
  StockMovementGetByIdApiResponse,
} from "@/features/stock-movements/stock-movements.types";
import prisma from "@/shared/db/prisma";
import { forbidden } from "@/shared/lib/error-handlers";
import {
  handleError,
  printConsoleError,
} from "@/shared/lib/error-handlers/handleError";
import { canManageStockMovement } from "@/shared/lib/validations/user-access-validation";
import sessionValidation from "@/shared/lib/validations/user-session-validation";
import { stockMovementUpdateSchema } from "@/shared/lib/zods/stock-movements.zod";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await sessionValidation();

    if (!canManageStockMovement(session.role))
      throw forbidden("You're not allowed to access this feature");

    const { id } = await params;
    const result = await stockMovementsService.getById(session, id, prisma);

    const response: StockMovementGetByIdApiResponse = {
      message: result.message,
      data: result.data,
      status: 200,
    };

    return Response.json(response, { status: 200 });
  } catch (error) {
    printConsoleError(error, "GET", req.url);
    return handleError(error);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await sessionValidation();

    if (!canManageStockMovement(session.role))
      throw forbidden("You're not allowed to access this feature");

    const { id } = await params;
    const body = await req.json();
    const data = stockMovementUpdateSchema.parse(body);

    const result = await stockMovementsService.update(
      session,
      id,
      data,
      prisma,
    );

    const response: StockMovementCUDApiResponse = {
      message: result.message,
      data: {
        stockMovementId: result.id,
        itemId: result.itemId,
        stockId: result.stockId,
      },
      status: 200,
    };

    return Response.json(response, { status: 200 });
  } catch (error) {
    printConsoleError(error, "PATCH", req.url);
    return handleError(error);
  }
}
