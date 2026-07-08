import {
  CategoryCreateSchema,
  CategoryGetManySchema,
  CategoryUpdateSchema,
} from "@/shared/lib/zods/category.zod";
import categoryRepository from "./category.repository";
import { badRequest } from "@/shared/lib/error-handlers";
import auditLogsRepository from "../audit-logs/audit-log.repository";
import { Session } from "next-auth";
import { PrismaClient } from "@prisma/client";
import categoryRules from "./category.rule";

const categoryService = {
  get: async (
    session: Session["user"],
    categoryId: string,
    params: CategoryGetManySchema,
    prisma: PrismaClient,
  ) => {
    const category = await categoryRepository.get(categoryId, params, prisma);

    return {
      message: "Category retrieved successfully",
      category,
    };
  },

  getMany: async (
    session: Session["user"],
    params: CategoryGetManySchema,
    prisma: PrismaClient,
  ) => {
    const categories = await categoryRepository.getMany(params, prisma);

    return {
      message: "Categories retrieved successfully",
      categories,
    };
  },

  create: async (
    session: Session["user"],
    payload: CategoryCreateSchema,
    prisma: PrismaClient,
  ) => {
    const result = await prisma.$transaction(async (tx) => {
      const created = await categoryRepository.create(
        { name: payload.name, createdBy: session.id },
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
      message: `${result.name} category was successfully created`,
      id: result.id,
    };
  },

  update: async (
    session: Session["user"],
    payload: CategoryUpdateSchema,
    prisma: PrismaClient,
  ) => {
    const result = await prisma.$transaction(async (tx) => {
      // Get existing category for audit log
      const existingCategory = await tx.category.findUnique({
        where: { id: payload.id },
      });

      const category = await categoryRepository.update(
        { id: payload.id, name: payload.name },
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
      id: result.id,
    };
  },

  delete: async (
    session: Session["user"],
    categoryId: string,
    prisma: PrismaClient,
  ) => {
    const result = await prisma.$transaction(async (tx) => {
      // Get existing category for audit log before deletion
      const existingCategory = await tx.category.findUnique({
        where: { id: categoryId },
        select: {
          name: true,
          items: {
            select: {
              id: true,
            },
            take: 1,
          },
        },
      });

      if (!existingCategory) throw badRequest("Category not found");

      const deletionResult = categoryRules.canDeleteCategory({
        items: existingCategory.items ?? [],
      });

      if (!deletionResult.allowed) throw badRequest(deletionResult.reason);

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
      id: result.id,
    };
  },
};

export default categoryService;
