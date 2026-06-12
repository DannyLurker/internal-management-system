import { ApiResponse } from "@/shared/lib/api-client";
import stockService from "./stock.service";

type StockServiceGetManyResponse = Awaited<
  ReturnType<typeof stockService.getMany>
>;

type StockServiceGetByIdResponse = Awaited<ReturnType<typeof stockService.get>>;

export type Stock = StockServiceGetManyResponse["data"]["stocks"][number];

// Create-Update-Delete
export type StockCUDApiResponse = ApiResponse<null>;

export type StockGetManyApiResponse = ApiResponse<
  StockServiceGetManyResponse["data"]
>;
export type StockGetByIdApiResponse = ApiResponse<
  StockServiceGetByIdResponse["data"]
>;
