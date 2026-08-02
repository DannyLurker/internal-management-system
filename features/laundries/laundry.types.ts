import { ApiResponse } from "@/shared/lib/api-client";

// Create-Update-Delete
export type LaundryCUDApiResponse = ApiResponse<{
  id: string;
}>;
