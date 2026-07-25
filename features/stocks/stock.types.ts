import { ApiResponse } from "@/shared/lib/api-client";
import stockService from "./stock.service";
import { StockGetManySchema } from "@/shared/lib/zods/stock.zod";
import { StockType } from "@prisma/client";

type StockServiceGetManyResponse = Awaited<
  ReturnType<typeof stockService.getMany>
>;

type StockServiceGetByIdResponse = Awaited<
  ReturnType<typeof stockService.getById>
>;

export type Stock = {
  id: string;
  type: StockType;
  quantity?: number;
  expiredAt: Date | null;
  updatedAt?: Date;
  locationId: string;
  itemId: string;
  location: {
    name: string;
    id: string;
  } | null;
  item: {
    name: string;
    id: string;
  };
};

// Create-Update-Delete
export type StockCUDApiResponse = ApiResponse<{
  stockId: string;
  itemId?: string;
}>;
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
