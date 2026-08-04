import { LaundryGetManySchema } from "@/shared/lib/zods/laundry.zod";

export const laundryKeys = {
  all: ["laundries"] as const,
  lists: () => [...laundryKeys.all, "list"] as const,
  list: (filters: LaundryGetManySchema) => {
    const base = [...laundryKeys.lists()] as const;
    return filters ? ([...base, filters] as const) : base;
  },
  details: () => [...laundryKeys.all, "detail"] as const,
  detail: (id: string) => [...laundryKeys.details(), id] as const,
};
