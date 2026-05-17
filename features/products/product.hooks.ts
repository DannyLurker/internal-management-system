import {
  ProductCreateSchema,
  ProductGetSchema,
} from "@/shared/lib/zods/product.zod";
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { ProductGetManyResponse, ProductGetResponse } from "./product.types";
import { productApi } from "./product.api";
import PRODUCT_KEYS from "./product.keys";
import { toast } from "sonner";

export const useProducts = (
  filters: ProductGetSchema,
  options?: Partial<UseQueryOptions<ProductGetManyResponse>>,
) => {
  return useQuery({
    queryKey: PRODUCT_KEYS.list(filters),
    queryFn: () => productApi.getMany(filters),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

export const useProduct = (
  productId: string,
  options?: Partial<UseQueryOptions<ProductGetResponse>>,
) => {
  return useQuery({
    queryKey: PRODUCT_KEYS.detail(productId),
    queryFn: () => productApi.get(productId),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProductCreateSchema) => productApi.create(payload),
    onSuccess: (data) => {
      toast.success(data.message);

      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.lists() });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProductCreateSchema) => productApi.update(payload),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.lists() });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => productApi.delete(productId),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.lists() });
    },
  });
};
