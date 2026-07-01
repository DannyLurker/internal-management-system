import { StockMovementGetManySchema } from "@/shared/lib/zods/stock-movements.zod";

const STOCK_MOVEMENT_KEYS = {
  all: ["stock-movements"] as const,
  lists: () => [...STOCK_MOVEMENT_KEYS.all, "list"] as const,
  list: (filters: StockMovementGetManySchema) =>
    [...STOCK_MOVEMENT_KEYS.lists(), { filters }] as const,
  details: () => [...STOCK_MOVEMENT_KEYS.all, "detail"] as const,
  detail: (id: string) => [...STOCK_MOVEMENT_KEYS.details(), id] as const,
  listsAll: () => [...STOCK_MOVEMENT_KEYS.all, "list", "all"] as const,
};

export default STOCK_MOVEMENT_KEYS;
