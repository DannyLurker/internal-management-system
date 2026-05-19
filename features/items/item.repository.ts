import {
  ItemCreateSchema,
  ItemGetSchema,
  ItemUpdateSchema,
} from "@/shared/lib/zods/item.zod";
import { Prisma, PrismaClient } from "@prisma/client";

const itemRepository = {
  create: async (
    userId: string,
    data: ItemCreateSchema,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    const item = await tx.item.create({
      data: {
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        image: data.image,
        sellingPrice: data.sellingPrice ? data.sellingPrice : undefined,
        attributes: data.attributes,
        createdBy: userId,
      },
    });

    if (data.stock?.quantity) {
      const stock = await tx.stock.create({
        data: {
          quantity: data.stock?.quantity,
          type: "READY",
          createdBy: userId,
          locationId: data.locationId,
          expiredAt: data.stock?.expiredAt ? data.stock.expiredAt : undefined,
          itemId: item.id,
        },
      });

      await tx.stockMovement.create({
        data: {
          itemId: item.id,
          stockId: stock.id,
          quantity: data.stock?.quantity ? data.stock.quantity : 0,
          totalCost: data.stock?.totalCost ? data.stock.totalCost : 0,
          reason: data.stock?.reason,
          type: "RECEIVE",
          createdBy: userId,
          destinationLocationId: data.locationId,
          sourceLocationId: null,
        },
      });
    }

    return item;
  },

  getById: async (
    itemId: string,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return await tx.item.findUnique({
      where: {
        id: itemId,
      },
    });
  },

  getAll: async (
    params: ItemGetSchema,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    if (params.search && params.search.length >= 3) {
      return await tx.item.findMany({
        where: {
          name: {
            contains: params.search,
            mode: "insensitive",
          },
        },
        skip: params.isTakeAll
          ? (params.page - 1) * params.dataPerPage
          : undefined,
        take: params.isTakeAll ? params.dataPerPage : undefined,
        orderBy: {
          [params.sortBy]: params.orderBy,
        },
      });
    }

    if (params.isByCategory) {
      return await tx.item.findMany({
        where: {
          categoryId: params.categoryId,
        },
        skip: params.isTakeAll
          ? (params.page - 1) * params.dataPerPage
          : undefined,
        take: params.isTakeAll ? params.dataPerPage : undefined,
        orderBy: {
          [params.sortBy]: params.orderBy,
        },
      });
    }

    if (params.isByLocation) {
      return await tx.item.findMany({
        where: {},
        skip: params.isTakeAll
          ? (params.page - 1) * params.dataPerPage
          : undefined,
        take: params.isTakeAll ? params.dataPerPage : undefined,
        orderBy: {
          [params.sortBy]: params.orderBy,
        },
      });
    }

    return await tx.item.findMany({
      where: {},
      skip: params.isTakeAll
        ? (params.page - 1) * params.dataPerPage
        : undefined,
      take: params.isTakeAll ? params.dataPerPage : undefined,
      orderBy: {
        [params.sortBy]: params.orderBy,
      },
    });
  },

  update: async (
    userId: string,
    data: ItemUpdateSchema,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return await tx.item.update({
      where: {
        id: data.itemId,
      },
      data: {
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        image: data.image,
        sellingPrice: data.sellingPrice ? data.sellingPrice : undefined,
        attributes: data.attributes,
        updatedBy: userId,
      },
    });
  },

  delete: async (
    itemId: string,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return await tx.item.delete({
      where: {
        id: itemId,
      },
    });
  },
};

export default itemRepository;
