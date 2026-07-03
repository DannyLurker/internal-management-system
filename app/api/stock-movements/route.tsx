import stockMovementsService from "@/features/stock-movements/stock-movements.service";
import {
  StockMovementCUDApiResponse,
  StockMovementGetManyApiResponse,
} from "@/features/stock-movements/stock-movements.types";
import { STOCK_MOVEMENT_CREATE_MODE } from "@/features/stock-movements/stock-movements.utils";
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

    const { searchParams } = new URL(req.url);

    let result;

    const stockMovementCreateMode = searchParams.get("stockMovementCreateMode");

    console.log(stockMovementCreateMode);

    if (
      stockMovementCreateMode &&
      stockMovementCreateMode === STOCK_MOVEMENT_CREATE_MODE.QUICK_DISCARD
    ) {
      result = await stockMovementsService.quickDiscard(rawData);
    } else if (
      stockMovementCreateMode &&
      stockMovementCreateMode === STOCK_MOVEMENT_CREATE_MODE.QUICK_LAUNDRY_OUT
    ) {
      result = await stockMovementsService.quickDiscard(rawData);
    } else {
      result = await stockMovementsService.create(rawData);
    }

    const response: StockMovementCUDApiResponse = {
      message: result.message,
      data: { id: result.id },
      status: 200,
    };

    return Response.json(response, { status: 200 });
  } catch (error) {
    printConsoleError(error, "POST", req.url);
    return handleError(error);
  }
}
