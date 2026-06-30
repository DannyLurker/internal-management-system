import stockMovementsService from "@/features/stock-movements/stock-movements.service";
import {
  StockMovementCUDApiResponse,
  StockMovementGetByIdApiResponse,
} from "@/features/stock-movements/stock-movements.types";
import {
  handleError,
  printConsoleError,
} from "@/shared/lib/error-handlers/handleError";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const result = await stockMovementsService.getById(id);

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
    const { id } = await params;

    const rawData = await req.json();

    const result = await stockMovementsService.update(id, rawData);

    const response: StockMovementCUDApiResponse = {
      message: result.message,
      data: { id: result.id },
      status: 200,
    };

    return Response.json(response, { status: 200 });
  } catch (error) {
    printConsoleError(error, "GET", req.url);
    return handleError(error);
  }
}
