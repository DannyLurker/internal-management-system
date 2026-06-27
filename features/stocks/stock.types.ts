import { ApiResponse } from "@/shared/lib/api-client";
import stockService from "./stock.service";
import { StockGetManySchema } from "@/shared/lib/zods/stock.zod";

type StockServiceGetManyResponse = Awaited<
  ReturnType<typeof stockService.getMany>
>;

type StockServiceGetByIdResponse = Awaited<
  ReturnType<typeof stockService.getById>
>;

export type Stock = StockServiceGetManyResponse["data"]["stocks"][number];

// Create-Update-Delete
export type StockCUDApiResponse = ApiResponse<null>;

export type StockGetManyApiResponse = ApiResponse<
  StockServiceGetManyResponse["data"]
>;
export type StockGetByIdApiResponse = ApiResponse<
  StockServiceGetByIdResponse["data"]
>;

// Stock SortBy
export type StockSortBy = StockGetManySchema["sortBy"];
export type StockSortOrder = StockGetManySchema["sortOrder"];

// Stock Delete for delete action
export type StockDelete = {
  itemName: string;
  stockLocation: string;
  stockId: string;
};
