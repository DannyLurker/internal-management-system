import stockMovementsService from "@/features/stock-movements/stock-movements.service";
import {
  StockMovementCUDApiResponse,
  StockMovementGetManyApiResponse,
} from "@/features/stock-movements/stock-movements.types";
import {
  handleError,
  printConsoleError,
} from "@/shared/lib/error-handlers/handleError";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const rawParams = Object.fromEntries(searchParams.entries());

    const result = await stockMovementsService.getMany(rawParams);

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
    const rawData = await req.json();

    const result = await stockMovementsService.create(rawData);

    const response: StockMovementCUDApiResponse = {
      message: result.message,
      data: {
        stockMovementId: result.stockMovementId,
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
