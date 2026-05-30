import { api } from "@/shared/lib/api-client";
import {
  LocationCreateApiResponse,
  LocationDeleteApiResponse,
  LocationGetByIdApiResponse,
  LocationGetManyApiResponse,
  LocationUpdateApiResponse,
} from "./location.types";
import {
  LocationCreateSchema,
  LocationGetSchema,
  LocationGetSpecificSchema,
  LocationUpdateSchema,
} from "@/shared/lib/zods/location.zod";

const locationApi = {
  getMany: async (params: LocationGetSchema) => {
    const response = await api.get<LocationGetManyApiResponse>("/locations", {
      params,
    });
    return response.data;
  },

  getById: async (locationId: string, params: LocationGetSpecificSchema) => {
    const response = await api.get<LocationGetByIdApiResponse>(
      `/locations/${locationId}`,
      { params },
    );
    return response.data;
  },

  create: async (payload: LocationCreateSchema) => {
    const response = await api.post<LocationCreateApiResponse>(
      "/locations",
      payload,
    );
    return response.data;
  },

  update: async (payload: LocationUpdateSchema) => {
    const response = await api.patch<LocationUpdateApiResponse>(
      `/locations`,
      payload,
    );
    return response.data;
  },

  delete: async (locationId: string) => {
    const response = await api.delete<LocationDeleteApiResponse>(
      `/locations/${locationId}`,
    );
    return response.data;
  },
};

export default locationApi;
