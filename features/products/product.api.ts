import { api, ApiResponse } from "@/shared/lib/api-client";
import {
  ProductCreateResponse,
  ProductDeleteResponse,
  ProductGetManyResponse,
  ProductGetResponse,
  ProductUpdateResponse,
} from "./product.types";
import {
  ProductCreateSchema,
  ProductGetSchema,
} from "@/shared/lib/zods/product.zod";

export const productApi = {
  getMany: async (params: ProductGetSchema) => {
    const response = await api.get<ApiResponse<ProductGetManyResponse>>(
      "/products",
      {
        params,
      },
    );

    return response.data.data;
  },
  get: async (productId: string) => {
    const response = await api.get<ApiResponse<ProductGetResponse>>(
      `/products/${productId}`,
    );

    return response.data.data;
  },
  create: async (payload: ProductCreateSchema) => {
    const response = await api.post<ApiResponse<ProductCreateResponse>>(
      "/products",
      payload,
    );
    return response.data.data;
  },
  update: async (payload: ProductCreateSchema) => {
    const response = await api.put<ApiResponse<ProductUpdateResponse>>(
      `/products`,
      payload,
    );
    return response.data.data;
  },
  delete: async (productId: string) => {
    const response = await api.delete<ApiResponse<ProductDeleteResponse>>(
      `/products/${productId}`,
    );
    return response.data.data;
  },
};
