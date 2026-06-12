import stockService from "@/features/stocks/stock.service";
import {
  StockCUDApiResponse,
  StockGetByIdApiResponse,
} from "@/features/stocks/stock.types";
import {
  handleError,
  printConsoleError,
} from "@/shared/lib/error-handlers/handleError";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const result = await stockService.delete(id);

    const response: StockCUDApiResponse = {
      message: result.message,
      data: null,
      status: 200,
    };

    return Response.json(response, { status: 200 });
  } catch (error) {
    printConsoleError(error, "DELETE", req.url);
    return handleError(error);
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const result = await stockService.get(id);

    const response: StockGetByIdApiResponse = {
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
