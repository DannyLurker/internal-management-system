import type { AttributeRow, ItemStockStatus } from "./item.types";

export const EXPIRING_WINDOW_DAYS = 14;

export const itemStockStatusArray = [
  "ALL",
  "IN_STOCK",
  "LOW_STOCK",
  "OUT_OF_STOCK",
  "EXPIRING_SOON",
  "EXPIRED",
] as const;

export const ITEM_STATUS_LABELS: Record<ItemStockStatus, string> = {
  ALL: "ALL",
  IN_STOCK: "IN STOCK",
  LOW_STOCK: "LOW STOCK",
  OUT_OF_STOCK: "OUT OF STOCK",
  EXPIRING_SOON: "EXPIRING SOON",
  EXPIRED: "EXPIRED",
};

export const ITEM_STATUS_STYLES: Record<ItemStockStatus, string> = {
  ALL: "",
  IN_STOCK: "border-emerald-600/60 text-emerald-800",
  LOW_STOCK: "border-amber-500/70 text-amber-800",
  OUT_OF_STOCK: "border-red-500/70 text-red-800",
  EXPIRING_SOON: "border-[#857467]/50 text-[#524439]",
  EXPIRED: "border-black text-[#524439]",
};

export function parseAttributes(raw: unknown): AttributeRow[] {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return [{ key: "", value: "" }];
  }
  const entries = Object.entries(raw as Record<string, unknown>);
  if (entries.length === 0) return [{ key: "", value: "" }];
  return entries.map(([key, value]) => ({
    key,
    value: String(value ?? ""),
  }));
}

export function attributesToRecord(rows: AttributeRow[]) {
  return rows.reduce<Record<string, unknown>>((acc, row) => {
    const key = row.key.trim();
    if (key) acc[key] = row.value;
    return acc;
  }, {});
}
