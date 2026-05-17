import { ProductGetSchema } from "@/shared/lib/zods/product.zod";

const PRODUCT_KEYS = {
  all: ["products"] as const,
  lists: () => [...PRODUCT_KEYS.all, "list"] as const,
  list: (filters: ProductGetSchema) =>
    [...PRODUCT_KEYS.lists(), { filters }] as const,
  details: () => [...PRODUCT_KEYS.all, "detail"] as const,
  detail: (id: string) => [...PRODUCT_KEYS.details(), id] as const,
  listsAll: () => [...PRODUCT_KEYS.all, "list", "all"] as const,
};

export default PRODUCT_KEYS;
