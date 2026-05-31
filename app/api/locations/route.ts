import locationService from "@/features/locations/location.service";
import {
  LocationCreateApiResponse,
  LocationGetManyApiResponse,
  LocationUpdateApiResponse,
} from "@/features/locations/location.types";
import {
  handleError,
  printConsoleError,
} from "@/shared/lib/error-handlers/handleError";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const params = Object.fromEntries(searchParams.entries());

    const result = await locationService.getMany(params);

    const response: LocationGetManyApiResponse = {
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

    const result = await locationService.create(rawData);

    const response: LocationCreateApiResponse = {
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

export async function PATCH(req: Request) {
  try {
    const rawData = await req.json();
    const result = await locationService.update(rawData);

    const response: LocationUpdateApiResponse = {
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
