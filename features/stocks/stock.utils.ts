export const DEFAULT_EXPIRING_WINDOW_DAYS = 14;

export function isStockExpired(
  expiredAt: Date | null,
  now: Date = new Date(),
): boolean {
  return expiredAt !== null && expiredAt < now;
}

export function isStockExpiringSoon(
  expiredAt: Date | null,
  now: Date = new Date(),
  windowDays: number = DEFAULT_EXPIRING_WINDOW_DAYS,
): boolean {
  if (!expiredAt) return false;

  const windowEnd = new Date(now);
  windowEnd.setDate(windowEnd.getDate() + windowDays);

  return expiredAt >= now && expiredAt <= windowEnd;
}
