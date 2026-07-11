import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import CATEGORY_KEYS from "./category.keys";
import {
  CategoryCreateSchema,
  CategoryGetByIdSchema,
  CategoryGetManySchema,
  CategoryUpdateSchema,
} from "@/shared/lib/zods/category.zod";
import categoryApi from "./category.api";
import { toast } from "sonner";
import {
  CategoryGetByIdApiResponse,
  CategoryGetManyApiResponse,
} from "./category.types";

export const useCategory = (
  categoryId: string,
  filters: CategoryGetByIdSchema,
  options?: Partial<UseQueryOptions<CategoryGetByIdApiResponse>>,
) => {
  return useQuery({
    queryKey: CATEGORY_KEYS.detail(categoryId, filters),
    queryFn: () => categoryApi.getById(categoryId, filters),
    enabled: Boolean(categoryId),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

export const useCategories = (
  filters: CategoryGetManySchema,
  options?: Partial<UseQueryOptions<CategoryGetManyApiResponse>>,
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
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.lists() });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      categoryId,
      payload,
    }: {
      categoryId: string;
      payload: CategoryUpdateSchema;
    }) => categoryApi.update(categoryId, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: CATEGORY_KEYS.detail(response.data.id),
      });

      queryClient.invalidateQueries({
        queryKey: CATEGORY_KEYS.lists(),
      });
      toast.success(response.message);
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categoryId: string) => categoryApi.delete(categoryId),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.lists() });
    },
  });
};
