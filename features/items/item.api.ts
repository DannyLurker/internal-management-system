import { api } from "@/shared/lib/api-client";
import {
  ItemCreateSchema,
  ItemGetByIdSchema,
  ItemUpdateSchema,
} from "@/shared/lib/zods/item.zod";
import {
  ItemCUDApiResponse,
  ItemGetByIdApiResponse,
  ItemGetManyApiResponse,
} from "./item.types";

const itemApi = {
  create: async (rawData: ItemCreateSchema) => {
    const result = await api.post<ItemCUDApiResponse>("/items", rawData);

    return result.data;
  },

  getMany: async (params: Record<string, string>) => {
    const result = await api.get<ItemGetManyApiResponse>("/items", { params });

    return result.data;
  },

  getById: async (id: string, params?: ItemGetByIdSchema) => {
    const result = await api.get<ItemGetByIdApiResponse>(`/items/${id}`, {
      params,
    });

    return result.data;
  },

  update: async (itemId: string, data: ItemUpdateSchema) => {
    const result = await api.patch<ItemCUDApiResponse>(
      `/items/${itemId}`,
      data,
    );

    return result.data;
  },

  delete: async (id: string) => {
    const result = await api.delete<ItemCUDApiResponse>(`/items/${id}`);

    return result.data;
  },
};

export default itemApi;
