import { ItemGetDetailSchema, ItemGetSchema } from "@/shared/lib/zods/item.zod";

const ITEM_KEYS = {
  all: ["items"] as const,
  lists: () => [...ITEM_KEYS.all, "list"] as const,
  list: (filters: ItemGetSchema) =>
    [...ITEM_KEYS.lists(), { filters }] as const,
  details: () => [...ITEM_KEYS.all, "detail"] as const,
  detail: (id: string, params?: ItemGetDetailSchema) =>
    [...ITEM_KEYS.details(), id, { params }] as const,
  listsAll: () => [...ITEM_KEYS.all, "list", "all"] as const,
};

export default ITEM_KEYS;
