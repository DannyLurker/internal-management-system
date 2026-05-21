import {
  ItemCreateSchema,
  ItemGetSchema,
  ItemUpdateSchema,
} from "@/shared/lib/zods/item.zod";
import { Prisma, PrismaClient } from "@prisma/client";

type ItemWithStocks = {
  stocks: { quantity: number; expiredAt?: Date | null }[];
  category?: { id: string; name: string } | null;
};

function mapItemListRow<T extends ItemWithStocks>(item: T) {
  const { stocks, ...rest } = item;
  const expiryDates = stocks
    .map((s) => s.expiredAt)
    .filter((d): d is Date => d != null)
    .sort((a, b) => a.getTime() - b.getTime());

  return {
    ...rest,
    totalStock: stocks.reduce((sum, s) => sum + s.quantity, 0),
    nearestExpiredAt: expiryDates[0] ?? null,
  };
}

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
        minThreshold: data.minThreshold ? data.minThreshold : undefined,
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
      const totalItems = await tx.item.count({
        where: {
          name: {
            contains: params.search,
            mode: "insensitive",
          },
        },
      });

      const items = await tx.item.findMany({
        where: {
          name: {
            contains: params.search,
            mode: "insensitive",
          },
        },
        include: {
          category: { select: { id: true, name: true } },
          stocks: {
            where: {
              type: "READY",
              OR: [{ expiredAt: null }, { expiredAt: { gte: new Date() } }],
              quantity: { gte: 0 },
            },
            select: {
              quantity: true,
              expiredAt: true,
            },
          },
        },
        skip: params.isTakeAll
          ? undefined
          : (params.page - 1) * params.dataPerPage,
        take: params.isTakeAll ? undefined : params.dataPerPage,
        orderBy: {
          [params.sortBy]: params.orderBy,
        },
      });

      return { items: items.map((item) => mapItemListRow(item)), totalItems };
    }

    if (params.isByCategory) {
      const totalItems = await tx.item.count({
        where: {
          categoryId: params.categoryId,
        },
      });

      const items = await tx.item.findMany({
        where: {
          categoryId: params.categoryId,
        },
        skip: params.isTakeAll
          ? undefined
          : (params.page - 1) * params.dataPerPage,
        include: {
          category: { select: { id: true, name: true } },
          stocks: {
            where: {
              type: "READY",
              OR: [{ expiredAt: null }, { expiredAt: { gte: new Date() } }],
              quantity: { gte: 0 },
            },
            select: {
              quantity: true,
              expiredAt: true,
            },
          },
        },
        take: params.isTakeAll ? undefined : params.dataPerPage,
        orderBy: {
          [params.sortBy]: params.orderBy,
        },
      });

      return { items: items.map((item) => mapItemListRow(item)), totalItems };
    }

    const totalItems = await tx.item.count();

    const items = await tx.item.findMany({
      where: {},
      skip: params.isTakeAll
        ? undefined
        : (params.page - 1) * params.dataPerPage,
      include: {
        category: { select: { id: true, name: true } },
        stocks: {
          where: {
            type: "READY",
            OR: [{ expiredAt: null }, { expiredAt: { gte: new Date() } }],
            quantity: { gte: 0 },
          },
          select: {
            quantity: true,
            expiredAt: true,
          },
        },
      },
      take: params.isTakeAll ? undefined : params.dataPerPage,
      orderBy: {
        [params.sortBy]: params.orderBy,
      },
    });

    return { items: items.map((item) => mapItemListRow(item)), totalItems };
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
        minThreshold: data.minThreshold ? data.minThreshold : undefined,
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
