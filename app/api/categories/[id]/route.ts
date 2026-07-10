import categoryService from "@/features/categories/category.service";
import {
  CategoryCUDApiResponse,
  CategoryGetByIdApiResponse,
} from "@/features/categories/category.types";
import prisma from "@/shared/db/prisma";
import { badRequest, forbidden } from "@/shared/lib/error-handlers";
import {
  handleError,
  printConsoleError,
} from "@/shared/lib/error-handlers/handleError";
import { canManageCategory } from "@/shared/lib/validations/user-access-validation";
import sessionValidation from "@/shared/lib/validations/user-session-validation";
import {
  categoryGetByIdSchema,
  categoryUpdateSchema,
} from "@/shared/lib/zods/category.zod";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await sessionValidation();

    if (!canManageCategory(session.role)) {
      throw forbidden("You're not allowed to access this feature");
    }

    const { id } = await params;

    if (!id) throw badRequest("Category id is missing");

    const result = await categoryService.delete(session, id, prisma);

    const response: CategoryCUDApiResponse = {
      message: result.message,
      data: {
        id: result.id,
      },
      status: 200,
    };

    return Response.json(response, { status: 200 });
  } catch (error) {
    printConsoleError(error, "DELETE", request.url);
    return handleError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await sessionValidation();

    if (!canManageCategory(session.role)) {
      throw forbidden("You're not allowed to access this feature");
    }

    const { id } = await params;

    if (!id) throw badRequest("Category id is missing");

    const body = await request.json();
    const payload = categoryUpdateSchema.parse(body);

    const result = await categoryService.update(session, id, payload, prisma);

    const response: CategoryCUDApiResponse = {
      message: result.message,
      data: {
        id: result.id,
      },
      status: 200,
    };
    return Response.json(response, { status: 200 });
  } catch (error) {
    printConsoleError(error, "PATCH", request.url);
    return handleError(error);
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await sessionValidation();

    if (!canManageCategory(session.role)) {
      throw forbidden("You're not allowed to access this feature");
    }

    const { id } = await params;

    if (!id) throw badRequest("Category id is missing");

    const { searchParams } = new URL(request.url);
    const rawSchemaParams = Object.fromEntries(searchParams.entries());
    const schemaParams = categoryGetByIdSchema.parse(rawSchemaParams);

    const result = await categoryService.getById(
      session,
      id,
      schemaParams,
      prisma,
    );

    const response: CategoryGetByIdApiResponse = {
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
