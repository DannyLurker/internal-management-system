import stockService from "@/features/stocks/stock.service";
import {
  StockCUDApiResponse,
  StockGetManyApiResponse,
} from "@/features/stocks/stock.types";
import {
  handleError,
  printConsoleError,
} from "@/shared/lib/error-handlers/handleError";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await stockService.create(body);

    const response: StockCUDApiResponse = {
      message: result.message,
      data: null,
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
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());

    const result = await stockService.getMany(params);

    const response: StockGetManyApiResponse = {
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
export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const result = await stockService.update(body);

    const response: StockCUDApiResponse = {
      message: result.message,
      data: null,
      status: 200,
    };

    return Response.json(response, { status: 200 });
  } catch (error) {
    printConsoleError(error, "PATCH", req.url);
    return handleError(error);
  }
}
