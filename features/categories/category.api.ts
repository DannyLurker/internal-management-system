import { api, ApiResponse } from "@/shared/lib/api-client";
import {
  CategoryCreateApiResponse,
  CategoryDeleteApiResponse,
  CategoryGetApiResponse,
  CategoryListApiResponse,
  CategoryUpdateApiResponse,
} from "./category.types";
import {
  CategoryCreateSchema,
  categoryGetSchema,
  CategoryGetSchema,
  CategoryUpdateSchema,
} from "@/shared/lib/zods/category.zod";

const categoryApi = {
  get: async (
    categoryId: string,
    params: CategoryGetSchema = categoryGetSchema.parse({}),
  ) => {
    const response = await api.get<CategoryGetApiResponse>(
      `/categories/${categoryId}`,
      { params },
    );

    return response.data;
  },

  getMany: async (params: CategoryGetSchema) => {
    const response = await api.get<CategoryListApiResponse>("/categories", {
      params,
    });

    return response.data;
  },

  create: async (payload: CategoryCreateSchema) => {
    return await api.post<CategoryCreateApiResponse>("/categories", payload);
  },

  update: async (payload: CategoryUpdateSchema) => {
    return await api.patch<CategoryUpdateApiResponse>(`/categories`, payload);
  },

  delete: async (categoryId: string) => {
    return await api.delete<CategoryDeleteApiResponse>(
      `/categories/${categoryId}`,
    );
  },
};

export default categoryApi;
