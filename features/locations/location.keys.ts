import {
  LocationGetByIdSchema,
  LocationGetManySchema,
} from "@/shared/lib/zods/location.zod";

const LOCATION_KEYS = {
  all: ["locations"] as const,
  lists: () => [...LOCATION_KEYS.all, "list"] as const,
  list: (filters: LocationGetManySchema) =>
    [...LOCATION_KEYS.lists(), { filters }] as const,
  details: () => [...LOCATION_KEYS.all, "detail"] as const,
  detail: (id: string, params?: LocationGetByIdSchema) => {
    const base = [...LOCATION_KEYS.details(), id] as const;
    return params ? ([...base, params] as const) : base;
  },
  listsAll: () => [...LOCATION_KEYS.all, "list", "all"] as const,
};

export default LOCATION_KEYS;
