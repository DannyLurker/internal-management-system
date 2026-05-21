import { ApiResponse } from "@/shared/lib/api-client";
import itemService from "./item.service";

export type ItemServiceGetById = Awaited<
  ReturnType<typeof itemService.getById>
>;
export type ItemServiceGetMany = Awaited<
  ReturnType<typeof itemService.getMany>
>;

export type ItemListItem = ItemServiceGetMany["data"]["items"][number];

/** List/detail shape used by the item management UI */
export type Item = ItemListItem;

// Api Response Types
export type ItemGetByIdApiResponse = ApiResponse<ItemServiceGetById["item"]>;
export type ItemGetManyApiResponse = ApiResponse<ItemServiceGetMany["data"]>;
export type ItemCreateApiResponse = ApiResponse<null>;
export type ItemUpdateApiResponse = ApiResponse<null>;
export type ItemDeleteApiResponse = ApiResponse<null>;
