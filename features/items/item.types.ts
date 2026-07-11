import { ApiResponse } from "@/shared/lib/api-client";
import itemService from "./item.service";
import { itemStockStatusArray } from "./item.utils";
import z from "zod";
import { filterItemByEnum } from "@/shared/lib/zods/general.zod";

export type ItemServiceGetById = Awaited<
  ReturnType<typeof itemService.getById>
>;
export type ItemServiceGetMany = Awaited<
  ReturnType<typeof itemService.getMany>
>;

export type ItemListItem = ItemServiceGetMany["data"]["items"][number];

/** List/detail shape used by the item management UI */
export type Item = ItemListItem;

export type StockInItemById =
  | ItemServiceGetById["data"]["item"]["stocks"][number]
  | undefined;

// Api Response Types
export type ItemGetByIdApiResponse = ApiResponse<ItemServiceGetById["data"]>;
export type ItemGetManyApiResponse = ApiResponse<ItemServiceGetMany["data"]>;

// Create-Update-Delete
export type ItemCUDApiResponse = ApiResponse<{
  id: string;
}>;

export type ItemStockStatus = (typeof itemStockStatusArray)[number];

// Frontend types
export type AttributeRow = { key: string; value: string };

export type DeleteOrActivateStatus = "DELETE" | "INACTIVE" | "ACTIVE";

// Item filtering parameters. For building where clause
export type filterItemBy = z.infer<typeof filterItemByEnum> | null;
