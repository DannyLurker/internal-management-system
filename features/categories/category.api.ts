import { api } from "@/shared/lib/api-client";

import {
  CategoryCreateSchema,
  CategoryGetByIdSchema,
  CategoryGetManySchema,
  CategoryUpdateSchema,
} from "@/shared/lib/zods/category.zod";
import {
  CategoryCUDApiResponse,
  CategoryGetByIdApiResponse,
  CategoryGetManyApiResponse,
} from "./category.types";

const categoryApi = {
  getById: async (categoryId: string, params: CategoryGetByIdSchema) => {
    const response = await api.get<CategoryGetByIdApiResponse>(
      `/categories/${categoryId}`,
      { params },
    );

    return response.data;
  },

  getMany: async (params: CategoryGetManySchema) => {
    const response = await api.get<CategoryGetManyApiResponse>("/categories", {
      params,
    });

    return response.data;
  },

  create: async (payload: CategoryCreateSchema) => {
    const result = await api.post<CategoryCUDApiResponse>(
      "/categories",
      payload,
    );

    return result.data;
  },

  update: async (categoryId: string, payload: CategoryUpdateSchema) => {
    const result = await api.patch<CategoryCUDApiResponse>(
      `/categories/${categoryId}`,
      payload,
    );

    return result.data;
  },

  delete: async (categoryId: string) => {
    const result = await api.delete<CategoryCUDApiResponse>(
      `/categories/${categoryId}`,
    );

    return result.data;
  },
};

export default categoryApi;
