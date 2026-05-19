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
        minTreshold: data.minTreshold,
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
      include: {
        stocks: true,
      },
    });
  },

  getMany: async (
    params: ItemGetSchema,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    if (params.search && params.search.length >= 3) {
      const items = await tx.item.findMany({
        where: {
          name: {
            contains: params.search,
            mode: "insensitive",
          },
        },
        include: {
          stocks: {
            where: {
              type: "READY",
              OR: [{ expiredAt: null }, { expiredAt: { gte: new Date() } }],
              quantity: { gte: 0 },
            },
            select: {
              quantity: true,
            },
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

      return items.map((item) => ({
        ...item,
        totalStock: item.stocks.reduce((sum, s) => sum + s.quantity, 0),
      }));
    }

    if (params.isByCategory) {
      const items = await tx.item.findMany({
        where: {
          categoryId: params.categoryId,
        },
        skip: params.isTakeAll
          ? (params.page - 1) * params.dataPerPage
          : undefined,
        include: {
          stocks: {
            where: {
              type: "READY",
              OR: [{ expiredAt: null }, { expiredAt: { gte: new Date() } }],
              quantity: { gte: 0 },
            },
            select: {
              quantity: true,
            },
          },
        },
        take: params.isTakeAll ? params.dataPerPage : undefined,
        orderBy: {
          [params.sortBy]: params.orderBy,
        },
      });

      return items.map((item) => ({
        ...item,
        totalStock: item.stocks.reduce((sum, s) => sum + s.quantity, 0),
      }));
    }

    const items = await tx.item.findMany({
      where: {},
      skip: params.isTakeAll
        ? (params.page - 1) * params.dataPerPage
        : undefined,
      include: {
        stocks: {
          where: {
            type: "READY",
            OR: [{ expiredAt: null }, { expiredAt: { gte: new Date() } }],
            quantity: { gte: 0 },
          },
          select: {
            quantity: true,
          },
        },
      },
      take: params.isTakeAll ? params.dataPerPage : undefined,
      orderBy: {
        [params.sortBy]: params.orderBy,
      },
    });

    return items.map((item) => ({
      ...item,
      totalStock: item.stocks.reduce((sum, s) => sum + s.quantity, 0),
    }));
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
        minTreshold: data.minTreshold,
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
