import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { laundryKeys } from "./laundry.keys";
import {
  LaundryCreateSchema,
  LaundryGetManySchema,
} from "@/shared/lib/zods/laundry.zod";
import {
  LaundryGetByIdApiResponse,
  LaundryGetManyApiResponse,
} from "./laundry.types";
import laundryApi from "./laundry.api";
import { toast } from "sonner";
import STOCK_KEYS from "../stocks/stock.keys";
import STOCK_MOVEMENT_KEYS from "../stock-movements/stock-movements.keys";
import { dashboardKeys } from "../dashboards/dashboard.keys";

export const useLaundries = (
  params: LaundryGetManySchema,
  options?: Partial<UseQueryOptions<LaundryGetManyApiResponse>>,
) => {
  return useQuery({
    queryKey: laundryKeys.list(params),
    queryFn: () => laundryApi.getMany(params),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

export const useLaundryById = (
  laundryId: string | null,
  options?: Partial<UseQueryOptions<LaundryGetByIdApiResponse>>,
) => {
  return useQuery({
    queryKey: laundryKeys.detail(laundryId ?? ""),
    queryFn: () => laundryApi.getById(laundryId!),
    enabled: Boolean(laundryId),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

export const useLaundryAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LaundryCreateSchema) =>
      laundryApi.executeAction(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: laundryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: STOCK_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: STOCK_MOVEMENT_KEYS.lists(),
      });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.manager() });
      toast.success(data.message || "Action processed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to process laundry action");
    },
  });
};
