import { ApiResponse } from "@/shared/lib/api-client";
import categoryService from "./category.service";

// Service Response
type CategoryListServiceResult = Awaited<
  ReturnType<typeof categoryService.getMany>
>;

type CategoryGetServiceResult = Awaited<ReturnType<typeof categoryService.get>>;

// Api Response
export type CategoryGetByIdApiResponse = ApiResponse<
  CategoryGetServiceResult["category"]
>;

export type CategoryListItem =
  CategoryListServiceResult["categories"]["categories"][number];

export type CategoryGetManyApiResponse = ApiResponse<
  CategoryListServiceResult["categories"]
>;

// Create-Update-delete
export type CategoryCUDApiResponse = ApiResponse<{
  id: string;
}>;
