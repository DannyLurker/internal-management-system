import { CategoryGetSchema } from "@/shared/lib/zods/category.zod";

const CATEGORY_KEYS = {
  all: ["categories"] as const,
  lists: () => [...CATEGORY_KEYS.all, "list"] as const,
  list: (filters: CategoryGetSchema) =>
    [...CATEGORY_KEYS.lists(), { filters }] as const,
  details: () => [...CATEGORY_KEYS.all, "detail"] as const,
  detail: (id: string, filters?: CategoryGetSchema) =>
    [...CATEGORY_KEYS.details(), id, ...(filters ? [{ filters }] : [])] as const,
  listsAll: () => [...CATEGORY_KEYS.all, "list", "all"] as const,
};

export default CATEGORY_KEYS;
