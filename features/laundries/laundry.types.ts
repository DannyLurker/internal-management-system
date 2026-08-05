import { ApiResponse } from "@/shared/lib/api-client";
import { Return } from "@prisma/client/runtime/client";
import { laundryService } from "./laundry.service";

export type LaundryGetManyService = Awaited<
  Return<typeof laundryService.getMany>
>;
export type LaundryGetByIdService = Awaited<
  Return<typeof laundryService.getById>
>;

// Response APIs
export type LaundryCUDApiResponse = ApiResponse<{
  id: string;
}>;

export type Laundry = LaundryGetByIdService["laundry"];

export type LaundryGetManyApiResponse = ApiResponse<LaundryGetManyService>;
export type LaundryGetByIdApiResponse = ApiResponse<
  LaundryGetByIdService["laundry"]
>;

export type LocationOption = {
  id: string;
  name: string;
};

export type LaundryFilterStatus = "ALL" | "SENT" | "RETURNED" | "CANCELLED";
