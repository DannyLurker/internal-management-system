import { ApiResponse } from "@/shared/lib/api-client";
import locationService from "./location.service";
import { LocationType } from "@prisma/client";

type LocationServiceGetMany = Awaited<
  ReturnType<typeof locationService.getMany>
>;

type LocationServiceGetById = Awaited<
  ReturnType<typeof locationService.getById>
>;

export type LocationListItem =
  LocationServiceGetMany["data"]["locations"][number];

export type LocationDetail = LocationServiceGetById["data"];

export type LocationStockItem = NonNullable<
  LocationDetail["location"]
>["stocks"][number];

export type LocationGetManyApiResponse = ApiResponse<
  LocationServiceGetMany["data"]
>;
export type LocationGetByIdApiResponse = ApiResponse<LocationDetail>;

// Create-Update-Delete
export type LocationCUDApiResponse = ApiResponse<{
  id: string;
}>;

export type LocationOption = {
  id: string;
  name: string;
  type: LocationType;
};

export const locationTypeLabels: Record<LocationType, string> = {
  MAIN_WAREHOUSE: "Main Warehouse",
  FRONT_OFFICE: "Front Office",
  FLOOR_LOCKER: "Floor Locker",
  VENDOR_LAUNDRY: "Laundry Vendor",
  OPERATIONAL: "Operational",
  GUEST_ROOM: "Guest Room",
};
