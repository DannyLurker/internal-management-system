import { LocationType } from "@prisma/client";

export const LOCATION_TYPE_OPTIONS: {
  value: LocationType;
  label: string;
}[] = [
  { value: LocationType.MAIN_WAREHOUSE, label: "Warehouse" },
  { value: LocationType.FRONT_OFFICE, label: "Front Office" },
  { value: LocationType.OPERATIONAL, label: "Operational" },
  { value: LocationType.FLOOR_LOCKER, label: "Floor Locker" },
  { value: LocationType.VENDOR_LAUNDRY, label: "Vendor Laundry" },
];

const LOCATION_TYPE_BADGE_LABELS: Record<LocationType, string> = {
  [LocationType.MAIN_WAREHOUSE]: "WAREHOUSE",
  [LocationType.FLOOR_LOCKER]: "FLOOR",
  [LocationType.FRONT_OFFICE]: "ROOM",
  [LocationType.OPERATIONAL]: "STORAGE",
  [LocationType.VENDOR_LAUNDRY]: "VENDOR LAUNDRY",
  [LocationType.GUEST_ROOM]: "GUEST ROOM",
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
