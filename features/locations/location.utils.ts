import { LocationType } from "@prisma/client";

export const LOCATION_TYPE_OPTIONS: {
  value: LocationType;
  label: string;
}[] = [
  { value: LocationType.MAIN_WAREHOUSE, label: "Warehouse" },
  { value: LocationType.FRONT_OFFICE, label: "Room" },
  { value: LocationType.OPERATIONAL, label: "Storage" },
  { value: LocationType.FLOOR_LOCKER, label: "Floor" },
];

const LOCATION_TYPE_BADGE_LABELS: Record<LocationType, string> = {
  [LocationType.MAIN_WAREHOUSE]: "WAREHOUSE",
  [LocationType.FLOOR_LOCKER]: "FLOOR",
  [LocationType.FRONT_OFFICE]: "ROOM",
  [LocationType.OPERATIONAL]: "STORAGE",
};

export function formatLocationTypeBadge(type: LocationType): string {
  return LOCATION_TYPE_BADGE_LABELS[type] ?? type.replace(/_/g, " ");
}

export function formatLocationTypeSelectLabel(type: LocationType): string {
  return (
    LOCATION_TYPE_OPTIONS.find((option) => option.value === type)?.label ??
    type.replace(/_/g, " ")
  );
}

export function formatLocationDisplayId(id: string): string {
  return id.slice(-8).toUpperCase();
}

export function formatTimestamp(value: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
