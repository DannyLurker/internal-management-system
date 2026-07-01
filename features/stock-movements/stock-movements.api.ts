import { api } from "@/shared/lib/api-client";
import {
  StockMovementCUDApiResponse,
  StockMovementGetByIdApiResponse,
  StockMovementGetManyApiResponse,
} from "./stock-movements.types";
import {
  StockMovementCreateSchema,
  StockMovementGetManySchema,
  StockMovementUpdateSchema,
} from "@/shared/lib/zods/stock-movements.zod";

const stockMovementsApi = {
  getById: async (stockMovementId: string) => {
    const result = await api.get<StockMovementGetByIdApiResponse>(
      "/stock-movements/" + stockMovementId,
    );
    return result.data;
  },

  getMany: async (params: StockMovementGetManySchema) => {
    const result = await api.get<StockMovementGetManyApiResponse>(
      "/stock-movements",
      {
        params,
      },
    );
    return result.data;
  },

  create: async (data: StockMovementCreateSchema) => {
    const result = await api.post<StockMovementCUDApiResponse>(
      "/stock-movements",
      data,
    );
    return result.data;
  },

  update: async (data: StockMovementUpdateSchema) => {
    const result = await api.patch<StockMovementCUDApiResponse>(
      "/stock-movements",
      data,
    );
    return result.data;
  },
};

export default stockMovementsApi;
