import { RuleResult } from "@/shared/lib/types/rule.type";
import { StockType } from "@prisma/client";

/**
 * Pure business rules about what "expired" / "expiring soon" mean for a stock item.
 * No Prisma, no DB, no I/O — testable with plain objects and dates.
 */

export const STOCK_QUERYABLE_STATUSES: StockType[] = [
  "READY",
  "DAMAGED",
  "DIRTY",
] as const;
export type StockQueryableStatus = (typeof STOCK_QUERYABLE_STATUSES)[number];

export const DEFAULT_EXPIRING_WINDOW_DAYS = 14;

export function getExpiringWindowDays(): number {
  return (
    Number(process.env.EXPIRING_WINDOW_DAYS) || DEFAULT_EXPIRING_WINDOW_DAYS
  );
}

function isQueryableStatus(status: string): status is StockQueryableStatus {
  return (STOCK_QUERYABLE_STATUSES as readonly string[]).includes(status);
}

/**
 * Describes, in plain terms, what a given stockStatusType filter means —
 * without knowing anything about Prisma's WhereInput shape.
 */
export type StockStatusFilterDescriptor =
  | { kind: "exactType"; type: StockType }
  | { kind: "expiredBefore"; today: Date }
  | { kind: "expiringWithinWindow"; today: Date; windowEnd: Date }
  | null;

export function describeStockStatusFilter(
  stockStatusType: string | undefined,
  now: Date = new Date(),
  windowDays: number = getExpiringWindowDays(),
): StockStatusFilterDescriptor {
  if (!stockStatusType) return null;

  if (isQueryableStatus(stockStatusType)) {
    return { kind: "exactType", type: stockStatusType as StockType };
  }

  if (stockStatusType === "EXPIRED") {
    return { kind: "expiredBefore", today: now };
  }

  if (stockStatusType === "EXPIRING_SOON") {
    const windowEnd = new Date(now);
    windowEnd.setDate(windowEnd.getDate() + windowDays);
    return { kind: "expiringWithinWindow", today: now, windowEnd };
  }

  return null;
}

/**
 * Direct rule check on a single stock item — reusable outside of query-building,
 * e.g. for a dashboard badge or a notification job.
 */
export function isStockExpired(
  expiredAt: Date | null,
  now: Date = new Date(),
): boolean {
  if (!expiredAt) return false;
  return expiredAt < now;
}

export function isStockExpiringSoon(
  expiredAt: Date | null,
  now: Date = new Date(),
  windowDays: number = getExpiringWindowDays(),
): boolean {
  if (!expiredAt) return false;
  const windowEnd = new Date(now);
  windowEnd.setDate(windowEnd.getDate() + windowDays);
  return expiredAt >= now && expiredAt <= windowEnd;
}

export const stockRules = {
  canUpdateStock: (
    stockTargetId: string | undefined,
    currentStockId: string,
  ): RuleResult => {
    if (stockTargetId === currentStockId) {
      return {
        allowed: false,
        reason:
          "Another stock with this item, location, and type already exists",
      };
    }

    return {
      allowed: true,
    };
  },

  canDeleteStock: (stockMovements: { id: string }[]): RuleResult => {
    if (stockMovements.length < 0) {
      return {
        allowed: false,
        reason:
          "Stock cannot be deleted because it has history of stock movements.",
      };
    }

    return {
      allowed: true,
    };
  },
};
