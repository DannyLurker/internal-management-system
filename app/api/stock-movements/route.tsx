import stockMovementsService from "@/features/stock-movements/stock-movements.service";
import {
  StockMovementCUDApiResponse,
  StockMovementGetManyApiResponse,
} from "@/features/stock-movements/stock-movements.types";
import prisma from "@/shared/db/prisma";
import { forbidden } from "@/shared/lib/error-handlers";
import {
  handleError,
  printConsoleError,
} from "@/shared/lib/error-handlers/handleError";
import { canManageStockMovement } from "@/shared/lib/validations/user-access-validation";
import sessionValidation from "@/shared/lib/validations/user-session-validation";
import {
  stockMovementCreateSchema,
  stockMovementGetManySchema,
} from "@/shared/lib/zods/stock-movements.zod";

export async function GET(req: Request) {
  try {
    const session = await sessionValidation();

    if (!canManageStockMovement(session.role))
      throw forbidden("You're not allowed to access this feature");

    const { searchParams } = new URL(req.url);
    const rawParams = Object.fromEntries(searchParams.entries());
    const params = stockMovementGetManySchema.parse(rawParams);

    const result = await stockMovementsService.getMany(session, params, prisma);

    const response: StockMovementGetManyApiResponse = {
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

export async function POST(req: Request) {
  try {
    const session = await sessionValidation();

    if (!canManageStockMovement(session.role))
      throw forbidden("You're not allowed to access this feature");

    const body = await req.json();
    const data = stockMovementCreateSchema.parse(body);

    const result = await stockMovementsService.create(session, data, prisma);

    const response: StockMovementCUDApiResponse = {
      message: result.message,
      data: {
        stockMovementId: result.stockMovementId,
        stockMovementType: result.stockmovementType,
        stockId: result.stockId,
        itemId: result.itemId,
      },
      status: 200,
    };

    return Response.json(response, { status: 200 });
  } catch (error) {
    printConsoleError(error, "POST", req.url);
    return handleError(error);
  }
}
