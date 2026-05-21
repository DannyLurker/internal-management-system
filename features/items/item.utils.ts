import type { Item } from "./item.types";

export type ItemStockStatus =
  | "IN_STOCK"
  | "LOW_STOCK"
  | "OUT_OF_STOCK"
  | "EXPIRING_SOON";

const EXPIRING_WINDOW_DAYS = 30;

export function formatItemSku(id: string) {
  const suffix = id.replace(/\W/g, "").slice(-4).toUpperCase().padStart(4, "0");
  return `HOS-${suffix}`;
}

export function formatItemPrice(
  value: number | string | null | undefined | { toString(): string },
) {
  const num = value == null ? 0 : Number(String(value));
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

export function formatItemDate(value: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function getItemStockStatus(
  item: Pick<Item, "totalStock" | "minThreshold" | "nearestExpiredAt">,
): ItemStockStatus {
  if (item.nearestExpiredAt) {
    const expiry = new Date(item.nearestExpiredAt);
    const days = (expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (days >= 0 && days <= EXPIRING_WINDOW_DAYS) {
      return "EXPIRING_SOON";
    }
  }
  if (item.totalStock === 0) return "OUT_OF_STOCK";
  if (item.totalStock <= item.minThreshold) return "LOW_STOCK";
  return "IN_STOCK";
}

export const ITEM_STATUS_LABELS: Record<ItemStockStatus, string> = {
  IN_STOCK: "IN STOCK",
  LOW_STOCK: "LOW STOCK",
  OUT_OF_STOCK: "OUT OF STOCK",
  EXPIRING_SOON: "EXPIRING SOON",
};

export const ITEM_STATUS_STYLES: Record<ItemStockStatus, string> = {
  IN_STOCK: "border-emerald-600/60 text-emerald-800",
  LOW_STOCK: "border-amber-500/70 text-amber-800",
  OUT_OF_STOCK: "border-red-500/70 text-red-800",
  EXPIRING_SOON: "border-[#857467]/50 text-[#524439]",
};
