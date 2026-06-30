import { ApiResponse } from "@/shared/lib/api-client";
import stockMovementsService from "./stock-movements.service";

type StockMovementServiceGetMany = Awaited<
  ReturnType<typeof stockMovementsService.getMany>
>;

type StockMovementServiceGetById = Awaited<
  ReturnType<typeof stockMovementsService.getById>
>;

export type StockMovementGetManyApiResponse = ApiResponse<
  StockMovementServiceGetMany["data"]
>;
export type StockMovementGetByIdApiResponse = ApiResponse<
  StockMovementServiceGetById["data"]
>;

// Create-Update-Delete
export type StockMovementCUDApiResponse = ApiResponse<{
  id: string;
}>;
