import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { ItemGetByIdApiResponse, ItemGetManyApiResponse } from "./item.types";
import ITEM_KEYS from "./item.keys";
import itemApi from "./item.api";

import { toast } from "sonner";
import {
  ItemCreateSchema,
  ItemGetByIdSchema,
  ItemGetManySchema,
  ItemUpdateSchema,
} from "@/shared/lib/zods/item.zod";

export const useItem = (
  itemId: string,
  params: ItemGetByIdSchema,
  options?: Partial<UseQueryOptions<ItemGetByIdApiResponse>>,
) => {
  return useQuery({
    queryKey: ITEM_KEYS.detail(itemId, params),
    queryFn: () => itemApi.getById(itemId, params),
    enabled: Boolean(itemId),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

export const useItems = (
  params: ItemGetManySchema,
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
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ITEM_KEYS.lists() });
      toast.success(response.message);
    },
  });
};

export const useUpdateItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      payload,
    }: {
      itemId: string;
      payload: ItemUpdateSchema;
    }) => itemApi.update(itemId, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: ITEM_KEYS.detail(response.data.id),
      });

      queryClient.invalidateQueries({
        queryKey: ITEM_KEYS.lists(),
      });

      toast.success(response.message);
    },
  });
};

export const useDeleteItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => itemApi.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ITEM_KEYS.lists() });
      toast.success(response.message);
    },
  });
};
