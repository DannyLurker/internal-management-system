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
  itemGetDetailSchema,
  itemGetManyschema,
  itemUpdateSchema,
  ItemUpdateSchema,
} from "@/shared/lib/zods/item.zod";
import itemRepository, {
  createIncludeItemData,
  createSelectItemData,
} from "./item.repository";
import auditLogsRepository from "../audit-logs/audit-log.repository";
import { EXPIRING_WINDOW_DAYS, mapItemListRow } from "./item.utils";
import { Prisma, StockType } from "@prisma/client";
import { stockRepository } from "../stocks/stock.repository";

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
    const validatedParams = itemGetManyschema.parse(rawParams);

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

  getById: async (itemId: string, rawParams: Record<string, string>) => {
    const session = await sessionValidation();

    if (!canManageItem(session.role)) {
      throw unauthorized("You're not allowed to access this feature");
    }

    if (!itemId) throw badRequest("Item id is missing");

    const validatedParams = itemGetDetailSchema.parse(rawParams);

    const stockWhereClause: Prisma.StockWhereInput = {
      itemId: itemId,
    };
    const today = new Date();

    const expiringWindow = new Date();
    expiringWindow.setDate(expiringWindow.getDate() + EXPIRING_WINDOW_DAYS);

    if (validatedParams.sortBy === "type") {
      // Non query status means that, you don't have to make any prisma logic like gte, lte, and etc. Just show something in one line like stockWhereClause.type = validatedParams.stateus
      const nonQueryStatus = ["READY", "DAMAGED", "DIRTY"] as StockType[];

      if (nonQueryStatus.includes(validatedParams.status as StockType)) {
        stockWhereClause.type = validatedParams.status as StockType;
      }

      if (validatedParams.status === "EXPIRED") {
        stockWhereClause.OR = [{ type: "EXPIRED" }, { type: "READY" }];
        stockWhereClause.expiredAt = {
          lt: today,
        };
      }

      if (validatedParams.status === "EXPIRING_SOON") {
        stockWhereClause.OR = [{ type: "READY" }, { type: "EXPIRED" }];
        stockWhereClause.expiredAt = {
          gte: today,
          lte: expiringWindow,
        };
      }
    }

    const skipItemStocks =
      (validatedParams.itemStockPage - 1) * validatedParams.itemStocksPerpage;

    const takeItemStocksPerPage = validatedParams.itemStocksPerpage;

    const itemSelectField = createSelectItemData({
      id: true,
      name: true,
      updatedAt: true,
      userCreatedBy: { select: { name: true } },
      userUpdatedBy: { select: { name: true } },
      minThreshold: true,
      description: true,
      image: true,
      category: true,
      sellingPrice: true,
      isActive: true,
      createdAt: true,
      createdBy: true,
      updatedBy: true,
    });

    const item = await itemRepository.getById(
      itemId,
      itemSelectField,
      stockWhereClause,
      skipItemStocks,
      takeItemStocksPerPage,
      validatedParams.sortBy,
      validatedParams.orderBy,
      prisma,
    );

    // Count the row
    const stockRows = await stockRepository.countRows(stockWhereClause, prisma);

    const totalReadyStock = await stockRepository.countQuantity(
      {
        itemId: itemId,
        type: "READY",
        OR: [
          { expiredAt: null },
          {
            expiredAt: {
              gte: today,
            },
          },
        ],
      },
      prisma,
    );

    const isStockLow =
      item && totalReadyStock && totalReadyStock <= item?.minThreshold
        ? true
        : false;

    const totalItemStocks = await stockRepository.countQuantity(
      {
        itemId: itemId,
      },
      prisma,
    );

    return {
      message: "Item retrieved successfully",
      data: {
        item: {
          ...item,
          stocks:
            item?.stocks.length && item?.stocks.length > 0 ? item?.stocks : [],
          isStockLow: isStockLow ? "Low in stock" : "-",
        },
        totalItemStockQuantity: totalItemStocks,
        itemStockRows: stockRows,
      },
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
      const selectItemData = createSelectItemData({
        isActive: true,
      });

      const item = await itemRepository.getById(
        itemId,
        selectItemData,
        {},
        undefined,
        undefined,
        "quantity",
        "asc",
        tx,
      );

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
