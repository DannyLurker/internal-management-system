import { ApiResponse } from "@/shared/lib/api-client";
import locationService from "./location.service";

// Service result
type LocationServiceGetMany = Awaited<
  ReturnType<typeof locationService.getMany>
>;

type locationServiceGetById = Awaited<ReturnType<typeof locationService.get>>;

// Service API Response
export type LocationGetManyApiResponse = ApiResponse<
  LocationServiceGetMany["locations"]
>;
export type LocationGetByIdApiResponse = ApiResponse<
  locationServiceGetById["location"]
>;
export type LocationCreateApiResponse = ApiResponse<null>;
export type LocationUpdateApiResponse = ApiResponse<null>;
export type LocationDeleteApiResponse = ApiResponse<null>;
