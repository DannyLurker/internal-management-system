import itemService from "@/features/items/item.service";
import {
  ItemDeleteApiResponse,
  ItemGetByIdApiResponse,
} from "@/features/items/item.types";
import {
  handleError,
  printConsoleError,
} from "@/shared/lib/error-handlers/handleError";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const result = await itemService.getById(id);

    const response: ItemGetByIdApiResponse = {
      message: result.message,
      data: result.item,
      status: 200,
    };

    return Response.json(response, {
      status: response.status,
    });
  } catch (error) {
    printConsoleError(error, "GET", request.url);
    return handleError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const result = await itemService.delete(id);

    const response: ItemDeleteApiResponse = {
      message: result.message,
      data: null,
      status: 200,
    };

    return Response.json(response, {
      status: response.status,
    });
  } catch (error) {
    printConsoleError(error, "DELETE", request.url);
    return handleError(error);
  }
}
