import categoryService from "@/features/categories/category.service";
import {
  CategoryCreateApiResponse,
  CategoryListApiResponse,
  CategoryUpdateApiResponse,
} from "@/features/categories/category.types";
import {
  handleError,
  printConsoleError,
} from "@/shared/lib/error-handlers/handleError";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const result = await categoryService.create(data);

    const response: CategoryCreateApiResponse = {
      message: result.message,
      data: result.id,
      status: 201,
    };

    return Response.json(response, { status: 201 });
  } catch (error) {
    printConsoleError(error, "POST", request.url);
    return handleError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const data = await request.json();
    const result = await categoryService.update(data);

    const response: CategoryUpdateApiResponse = {
      message: result.message,
      data: null,
      status: 200,
    };
    return Response.json(response, { status: 200 });
  } catch (error) {
    printConsoleError(error, "PATCH", request.url);
    return handleError(error);
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const data = Object.fromEntries(searchParams.entries());

    const result = await categoryService.getMany(data);

    const response: CategoryListApiResponse = {
      message: result.message,
      data: result.categories,
      status: 200,
    };

    return Response.json(response, { status: 200 });
  } catch (error) {
    printConsoleError(error, "GET", req.url);
    return handleError(error);
  }
}
