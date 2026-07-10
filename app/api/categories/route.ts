import categoryService from "@/features/categories/category.service";
import {
  CategoryCUDApiResponse,
  CategoryGetManyApiResponse,
} from "@/features/categories/category.types";
import prisma from "@/shared/db/prisma";
import { forbidden } from "@/shared/lib/error-handlers";

import {
  handleError,
  printConsoleError,
} from "@/shared/lib/error-handlers/handleError";
import { canManageCategory } from "@/shared/lib/validations/user-access-validation";
import sessionValidation from "@/shared/lib/validations/user-session-validation";
import {
  categoryCreateSchema,
  categoryGetManySchema,
} from "@/shared/lib/zods/category.zod";

export async function POST(request: Request) {
  try {
    const session = await sessionValidation();

    if (!canManageCategory(session.role)) {
      throw forbidden("You're not allowed to access this feature");
    }

    const body = await request.json();
    const payload = categoryCreateSchema.parse(body);

    const result = await categoryService.create(session, payload, prisma);

    const response: CategoryCUDApiResponse = {
      message: result.message,
      data: {
        id: result.id,
      },
      status: 201,
    };

    return Response.json(response, { status: 201 });
  } catch (error) {
    printConsoleError(error, "POST", request.url);
    return handleError(error);
  }
}

export async function GET(req: Request) {
  try {
    const session = await sessionValidation();

    if (!canManageCategory(session.role)) {
      throw forbidden("You're not allowed to access this feature");
    }

    const { searchParams } = new URL(req.url);
    const rawSchemaParams = Object.fromEntries(searchParams.entries());
    const schemaParams = categoryGetManySchema.parse(rawSchemaParams);

    const result = await categoryService.getMany(session, schemaParams, prisma);

    const response: CategoryGetManyApiResponse = {
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
