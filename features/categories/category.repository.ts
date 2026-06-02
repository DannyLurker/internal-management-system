import prisma from "@/shared/db/prisma";
import { CategoryGetSchema } from "@/shared/lib/zods/category.zod";
import { Prisma, PrismaClient } from "@prisma/client";

const categoryRepository = {
  create: async (
    data: Prisma.CategoryUncheckedCreateInput,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return await tx.category.create({
      data: {
        name: data.name,
        createdBy: data.createdBy,
      },
    });
  },

  update: async (
    data: Prisma.CategoryUpdateInput,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return await tx.category.update({
      where: {
        id: data.id as string,
      },
      data: {
        name: data.name,
      },
    });
  },

  delete: async (
    categoryId: string,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return await tx.category.delete({
      where: {
        id: categoryId,
      },
    });
  },

  getMany: async (
    params: CategoryGetSchema,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    const categories = await tx.category.findMany({
      where: {
        name:
          params.search && params.search.length >= 3
            ? {
                contains: params.search,
                mode: "insensitive",
              }
            : undefined,
      },
      select: {
        products: {
          select: {
            id: true,
          },
        },
        name: true,
        updatedAt: true,
        id: true,
      },
      orderBy: {
        createdAt:
          params.sortBy === "createdAt"
            ? params.sortOrder === "asc"
              ? "asc"
              : "desc"
            : undefined,
        name:
          params.sortBy === "name"
            ? params.sortOrder === "asc"
              ? "asc"
              : "desc"
            : undefined,
      },
      skip: (params.page - 1) * params.dataPerPage,
      take: params.dataPerPage,
    });

    const totalCategoryData = await prisma.category.count({});

    return {
      categories: categories.map((category) => ({
        ...category,
        totalProducts: category.products.length,
      })),
      totalCategoryData,
    };
  },

  get: async (
    categoryId: string,
    params: CategoryGetSchema,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    const categories = await tx.category.findUnique({
      where: {
        id: categoryId,
      },
      include: {
        products: {
          where: {
            name:
              params.search && params.search.length >= 3
                ? {
                    contains: params.search,
                    mode: "insensitive",
                  }
                : undefined,
          },
          select: {
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
          },
          orderBy: {
            createdAt:
              params.sortBy === "createdAt"
                ? params.sortOrder === "asc"
                  ? "asc"
                  : "desc"
                : undefined,
            name:
              params.sortBy === "name"
                ? params.sortOrder === "asc"
                  ? "asc"
                  : "desc"
                : undefined,
          },
          skip: (params.page - 1) * params.dataPerPage,
          take: params.dataPerPage,
        },
      },
    });

    return categories
      ? {
          ...categories,
          totalProducts: categories.products.length,
          products: categories.products.map((product) => ({
            ...product,
          })),
        }
      : null;
  },
};

export default categoryRepository;
