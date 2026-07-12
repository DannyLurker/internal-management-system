import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import stockApi from "./stock.api";
import {
  StockCreateSchema,
  StockGetManySchema,
  StockUpdateSchema,
} from "@/shared/lib/zods/stock.zod";
import {
  StockGetByIdApiResponse,
  StockGetManyApiResponse,
} from "./stock.types";
import STOCK_KEYS from "./stock.keys";
import { toast } from "sonner";
import ITEM_KEYS from "../items/item.keys";

export const useStocks = (
  params: StockGetManySchema,
  optional: Partial<UseQueryOptions<StockGetManyApiResponse>>,
) => {
  return useQuery({
    queryKey: STOCK_KEYS.list(params),
    queryFn: () => stockApi.getMany(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...optional,
  });
};

export const useStockById = (
  stockId: string,
  optional: Partial<UseQueryOptions<StockGetByIdApiResponse>>,
) => {
  return useQuery({
    queryKey: STOCK_KEYS.detail(stockId),
    queryFn: () => stockApi.getById(stockId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...optional,
  });
};

export const useCreateItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: StockCreateSchema) => stockApi.create(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: STOCK_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ITEM_KEYS.details() });
      toast.success(data.message);
    },
  });
};

export const useUpdateItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      stockId,
      payload,
    }: {
      stockId: string;
      payload: StockUpdateSchema;
    }) => stockApi.update(stockId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: STOCK_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ITEM_KEYS.details() });
      toast.success(data.message);
    },
  });
};

export const useDeleteItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => stockApi.delete(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: STOCK_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: ITEM_KEYS.details(),
      });
      toast.success(data.message);
    },
  });
};
