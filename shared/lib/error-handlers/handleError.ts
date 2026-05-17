import AppError from "./AppError";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import prismaErrorCode from "./prisma-error-code";
import { generateReadableError } from "../zods/general.zod";
import { ZodError } from "zod";

export function handleError(error: unknown) {
  console.error("[API_ERROR]", {
    type: error instanceof Error ? error.name : "Unknown",
    message: error,
  });

  if (error instanceof PrismaClientKnownRequestError) {
    const prismaError = error as { code: string };
    if (prismaError.code === prismaErrorCode.notFound) {
      return Response.json({ message: "Data not found" }, { status: 404 });
    }

    if (prismaError.code === prismaErrorCode.uniqueConstraintFailed) {
      const match = error.message.match(/\(`(.+?)`\)/);
      const field = match
        ? match[1].charAt(0).toUpperCase() + match[1].slice(1)
        : "Field";
      return Response.json(
        { message: `${field} already exists` },
        { status: 409 },
      );
    }
  }

  if (error instanceof ZodError) {
    return Response.json(
      {
        success: false,
        message: "Validation failed",
        errors: error.issues.map((e) => ({
          field: e.path.join("."),
          message: generateReadableError(e),
        })),
      },
      { status: 400 },
    );
  }

  if (error instanceof AppError) {
    return Response.json(
      { message: error.message },
      { status: error.statusCode },
    );
  }

  return Response.json(
    {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
    },
    { status: 500 },
  );
}

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export function printConsoleError(
  error: unknown,
  httpMethod: HttpMethod,
  apiUrl: string,
) {
  console.error("API_ERROR", {
    route: `(${httpMethod}) ${apiUrl}`,
    message: error instanceof Error ? error.message : String(error),
  });
}
