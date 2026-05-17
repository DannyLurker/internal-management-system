import productService from "@/features/products/product.service";
import { ApiResponse } from "@/shared/lib/api-client";
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

    const result = await productService.get(id);

    const response: ApiResponse<typeof result.product> = {
      message: result.message,
      data: result.product,
      status: 200,
    };

    return Response.json(response, { status: 200 });
  } catch (error) {
    printConsoleError(error, "DELETE", req.url);
    return handleError(error);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const result = await productService.delete(id);

    const response: ApiResponse<null> = {
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
