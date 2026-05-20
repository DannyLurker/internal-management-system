import itemService from "@/features/items/item.service";
import {
  ItemCreateApiResponse,
  ItemGetManyApiResponse,
  ItemUpdateApiResponse,
} from "@/features/items/item.types";
import {
  handleError,
  printConsoleError,
} from "@/shared/lib/error-handlers/handleError";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const result = await itemService.create(data);

    const response: ItemCreateApiResponse = {
      message: result.message,
      data: null,
      status: 201,
    };

    return Response.json(response, {
      status: response.status,
    });
  } catch (error) {
    printConsoleError(error, "POST", request.url);
    return handleError(error);
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const data = Object.fromEntries(searchParams.entries());

    const result = await itemService.getMany(data);

    const response: ItemGetManyApiResponse = {
      message: result.message,
      data: result.items,
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

export async function PATCH(request: Request) {
  try {
    const data = await request.json();

    const result = await itemService.update(data);

    const response: ItemUpdateApiResponse = {
      message: result.message,
      data: null,
      status: 200,
    };

    return Response.json(response, {
      status: response.status,
    });
  } catch (error) {
    printConsoleError(error, "PATCH", request.url);
    return handleError(error);
  }
}
