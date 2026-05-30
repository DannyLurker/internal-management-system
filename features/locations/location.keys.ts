import {
  LocationGetSchema,
  LocationGetSpecificSchema,
} from "@/shared/lib/zods/location.zod";

const LOCATION_KEYS = {
  all: ["locations"] as const,
  lists: () => [...LOCATION_KEYS.all, "list"] as const,
  list: (filters: LocationGetSchema) =>
    [...LOCATION_KEYS.lists(), { filters }] as const,
  details: () => [...LOCATION_KEYS.all, "detail"] as const,
  detail: (id: string, params?: LocationGetSpecificSchema) =>
    [...LOCATION_KEYS.details(), id, { params }] as const,
  listsAll: () => [...LOCATION_KEYS.all, "list", "all"] as const,
};

export default LOCATION_KEYS;
