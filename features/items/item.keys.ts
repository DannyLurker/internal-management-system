import {
  ItemGetByIdSchema,
  ItemGetManySchema,
} from "@/shared/lib/zods/item.zod";

const ITEM_KEYS = {
  all: ["items"] as const,
  lists: () => [...ITEM_KEYS.all, "list"] as const,
  list: (filters: ItemGetManySchema) =>
    [...ITEM_KEYS.lists(), { filters }] as const,
  details: () => [...ITEM_KEYS.all, "detail"] as const,
  detail: (id: string, params?: ItemGetByIdSchema) => {
    const base = [...ITEM_KEYS.details(), id] as const;
    return params ? ([...base, params] as const) : base;
  },
  listsAll: () => [...ITEM_KEYS.all, "list", "all"] as const,
};

export default ITEM_KEYS;
