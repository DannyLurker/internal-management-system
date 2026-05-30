import { ApiResponse } from "@/shared/lib/api-client";
import locationService from "./location.service";

type LocationServiceGetMany = Awaited<
  ReturnType<typeof locationService.getMany>
>;

type LocationServiceGetById = Awaited<ReturnType<typeof locationService.get>>;

export type LocationListItem = LocationServiceGetMany["locations"][number];

export type LocationDetail = LocationServiceGetById["location"];

export type LocationStockItem = LocationDetail["stocks"][number];

export type LocationGetManyApiResponse = ApiResponse<
  LocationServiceGetMany["locations"]
>;
export type LocationGetByIdApiResponse = ApiResponse<LocationDetail>;
export type LocationCreateApiResponse = ApiResponse<null>;
export type LocationUpdateApiResponse = ApiResponse<null>;
export type LocationDeleteApiResponse = ApiResponse<null>;
