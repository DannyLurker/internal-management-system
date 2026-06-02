import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import CATEGORY_KEYS from "./category.keys";
import {
  CategoryCreateSchema,
  CategoryGetSchema,
  CategoryUpdateSchema,
} from "@/shared/lib/zods/category.zod";
import categoryApi from "./category.api";
import { toast } from "sonner";
import {
  CategoryGetApiResponse,
  CategoryListApiResponse,
} from "./category.types";

export const useCategory = (
  categoryId: string,
  filters?: CategoryGetSchema,
  options?: Partial<UseQueryOptions<CategoryGetApiResponse>>,
) => {
  return useQuery({
    queryKey: CATEGORY_KEYS.detail(categoryId, filters),
    queryFn: () => categoryApi.get(categoryId, filters),
    enabled: Boolean(categoryId),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

export const useCategories = (
  filters: CategoryGetSchema,
  options?: Partial<UseQueryOptions<CategoryListApiResponse>>,
) => {
  return useQuery({
    queryKey: CATEGORY_KEYS.list(filters),
    queryFn: () => categoryApi.getMany(filters),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CategoryCreateSchema) => categoryApi.create(payload),
    onSuccess: (response) => {
      toast.success(response.data.message);
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CategoryUpdateSchema) => categoryApi.update(payload),
    onSuccess: (response) => {
      toast.success(response.data.message);
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categoryId: string) => categoryApi.delete(categoryId),
    onSuccess: (response) => {
      toast.success(response.data.message);
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
    },
  });
};
