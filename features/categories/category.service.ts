import {
  CategoryCreateSchema,
  CategoryGetByIdSchema,
  CategoryGetManySchema,
  CategoryUpdateSchema,
} from "@/shared/lib/zods/category.zod";
import categoryRepository from "./category.repository";
import { badRequest, notFound } from "@/shared/lib/error-handlers";
import auditLogsRepository from "../audit-logs/audit-log.repository";
import { Session } from "next-auth";
import { Prisma, PrismaClient } from "@prisma/client";
import categoryRules from "./category.rule";
import itemRepository from "../items/item.repository";

const categoryService = {
  getById: async (
    session: Session["user"],
    categoryId: string,
    params: CategoryGetByIdSchema,
    prisma: PrismaClient,
  ) => {
    const itemWhereClause = itemRepository.buildWhereClause(params.search);

    const categoryIncludeRelation: Prisma.CategoryInclude = {
      userCreatedBy: {
        select: {
          name: true,
        },
      },
      userUpdatedBy: {
        select: {
          name: true,
        },
      },
    };

    // Category model has a relation with Item model
    const selectItemData: Prisma.ItemSelect = {
      name: true,
      userCreatedBy: {
        select: {
          name: true,
        },
      },
      userUpdatedBy: {
        select: {
          name: true,
        },
      },
      updatedAt: true,
    };

    const skip = (params.page - 1) * params.dataPerPage;

    const category = await categoryRepository.getById(
      categoryId,
      categoryIncludeRelation,
      itemWhereClause,
      selectItemData,
      params.sortBy,
      params.sortOrder,
      skip,
      params.dataPerPage,
      prisma,
    );

    let countItems;

    if (category?.items && category?.items.length > 0) {
      countItems = await itemRepository.countItems(
        {
          id: category?.items[0].id,
        },
        prisma,
      );
    }

    if (!category) throw notFound("Category not found");

    return {
      message: "Category retrieved successfully",
      category: {
        ...category,
        totalItems: countItems ?? 0,
      },
    };
  },

  getMany: async (
    session: Session["user"],
    params: CategoryGetManySchema,
    prisma: PrismaClient,
  ) => {
    const whereClasuse = categoryRepository.buildWhereClause(params.search);

    const include: Prisma.CategoryInclude = {
      _count: {
        select: {
          items: true,
        },
      },
    };

    const skip = (params.page - 1) * 10;

    const categories = await categoryRepository.getMany(
      whereClasuse,
      include,
      params.sortBy,
      params.sortOrder,
      skip,
      params.dataPerPage,
      prisma,
    );

    const totalCategoryData = await categoryRepository.countCategoryRows(
      {},
      prisma,
    );

    const formattedCategories = {
      categories: categories.map((category) => ({
        ...category,
        totalItems: category._count.items,
      })),
      totalCategoryData,
    };

    return {
      message: "Category data retrieved Successfully.",
      categories: formattedCategories,
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
    categoryId: string,
    payload: CategoryUpdateSchema,
    prisma: PrismaClient,
  ) => {
    const result = await prisma.$transaction(async (tx) => {
      // Get existing category for audit log
      const existingCategory = await tx.category.findUnique({
        where: { id: categoryId },
      });

      const category = await categoryRepository.update(
        { id: categoryId, name: payload.name },
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
