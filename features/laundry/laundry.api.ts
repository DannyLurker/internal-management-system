import { api } from "@/shared/lib/api-client";
import {
  LaundryCUDApiResponse,
  LaundryGetByIdApiResponse,
  LaundryGetManyApiResponse,
} from "./laundry.types";
import {
  LaundryCreateSchema,
  LaundryGetManySchema,
} from "@/shared/lib/zods/laundry.zod";

const laundryApi = {
  getById: async (laundryId: string) => {
    const result = await api.get<LaundryGetByIdApiResponse>(
      `/laundry/${laundryId}`,
    );
    return result.data;
  },

  getMany: async (params: LaundryGetManySchema) => {
    const result = await api.get<LaundryGetManyApiResponse>("/laundry", {
      params,
    });
    return result.data;
  },

  executeAction: async (data: LaundryCreateSchema) => {
    const result = await api.post<LaundryCUDApiResponse>("/laundry", data);
    return result.data;
  },
};

export default laundryApi;
