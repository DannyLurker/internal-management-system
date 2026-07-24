import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import STOCK_MOVEMENT_KEYS from "./stock-movements.keys";
import {
  StockMovementCreateSchema,
  StockMovementGetManySchema,
  StockMovementUpdateSchema,
} from "@/shared/lib/zods/stock-movements.zod";
import {
  StockMovementGetByIdApiResponse,
  StockMovementGetManyApiResponse,
} from "./stock-movements.types";
import stockMovementsApi from "./stock-movements.api";
import { toast } from "sonner";
import STOCK_KEYS from "../stocks/stock.keys";
import ITEM_KEYS from "../items/item.keys";
import { dashboardKeys } from "../dashboards/dashboard.keys";

export const useStockMovementsHooks = (
  params: StockMovementGetManySchema,
  options?: Partial<UseQueryOptions<StockMovementGetManyApiResponse>>,
) => {
  return useQuery({
    queryKey: STOCK_MOVEMENT_KEYS.list(params),
    queryFn: () => stockMovementsApi.getMany(params),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

export const useStockMovement = (
  stockMovementId: string,
  options?: Partial<UseQueryOptions<StockMovementGetByIdApiResponse>>,
) => {
  return useQuery({
    queryKey: STOCK_MOVEMENT_KEYS.detail(stockMovementId),
    queryFn: () => stockMovementsApi.getById(stockMovementId),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

export const useCreateStockMovement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: StockMovementCreateSchema) =>
      stockMovementsApi.create(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: STOCK_MOVEMENT_KEYS.lists() });

      queryClient.invalidateQueries({
        queryKey: STOCK_KEYS.lists(),
      });

      queryClient.invalidateQueries({
        queryKey: ITEM_KEYS.detail(data.data.itemId),
      });

      queryClient.invalidateQueries({
        queryKey: STOCK_KEYS.list({
          page: 1,
          dataPerPage: 100,
          sortBy: "createdAt",
          sortOrder: "asc",
          itemId: data.data.itemId || undefined,
        }),
      });

      queryClient.invalidateQueries({
        queryKey: dashboardKeys.manager(),
      });

      toast.success(data.message);
    },
  });
};

export const useUpdateStockMovement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: StockMovementUpdateSchema) =>
      stockMovementsApi.update(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: STOCK_MOVEMENT_KEYS.detail(data.data.stockMovementId),
      });
      toast.success(data.message);
    },
  });
};
