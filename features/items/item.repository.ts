import { ItemCreateSchema, ItemUpdateSchema } from "@/shared/lib/zods/item.zod";
import { Prisma, PrismaClient } from "@prisma/client";

export const createSelectItemData = <T extends Prisma.ItemSelect>(
  select: T,
): T => select;

export const createIncludeItemData = <T extends Prisma.ItemSelect>(
  select: T,
): T => select;

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

  getById: async <T extends Prisma.ItemSelect>(
    itemId: string,
    itemSelect: Prisma.Subset<T, Prisma.ItemSelect>,
    stockWhereClause: Prisma.StockWhereInput,
    skipStockData: number | undefined,
    takeStockData: number | undefined,
    sortBy: string,
    orderBy: "asc" | "desc",
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return await tx.item.findUnique({
      where: { id: itemId },
      select: {
        ...itemSelect,
        stocks: {
          where: stockWhereClause,
          select: {
            quantity: true,
            type: true,
            updatedAt: true,
            expiredAt: true,
            location: true,
          },
          skip: skipStockData,
          take: takeStockData,
          ...(sortBy !== "status"
            ? {
                orderBy: {
                  [sortBy]: orderBy,
                },
              }
            : {}),
        },
      },
    });
  },

  getManyInclude: async <T extends Prisma.ItemSelect>(
    where: Prisma.ItemWhereInput,
    include: Prisma.Subset<T, Prisma.ItemInclude>,
    skip: number | undefined,
    take: number | undefined,
    sortBy: string,
    orderBy: "asc" | "desc",
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return await tx.item.findMany({
      where,
      include,
      skip,
      take,
      orderBy: {
        [sortBy]: orderBy,
      },
    });
  },

  countItems: async (
    where: Prisma.ItemWhereInput,
    tx: PrismaClient | Prisma.TransactionClient,
  ) => {
    return await tx.item.count({
      where,
    });
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
        isActive: data.isActive,
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
