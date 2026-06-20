import prisma from "@/shared/db/prisma";
import { badRequest, unauthorized } from "@/shared/lib/error-handlers";
import {
  canDeleteItem,
  canManageItem,
} from "@/shared/lib/validations/user-access-validation";
import sessionValidation from "@/shared/lib/validations/user-session-validation";
import {
  itemCreateSchema,
  ItemCreateSchema,
  itemGetSchema,
  itemUpdateSchema,
  ItemUpdateSchema,
} from "@/shared/lib/zods/item.zod";
import itemRepository, { createIncludeItemData } from "./item.repository";
import auditLogsRepository from "../audit-logs/audit-log.repository";
import { mapItemListRow } from "./item.utils";
import { Prisma } from "@prisma/client";

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

    const whereClause: Prisma.ItemWhereInput = {
      isActive: validatedParams.status,
    };

    if (validatedParams.search && validatedParams.search.length >= 3) {
      whereClause.name = {
        contains: validatedParams.search,
        mode: "insensitive",
      };
    }
    if (validatedParams.isByCategory && validatedParams.categoryId) {
      whereClause.categoryId = validatedParams.categoryId;
    }

    // Pagination
    const skip = (validatedParams.page - 1) * validatedParams.dataPerPage;

    const take = validatedParams.dataPerPage;

    const includeQuery = createIncludeItemData({
      stocks: {
        where: {},
        select: { quantity: true, expiredAt: true },
      },
      category: { select: { id: true, name: true } },
    });

    const [items, totalItems] = await Promise.all([
      await itemRepository.getManyInclude(
        whereClause,
        includeQuery,
        skip,
        take,
        validatedParams.sortBy,
        validatedParams.orderBy,
        prisma,
      ),
      await itemRepository.countItems(whereClause, prisma),
    ]);

    // Add status field
    const formattedItems = items.map((item) => mapItemListRow(item));

    return {
      message: `Item data retrieved successfully`,
      data: {
        items: formattedItems,
        totalItems,
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
    if (!canDeleteItem(session.role)) {
      throw unauthorized("You're not allowed to access this feature");
    }

    const result = await prisma.$transaction(async (tx) => {
      const item = await itemRepository.getById(itemId, tx);

      if (item?.isActive) {
        throw badRequest(
          "You cannot delete an active item. Please deactivate it first.",
        );
      }

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
