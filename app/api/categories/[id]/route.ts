import categoryService from "@/features/categories/category.service";
import {
  CategoryDeleteApiResponse,
  CategoryGetApiResponse,
} from "@/features/categories/category.types";
import { 
  handleError,
  printConsoleError,
} from "@/shared/lib/error-handlers/handleError";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const result = await categoryService.delete(id);

    const response: CategoryDeleteApiResponse = {
      message: result.message,
      data: null,
      status: 200,
    };

    return Response.json(response, { status: 200 });
  } catch (error) {
    printConsoleError(error, "DELETE", request.url);
    return handleError(error);
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const { searchParams } = new URL(request.url);

    const data = Object.fromEntries(searchParams.entries());

    const result = await categoryService.get(id, data);

    const response: CategoryGetApiResponse = {
      message: result.message,
      data: result.category,
      status: 200,
    };

    return Response.json(response, { status: 200 });
  } catch (error) {
    printConsoleError(error, "GET", request.url);
    return handleError(error);
  }
}
