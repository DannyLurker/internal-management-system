import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  LocationGetByIdApiResponse,
  LocationGetManyApiResponse,
} from "./location.types";
import LOCATION_KEYS from "./location.keys";
import {
  LocationCreateSchema,
  LocationGetSchema,
  LocationGetSpecificSchema,
  LocationUpdateSchema,
} from "@/shared/lib/zods/location.zod";
import locationApi from "./location.api";
import { toast } from "sonner";

export const useLocation = (
  locationId: string,
  params: LocationGetSpecificSchema,
  options?: Partial<UseQueryOptions<LocationGetByIdApiResponse>>,
) => {
  return useQuery({
    queryKey: LOCATION_KEYS.detail(locationId, params),
    queryFn: () => locationApi.getById(locationId, params),
    enabled: Boolean(locationId),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

export const useLocations = (
  params: LocationGetSchema,
  options?: Partial<UseQueryOptions<LocationGetManyApiResponse>>,
) => {
  return useQuery({
    queryKey: LOCATION_KEYS.list(params),
    queryFn: () => locationApi.getMany(params),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

export const useCreateLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LocationCreateSchema) => locationApi.create(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: LOCATION_KEYS.all });
      toast.success(data.message);
    },
  });
};

export const useUpdateLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LocationUpdateSchema) => locationApi.update(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: LOCATION_KEYS.all });
      toast.success(data.message);
    },
  });
};

export const useDeleteLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => locationApi.delete(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: LOCATION_KEYS.all });
      toast.success(data.message);
    },
  });
};
