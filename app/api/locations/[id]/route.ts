import {
  handleError,
  printConsoleError,
} from "@/shared/lib/error-handlers/handleError";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
  } catch (error) {
    printConsoleError(error, "GET", req.url);
    return handleError(error);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
  } catch (error) {
    printConsoleError(error, "DELETE", req.url);
    return handleError(error);
  }
}
