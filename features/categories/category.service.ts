import sessionValidation from "@/shared/lib/validations/user-session-validation";
import {
  categoryCreateSchema,
  CategoryCreateSchema,
  categoryGetSchema,
  categoryUpdateSchema,
  CategoryUpdateSchema,
} from "@/shared/lib/zods/category.zod";
import categoryRepository from "./category.repository";
import prisma from "@/shared/db/prisma";
import { canManageCategory } from "@/shared/lib/validations/user-access-validation";
import { forbidden } from "@/shared/lib/error-handlers";
import auditLogsRepository from "../audit-logs/audit-log.repository";

const categoryService = {
  get: async (categoryId: string, params: { [key: string]: string }) => {
    const session = await sessionValidation();
    const validatedParams = categoryGetSchema.parse(params);

    if (!canManageCategory(session.role)) {
      throw forbidden("You're not allowed to access this feature");
    }

    const category = await categoryRepository.get(
      categoryId,
      validatedParams,
      prisma,
    );

    return {
      message: "Category retrieved successfully",
      category,
    };
  },

  getMany: async (params: { [key: string]: string }) => {
    const session = await sessionValidation();
    const validatedParams = categoryGetSchema.parse(params);

    if (!canManageCategory(session.role)) {
      throw forbidden("You're not allowed to access this feature");
    }

    const categories = await categoryRepository.getMany(
      validatedParams,
      prisma,
    );

    return {
      message: "Categories retrieved successfully",
      categories,
    };
  },

  create: async (data: CategoryCreateSchema) => {
    const session = await sessionValidation();
    const validatedData = categoryCreateSchema.parse(data);

    if (!canManageCategory(session.role)) {
      throw forbidden("You're not allowed to access this feature");
    }

    const newCategory = await prisma.$transaction(async (tx) => {
      const created = await categoryRepository.create(
        { name: validatedData.name, createdBy: session.id },
        tx,
      );

      await auditLogsRepository.create(
        {
          action: "CREATE",
          entity: "CATEGORY",
          entityId: created.id,
          metadata: { id: created.id, name: created.name },
          userId: session.id,
        },
        tx,
      );

      return created;
    });

    return {
      message: `${newCategory.name} category was successfully created`,
      id: newCategory.id,
    };
  },

  update: async (data: CategoryUpdateSchema) => {
    const session = await sessionValidation();
    const validatedData = categoryUpdateSchema.parse(data);

    if (!canManageCategory(session.role)) {
      throw forbidden("You're not allowed to access this feature");
    }

    const result = await prisma.$transaction(async (tx) => {
      // Get existing category for audit log
      const existingCategory = await tx.category.findUnique({
        where: { id: validatedData.id },
      });

      const category = await categoryRepository.update(
        { id: validatedData.id, name: validatedData.name },
        tx,
      );

      await auditLogsRepository.create(
        {
          action: "UPDATE",
          entity: "CATEGORY",
          entityId: category.id,
          metadata: {
            id: category.id,
            oldName: existingCategory?.name,
            newName: category.name,
          },
          userId: session.id,
        },
        tx,
      );

      return category;
    });

    return {
      message: `Succesfully updated into ${result.name}`,
    };
  },

  delete: async (categoryId: string) => {
    const session = await sessionValidation();

    if (!canManageCategory(session.role)) {
      throw forbidden("You're not allowed to access this feature");
    }

    const result = await prisma.$transaction(async (tx) => {
      // Get existing category for audit log before deletion
      const existingCategory = await tx.category.findUnique({
        where: { id: categoryId },
      });

      const category = await categoryRepository.delete(categoryId, tx);

      await auditLogsRepository.create(
        {
          action: "DELETE",
          entity: "CATEGORY",
          entityId: categoryId,
          metadata: {
            id: categoryId,
            name: existingCategory?.name,
          },
          userId: session.id,
        },
        tx,
      );

      return category;
    });

    return {
      message: `${result.name} category was succesfully deleted`,
    };
  },
};

export default categoryService;
