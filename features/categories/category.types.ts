import { ApiResponse } from "@/shared/lib/api-client";
import categoryService from "./category.service";

// Service Response
type CategoryListServiceResult = Awaited<
  ReturnType<typeof categoryService.getMany>
>;

// type CategoryCreateServiceResult = Awaited<
//   ReturnType<typeof categoryService.create>
// >;
// type CategoryUpdateServiceResult = Awaited<
//   ReturnType<typeof categoryService.update>
// >;
// type CategoryDeleteServiceResult = Awaited<
//   ReturnType<typeof categoryService.delete>
// >;

type CategoryGetServiceResult = Awaited<ReturnType<typeof categoryService.get>>;

// Api Response
export type CategoryGetApiResponse = ApiResponse<
  CategoryGetServiceResult["category"]
>;

export type CategoryListItem = CategoryListServiceResult["categories"][number];

export type CategoryListApiResponse = ApiResponse<
  CategoryListServiceResult["categories"]
>;

export type CategoryCreateApiResponse = ApiResponse<string>;

export type CategoryUpdateApiResponse = ApiResponse<null>;

export type CategoryDeleteApiResponse = ApiResponse<null>;
