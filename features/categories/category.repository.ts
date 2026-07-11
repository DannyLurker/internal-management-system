import {
  CategoryGetByIdSchema,
  CategoryGetManySchema,
} from "@/shared/lib/zods/category.zod";
import { Prisma, PrismaClient } from "@prisma/client";

const categoryRepository = {
  buildWhereClause: (searchQuery?: string): Prisma.CategoryWhereInput => {
    if (!searchQuery) return {};

    if (searchQuery && searchQuery.length >= 3) {
      return {
        name: {
          contains: searchQuery,
          mode: "insensitive",
        },
      };
    }

    return {};
  },

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
    whereClause: Prisma.CategoryWhereInput,
    include: Prisma.CategoryInclude,
    sortBy: CategoryGetManySchema["sortBy"],
    sortOrder: CategoryGetManySchema["sortOrder"],
    skip: number,
    take: number,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return tx.category.findMany({
      where: whereClause,
      include,
      skip,
      take,
      ...(sortBy === "createdAt"
        ? {
            orderBy: {
              createdAt: sortOrder === "asc" ? "asc" : "desc",
            },
          }
        : {}),
      ...(sortBy === "name"
        ? {
            orderBy: {
              name: sortOrder === "asc" ? "asc" : "desc",
            },
          }
        : {}),
    });
  },

  countCategoryRows: async (
    where: Prisma.CategoryWhereInput,
    tx: Prisma.TransactionClient | PrismaClient,
  ) => {
    return tx.category.count({
      where,
    });
  },

  getById: async (
    categoryId: string,
    categorySelectData: Prisma.CategorySelect,
    itemWhereClause: Prisma.ItemWhereInput,
    selectItemData: Prisma.ItemSelect,
    sortBy: CategoryGetByIdSchema["sortBy"],
    sortOrder: CategoryGetByIdSchema["sortOrder"],
    skip: number,
    take: number,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return tx.category.findUnique({
      where: {
        id: categoryId,
      },
      select: {
        ...categorySelectData,
        items: {
          where: itemWhereClause,
          select: selectItemData,
          ...(sortBy === "createdAt"
            ? {
                orderBy: {
                  createdAt: sortOrder === "asc" ? "asc" : "desc",
                },
              }
            : {}),
          ...(sortBy === "name"
            ? {
                orderBy: {
                  name: sortOrder === "asc" ? "asc" : "desc",
                },
              }
            : {}),
          skip,
          take,
        },
      },
    });
  },

  get: async (
    categoryId: string,
    params: CategoryGetManySchema,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    const categories = await tx.category.findUnique({
      where: {
        id: categoryId,
      },
      include: {
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
        items: {
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

    if (!categories) return null;

    const totalProducts = await tx.item.count({
      where: {
        categoryId: categoryId,
        name:
          params.search && params.search.length >= 3
            ? {
                contains: params.search,
                mode: "insensitive",
              }
            : undefined,
      },
    });

    return {
      ...categories,
      totalProducts,
      products: categories.items.map((item) => ({
        ...item,
      })),
    };
  },
};

export default categoryRepository;
