import prisma from "@/shared/db/prisma";
import { unauthorized } from "@/shared/lib/error-handlers";
import { canManageItem } from "@/shared/lib/validations/user-access-validation";
import sessionValidation from "@/shared/lib/validations/user-session-validation";
import {
  itemCreateSchema,
  ItemCreateSchema,
  itemUpdateSchema,
  ItemUpdateSchema,
} from "@/shared/lib/zods/item.zod";
import itemRepository from "./item.repository";
import auditLogsRepository from "../audit-logs/audit-log.repository";

const itemService = {
  create: async (rawData: ItemCreateSchema) => {
    const session = await sessionValidation();
    const validatedData = itemCreateSchema.parse(rawData);

    if (!canManageItem(session.role)) {
      throw unauthorized("You're not allowed to access this feature");
    }

    const result = await prisma.$transaction(async (tx) => {
      const item = await itemRepository.create(session.id, validatedData, tx);

      await auditLogsRepository.create(
        {
          userId: session.id,
          action: "CREATE",
          entity: "ITEM",
          entityId: item.id,
          metadata: {
            name: item.name,
            categoryId: item.categoryId,
            locationId: validatedData.locationId,
            sellingPrice: item.sellingPrice,
            initialStock: validatedData.stock?.quantity ?? 0,
          },
        },
        tx,
      );

      return item;
    });

    return {
      message: `${result.name} created successfully`,
    };
  },

  update: async (rawData: ItemUpdateSchema) => {
    const session = await sessionValidation();
    const validatedData = itemUpdateSchema.parse(rawData);

    if (!canManageItem(session.role)) {
      throw unauthorized("You're not allowed to access this feature");
    }

    const result = await prisma.$transaction(async (tx) => {
      const item = await itemRepository.update(session.id, validatedData, tx);

      await auditLogsRepository.create(
        {
          userId: session.id,
          action: "UPDATE",
          entity: "ITEM",
          entityId: item.id,
          metadata: {
            name: item.name,
            categoryId: item.categoryId,
            sellingPrice: item.sellingPrice,
          },
        },
        tx,
      );

      return item;
    });

    return {
      message: `${result.name} updated successfully`,
    };
  },

  delete: async (itemId: string) => {
    const session = await sessionValidation();
    if (!canManageItem(session.role)) {
      throw unauthorized("You're not allowed to access this feature");
    }

    const result = await prisma.$transaction(async (tx) => {
      const deletedItem = await itemRepository.delete(itemId, tx);
      await auditLogsRepository.create(
        {
          userId: session.id,
          action: "DELETE",
          entity: "ITEM",
          entityId: deletedItem.id,
          metadata: {
            name: deletedItem.name,
          },
        },
        tx,
      );
      return deletedItem;
    });

    return {
      message: `${result.name} deleted successfully`,
    };
  },
};

export default itemService;
