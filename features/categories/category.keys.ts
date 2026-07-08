import {
  CategoryGetByIdSchema,
  CategoryGetManySchema,
} from "@/shared/lib/zods/category.zod";
import ITEM_KEYS from "../items/item.keys";

const CATEGORY_KEYS = {
  all: ["categories"] as const,
  lists: () => [...CATEGORY_KEYS.all, "list"] as const,
  list: (params: CategoryGetManySchema) =>
    [...CATEGORY_KEYS.lists(), { params }] as const,
  details: () => [...CATEGORY_KEYS.all, "detail"] as const,
  detail: (id: string, params?: CategoryGetByIdSchema) => {
    const base = [...ITEM_KEYS.details(), id] as const;
    return params ? ([...base, params] as const) : base;
  },
  listsAll: () => [...CATEGORY_KEYS.all, "list", "all"] as const,
};

export default CATEGORY_KEYS;
