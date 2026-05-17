import productService from "@/features/products/product.service";
import {
  handleError,
  printConsoleError,
} from "@/shared/lib/error-handlers/handleError";
import { ApiResponse } from "@/shared/lib/api-client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await productService.create(body);

    const response: ApiResponse<string> = {
      message: result.message,
      data: result.id,
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

    const result = await productService.getMany(params);

    const response: ApiResponse<typeof result.products> = {
      message: result.message,
      data: result.products,
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
    const result = await productService.update(body);

    const response: ApiResponse<null> = {
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
