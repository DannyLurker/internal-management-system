import { api } from "@/shared/lib/api-client";
import {
  StockCUDApiResponse,
  StockGetByIdApiResponse,
  StockGetManyApiResponse,
} from "./stock.types";
import {
  StockCreateSchema,
  StockGetManySchema,
  StockUpdateSchema,
} from "@/shared/lib/zods/stock.zod";

const stockApi = {
  getById: async (stockId: string) => {
    const result = await api.get<StockGetByIdApiResponse>("/stocks/" + stockId);
    return result.data;
  },

  getMany: async (params: StockGetManySchema) => {
    const result = await api.get<StockGetManyApiResponse>("/stocks", {
      params,
    });
    return result.data;
  },

  create: async (data: StockCreateSchema) => {
    const result = await api.post<StockCUDApiResponse>("/stocks", data);
    return result.data;
  },

  delete: async (stockId: string) => {
    const result = await api.delete<StockCUDApiResponse>(`/stocks/${stockId}`);
    return result.data;
  },

  update: async (stockId: string, data: StockUpdateSchema) => {
    const result = await api.patch<StockCUDApiResponse>(
      `/stocks/${stockId}`,
      data,
    );
    return result.data;
  },
};

export default stockApi;
