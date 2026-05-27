import {
  handleError,
  printConsoleError,
} from "@/shared/lib/error-handlers/handleError";

export async function GET(req: Request) {
  try {
  } catch (error) {
    printConsoleError(error, "GET", req.url);
    return handleError(error);
  }
}

export async function POST(req: Request) {
  try {
  } catch (error) {
    printConsoleError(error, "POST", req.url);
    return handleError(error);
  }
}

export async function PATCH(req: Request) {
  try {
  } catch (error) {
    printConsoleError(error, "PATCH", req.url);
    return handleError(error);
  }
}
