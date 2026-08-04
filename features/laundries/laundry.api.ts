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
      `/laundries/${laundryId}`,
    );
    return result.data;
  },

  getMany: async (params: LaundryGetManySchema) => {
    const result = await api.get<LaundryGetManyApiResponse>("/laundries", {
      params,
    });
    return result.data;
  },

  executeAction: async (data: LaundryCreateSchema) => {
    const result = await api.post<LaundryCUDApiResponse>("/laundries", data);
    return result.data;
  },
};

export default laundryApi;
