import { api } from "@/shared/lib/api-client";
import {
  LocationCUDApiResponse,
  LocationGetByIdApiResponse,
  LocationGetManyApiResponse,
} from "./location.types";
import {
  LocationCreateSchema,
  LocationGetByIdSchema,
  LocationGetManySchema,
  LocationUpdateSchema,
} from "@/shared/lib/zods/location.zod";

const locationApi = {
  getMany: async (params: LocationGetManySchema) => {
    const response = await api.get<LocationGetManyApiResponse>("/locations", {
      params,
    });
    return response.data;
  },

  getById: async (locationId: string, params: LocationGetByIdSchema) => {
    const response = await api.get<LocationGetByIdApiResponse>(
      `/locations/${locationId}`,
      { params },
    );
    return response.data;
  },

  create: async (payload: LocationCreateSchema) => {
    const response = await api.post<LocationCUDApiResponse>(
      "/locations",
      payload,
    );
    return response.data;
  },

  update: async ({
    locationId,
    payload,
  }: {
    locationId: string;
    payload: LocationUpdateSchema;
  }) => {
    const response = await api.patch<LocationCUDApiResponse>(
      `/locations/${locationId}`,
      payload,
    );
    return response.data;
  },

  delete: async (locationId: string) => {
    const response = await api.delete<LocationCUDApiResponse>(
      `/locations/${locationId}`,
    );
    return response.data;
  },
};

export default locationApi;
