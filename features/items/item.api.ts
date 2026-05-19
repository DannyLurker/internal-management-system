import { api } from "@/shared/lib/api-client";
import { ItemCreateSchema, ItemUpdateSchema } from "@/shared/lib/zods/item.zod";
import {
  ItemCreateApiResponse,
  ItemDeleteApiResponse,
  ItemGetByIdApiResponse,
  ItemGetManyApiResponse,
  ItemUpdateApiResponse,
} from "./item.types";

const itemApi = {
  create: async (rawData: ItemCreateSchema) => {
    const result = await api.post<ItemCreateApiResponse>("/items", rawData);

    return result.data;
  },

  getMany: async (params: Record<string, string>) => {
    const result = await api.get<ItemGetManyApiResponse>("/items", { params });

    return result.data;
  },

  getById: async (id: string) => {
    const result = await api.get<ItemGetByIdApiResponse>(`/items/${id}`);

    return result.data;
  },

  update: async (data: ItemUpdateSchema) => {
    const result = await api.patch<ItemUpdateApiResponse>(`/items`, data);

    return result.data;
  },

  delete: async (id: string) => {
    const result = await api.delete<ItemDeleteApiResponse>(`/items/${id}`);

    return result.data;
  },
};

export default itemApi;
