import {
  ProductCreateSchema,
  ProductGetSchema,
  ProductUpdateSchema,
} from "@/shared/lib/zods/product.zod";
import { Prisma, PrismaClient } from "@prisma/client";

export const createProductInclude = <T extends Prisma.ProductInclude>(
  include: T,
) => include;

const productRepository = {
  get: async <T extends Prisma.ProductInclude>(
    productId: string,
    include: Prisma.Subset<Prisma.ProductInclude, T> | undefined,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    const product = await tx.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        ...include,
        stocks: {
          where: {
            type: "IN_STOCK",
            OR: [{ expiredAt: null }, { expiredAt: { gte: new Date() } }],
          },
        },
      },
    });

    return {
      ...product,
      totalStock: product!.stocks.reduce((sum, s) => sum + s.quantity, 0),
    };
  },

  getMany: async <T extends Prisma.ProductInclude>(
    params: ProductGetSchema,
    include: Prisma.Subset<Prisma.ProductInclude, T> | undefined,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    const products = await tx.product.findMany({
      where:
        params.search && params.search.length >= 3
          ? {
              name: {
                contains: params.search,
                mode: "insensitive",
              },
            }
          : undefined,
      include: {
        ...include,
        stocks: {
          where: {
            type: "IN_STOCK",
            OR: [
              { expiredAt: null }, // Keep it if it has no expiry date
              { expiredAt: { gte: new Date() } }, // Keep it if it's not expired yet
            ],
          },
          select: {
            quantity: true,
          },
        },
      },
      take: params.isTakeAll ? undefined : params.dataPerPage,
      skip: params.isTakeAll
        ? undefined
        : (params.page - 1) * params.dataPerPage,
      orderBy: {
        name:
          params.sortBy === "name"
            ? params.orderBy === "asc"
              ? "asc"
              : "desc"
            : undefined,
        price:
          params.sortBy === "price"
            ? params.orderBy === "asc"
              ? "asc"
              : "desc"
            : undefined,
        createdAt:
          params.sortBy === "createdAt"
            ? params.orderBy === "asc"
              ? "asc"
              : "desc"
            : undefined,
      },
    });

    return products.map((product) => ({
      ...product,
      totalStock: product.stocks.reduce((sum, s) => sum + s.quantity, 0),
    }));
  },

  getManyByCategory: async (
    params: ProductGetSchema,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    const category = await tx.category.findUnique({
      where: {
        id  : params.categoryId,
      },
      include: {
        products: {
          include: {
            stocks: {
              where: {
                type: "IN_STOCK",
                OR: [{ expiredAt: null }, { expiredAt: { gte: new Date() } }],
              },
              select: {
                quantity: true,
              },
            },
          },
        },
      },
    });

    return category?.products.map((product) => ({
      ...product,
      totalStock: product.stocks.reduce((sum, s) => sum + s.quantity, 0),
    }));
  },

  create: async (
    userId: string,
    data: ProductCreateSchema,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return await tx.product.create({
      data: {
        categoryId: data.categoryId,
        createdBy: userId,
        name: data.name,
        description: data.description,
        image: data.image,
        price: data.price,
        attributes: data.attributes ? data.attributes : undefined,
        stocks: data.initialStock
          ? {
              create: {
                createdBy: userId,
                quantity: data.initialStock,
                type: "IN_STOCK",
                expiredAt: data.expiredAt,
              },
            }
          : undefined,
        stockMovements: data.initialStock
          ? {
              create: {
                createdBy: userId,
                quantity: data.initialStock,
                type: "IN",
              },
            }
          : undefined,
      },
    });
  },
  update: async (
    userId: string,
    data: ProductUpdateSchema,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    await tx.product.update({
      where: {
        id: data.productId,
      },
      data: {
        categoryId: data.categoryId,
        updatedBy: userId,
        name: data.name,
        description: data.description,
        image: data.image,
        price: data.price,
        attributes: data.attributes ? data.attributes : undefined,
      },
    });
  },

  delete: async (
    productId: string,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return await tx.product.delete({
      where: {
        id: productId,
      },
      select: {
        name: true,
      },
    });
  },
};

export default productRepository;
