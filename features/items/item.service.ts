import prisma from "@/shared/db/prisma";
import { unauthorized } from "@/shared/lib/error-handlers";
import { canManageItem } from "@/shared/lib/validations/user-access-validation";
import sessionValidation from "@/shared/lib/validations/user-session-validation";
import {
  itemCreateSchema,
  ItemCreateSchema,
  itemGetSchema,
  itemUpdateSchema,
  ItemUpdateSchema,
} from "@/shared/lib/zods/item.zod";
import itemRepository from "./item.repository";
import auditLogsRepository from "../audit-logs/audit-log.repository";
import { mapItemListRow } from "./item.utils";

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

  getMany: async (rawParams: Record<string, string>) => {
    const session = await sessionValidation();
    const validatedParams = itemGetSchema.parse(rawParams);

    if (!canManageItem(session.role)) {
      throw unauthorized("You're not allowed to access this feature");
    }

    const { items, totalItemsCount, wasPaginatedByDb } =
      await itemRepository.getManyRawData(validatedParams, prisma);

    const processedItems = items.map((item) => mapItemListRow(item));

    let filteredItems = processedItems;
    if (!wasPaginatedByDb && validatedParams.status) {
      filteredItems = processedItems.filter(
        (item) => item.status === validatedParams.status,
      );
    }

    let finalItems = filteredItems;
    let finalTotal = totalItemsCount;

    if (!wasPaginatedByDb) {
      finalTotal = filteredItems.length;
      const skip = validatedParams.isTakeAll
        ? 0
        : (validatedParams.page - 1) * validatedParams.dataPerPage;
      const limit = validatedParams.isTakeAll
        ? finalTotal
        : validatedParams.dataPerPage;
      finalItems = filteredItems.slice(skip, skip + limit);
    }

    return {
      message: "Items retrieved successfully",
      data: {
        items: finalItems,
        totalItems: finalTotal,
      },
    };
  },

  getById: async (itemId: string) => {
    const session = await sessionValidation();

    if (!canManageItem(session.role)) {
      throw unauthorized("You're not allowed to access this feature");
    }

    const result = await itemRepository.getById(itemId, prisma);
    return {
      message: "Item retrieved successfully",
      item: result,
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
