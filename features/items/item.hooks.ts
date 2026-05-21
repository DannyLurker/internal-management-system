import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { ItemGetByIdApiResponse, ItemGetManyApiResponse } from "./item.types";
import ITEM_KEYS from "./item.keys";
import itemApi from "./item.api";
import {
  ItemCreateSchema,
  ItemGetSchema,
  ItemUpdateSchema,
} from "@/features/items/item.zod";
import { toast } from "sonner";

export const useItem = (
  itemId: string,
  options?: Partial<UseQueryOptions<ItemGetByIdApiResponse>>,
) => {
  return useQuery({
    queryKey: ITEM_KEYS.detail(itemId),
    queryFn: () => itemApi.getById(itemId),
    enabled: Boolean(itemId),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

export const useItems = (
  params: ItemGetSchema,
  options?: Partial<UseQueryOptions<ItemGetManyApiResponse>>,
) => {
  return useQuery({
    queryKey: ITEM_KEYS.list(params),
    queryFn: () => itemApi.getMany(params as Record<string, any>),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

export const useCreateItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ItemCreateSchema) => itemApi.create(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ITEM_KEYS.lists() });
      toast.success(data.message);
    },
  });
};

export const useUpdateItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ItemUpdateSchema) => itemApi.update(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ITEM_KEYS.lists() });
      toast.success(data.message);
    },
  });
};
export const useDeleteItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => itemApi.delete(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ITEM_KEYS.lists() });
      toast.success(data.message);
    },
  });
};
