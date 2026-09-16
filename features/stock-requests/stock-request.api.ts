import { api } from "@/shared/lib/api-client";
import {
  StockRequestCreateApiResponse,
  StockRequestGetByIdResponse,
  StockRequestGetManyApiResponse,
  StockRequestUDApiResponse,
} from "./stock-request.types";
import {
  StockRequestCreateSchema,
  StockRequestFilterSchema,
  StockRequestReviewSchema,
  StockRequestUpdateSchema,
} from "@/shared/lib/zods/stock-request.zod";

const stockRequestApi = {
  getMany: async (params: StockRequestFilterSchema) => {
    const result = await api.get<StockRequestGetManyApiResponse>(
      "/stock-requests",
      {
        params,
      },
    );
    return result.data;
  },

  getById: async (id: string) => {
    const result = await api.get<StockRequestGetByIdResponse>(
      `/stock-requests/${id}`,
    );
    return result.data;
  },

  create: async (data: StockRequestCreateSchema) => {
    const result = await api.post<StockRequestCreateApiResponse>(
      "/stock-requests",
      data,
    );
    return result.data;
  },

  update: async (id: string, data: StockRequestUpdateSchema) => {
    const result = await api.patch<StockRequestUDApiResponse>(
      `/stock-requests/${id}`,
      data,
    );
    return result.data;
  },

  review: async (id: string, data: StockRequestReviewSchema) => {
    const result = await api.patch<StockRequestUDApiResponse>(
      `/stock-requests/${id}`,
      data,
    );
    return result.data;
  },

  delete: async (id: string) => {
    const result = await api.delete<StockRequestUDApiResponse>(
      `/stock-requests/${id}`,
    );
    return result.data;
  },
};

export default stockRequestApi;
