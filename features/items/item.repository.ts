
import {
  ItemCreateSchema,
  ItemGetSchema,
  ItemUpdateSchema,
} from "@/shared/lib/zods/item.zod";
import { Prisma, PrismaClient } from "@prisma/client";
import { EXPIRING_WINDOW_DAYS } from "./item.utils";

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
      where: { id: itemId },
      include: { stocks: true },
    });
  },

  getManyRawData: async (
    params: ItemGetSchema,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    const whereClause: Prisma.ItemWhereInput = {};

    if (params.search && params.search.length >= 3) {
      whereClause.name = { contains: params.search, mode: "insensitive" };
    }
    if (params.isByCategory && params.categoryId) {
      whereClause.categoryId = params.categoryId;
    }

    const expiringWindow = new Date();
    expiringWindow.setDate(expiringWindow.getDate() + EXPIRING_WINDOW_DAYS);

    if (params.status === "OUT_OF_STOCK") {
      whereClause.stocks = { none: { type: "READY", quantity: { gt: 0 } } };
    } else if (params.status === "EXPIRING_SOON") {
      whereClause.stocks = {
        some: {
          type: "READY",
          expiredAt: { lte: expiringWindow, gte: new Date() },
        },
      };
    }

    const requiresInMemoryProcessing =
      params.status === "LOW_STOCK" || params.status === "IN_STOCK";

    const skip =
      params.isTakeAll || requiresInMemoryProcessing
        ? undefined
        : (params.page - 1) * params.dataPerPage;

    const take =
      params.isTakeAll || requiresInMemoryProcessing
        ? undefined
        : params.dataPerPage;

    const [items, totalItemsCount] = await Promise.all([
      tx.item.findMany({
        where: whereClause,
        include: {
          category: { select: { id: true, name: true } },
          stocks: {
            where: { type: "READY", quantity: { gte: 0 } },
            select: { quantity: true, expiredAt: true },
          },
        },
        skip,
        take,
        orderBy: { [params.sortBy]: params.orderBy },
      }),
      tx.item.count({ where: whereClause }),
    ]);

    return {
      items,
      totalItemsCount,
      wasPaginatedByDb: !requiresInMemoryProcessing,
    };
  },

  update: async (
    userId: string,
    data: ItemUpdateSchema,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return await tx.item.update({
      where: { id: data.itemId },
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
      where: { id: itemId },
    });
  },
};

export default itemRepository;
