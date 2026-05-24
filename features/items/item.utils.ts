import { Prisma } from "@prisma/client";
import type { ItemStockStatus } from "./item.types";

export const EXPIRING_WINDOW_DAYS = 14;

export const itemStockStatusArray = [
  "ALL",
  "IN_STOCK",
  "LOW_STOCK",
  "OUT_OF_STOCK",
  "EXPIRING_SOON",
] as const;

// CURRENTLY DOESN'T HAVE ANY FUNCTIONALITY
export function formatItemSku(id: string) {
  const suffix = id.replace(/\W/g, "").slice(-4).toUpperCase().padStart(4, "0");
  return `HOS-${suffix}`;
}

export function formatItemPrice(
  value: number | string | null | undefined | { toString(): string },
) {
  const num = value == null ? 0 : Number(String(value));
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(num);
}

export function formatItemDate(value: Date | string) {
  return new Intl.DateTimeFormat("id-ID", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export const ITEM_STATUS_LABELS: Record<ItemStockStatus, string> = {
  ALL: "ALL",
  IN_STOCK: "IN STOCK",
  LOW_STOCK: "LOW STOCK",
  OUT_OF_STOCK: "OUT OF STOCK",
  EXPIRING_SOON: "EXPIRING SOON",
};

export const ITEM_STATUS_STYLES: Record<ItemStockStatus, string> = {
  ALL: "",
  IN_STOCK: "border-emerald-600/60 text-emerald-800",
  LOW_STOCK: "border-amber-500/70 text-amber-800",
  OUT_OF_STOCK: "border-red-500/70 text-red-800",
  EXPIRING_SOON: "border-[#857467]/50 text-[#524439]",
};

type ItemWithStocks = {
  minThreshold: number;
  stocks: { quantity: number; expiredAt?: Date | null }[];
  category?: { id: string; name: string } | null;
  stockMovements?: {
    totalCost: Prisma.Decimal | null;
    reason: string | null;
  }[];
};

export function mapItemListRow<T extends ItemWithStocks>(item: T) {
  const { stocks, stockMovements, ...rest } = item;
  const totalStock = stocks.reduce((sum, s) => sum + s.quantity, 0);

  const expiryDates = stocks
    .map((s) => s.expiredAt)
    .filter((d): d is Date => d != null)
    .sort((a, b) => a.getTime() - b.getTime());

  const expiringWindow = new Date();
  expiringWindow.setDate(expiringWindow.getDate() + EXPIRING_WINDOW_DAYS);

  const hasExpiringStock = stocks.some(
    (s) =>
      s.expiredAt &&
      new Date(s.expiredAt) <= expiringWindow &&
      new Date(s.expiredAt) >= new Date(),
  );

  let status: ItemStockStatus = "IN_STOCK";
  if (totalStock === 0) status = "OUT_OF_STOCK";
  else if (hasExpiringStock) status = "EXPIRING_SOON";
  else if (totalStock <= item.minThreshold) status = "LOW_STOCK";

  return {
    ...rest,
    stocks,
    totalStock,
    status,
    nearestExpiredAt: expiryDates[0] ?? null,
    totalCost: stockMovements?.[0]?.totalCost
      ? Number(stockMovements[0].totalCost)
      : null,
    reason: stockMovements?.[0]?.reason ?? null,
  };
}
