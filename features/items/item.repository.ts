import { ItemCreateSchema } from "@/shared/lib/zods/item.zod";
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
          expiredAt: data.expiredAt ? data.expiredAt : undefined,
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
};

export default itemRepository;
