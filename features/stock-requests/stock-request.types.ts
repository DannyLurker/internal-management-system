import { ApiResponse } from "@/shared/lib/api-client";
import { Role } from "@prisma/client";
import stockRequestService from "./stock-request.service";

export type StockRequestCUDApiResponse = ApiResponse<{
  id: string;
}>;

type StockRequestGetManyResult = Awaited<
  ReturnType<typeof stockRequestService.getMany>
>;

export type StockRequestGetManyApiResponse = ApiResponse<{
  stockRequests: StockRequestGetManyResult["data"]["stockRequests"];
  totalStockRequests: StockRequestGetManyResult["data"]["totalStockRequests"];
}>;

export const reviewerRoles: Role[] = ["HOTEL_MANAGER", "SUPERVISOR"];
export const requesterRoles: Role[] = ["HOUSEKEEPING", "FRONT_DESK"];
