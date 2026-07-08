import {
  DEFAULT_EXPIRING_WINDOW_DAYS,
  describeStockStatusFilter,
  isStockExpired,
  isStockExpiringSoon,
} from "@/features/stocks/stock.rule";

describe("describeStockStatusFilter", () => {
  const now = new Date("2026-07-08T00:00:00.000Z");

  it("returns null when stockStatusType is undefined", () => {
    expect(describeStockStatusFilter(undefined, now)).toBeNull();
  });

  it("returns null for an unrecognized status", () => {
    expect(describeStockStatusFilter("UNKNOWN_STATUS", now)).toBeNull();
  });

  it.each(["READY", "DAMAGED", "DIRTY"])(
    "returns an exactType descriptor for %s",
    (status) => {
      expect(describeStockStatusFilter(status, now)).toEqual({
        kind: "exactType",
        type: status,
      });
    },
  );

  it("returns an expiredBefore descriptor for EXPIRED", () => {
    expect(describeStockStatusFilter("EXPIRED", now)).toEqual({
      kind: "expiredBefore",
      today: now,
    });
  });

  it("returns an expiringWithinWindow descriptor for EXPIRING_SOON using the default window", () => {
    const result = describeStockStatusFilter("EXPIRING_SOON", now);

    const expectedWindowEnd = new Date(now);
    expectedWindowEnd.setDate(
      expectedWindowEnd.getDate() + DEFAULT_EXPIRING_WINDOW_DAYS,
    );

    expect(result).toEqual({
      kind: "expiringWithinWindow",
      today: now,
      windowEnd: expectedWindowEnd,
    });
  });

  it("respects a custom windowDays override", () => {
    const result = describeStockStatusFilter("EXPIRING_SOON", now, 3);

    const expectedWindowEnd = new Date(now);
    expectedWindowEnd.setDate(expectedWindowEnd.getDate() + 3);

    expect(result).toEqual({
      kind: "expiringWithinWindow",
      today: now,
      windowEnd: expectedWindowEnd,
    });
  });
});

describe("isStockExpired", () => {
  const now = new Date("2026-07-08T00:00:00.000Z");

  it("returns false when expiredAt is null", () => {
    expect(isStockExpired(null, now)).toBe(false);
  });

  it("returns true when expiredAt is in the past", () => {
    const past = new Date("2026-07-01T00:00:00.000Z");
    expect(isStockExpired(past, now)).toBe(true);
  });

  it("returns false when expiredAt is in the future", () => {
    const future = new Date("2026-07-15T00:00:00.000Z");
    expect(isStockExpired(future, now)).toBe(false);
  });

  it("returns false when expiredAt equals now (boundary)", () => {
    expect(isStockExpired(new Date(now), now)).toBe(false);
  });
});

describe("isStockExpiringSoon", () => {
  const now = new Date("2026-07-08T00:00:00.000Z");

  it("returns false when expiredAt is null", () => {
    expect(isStockExpiringSoon(null, now)).toBe(false);
  });

  it("returns false when expiredAt already passed", () => {
    const past = new Date("2026-07-01T00:00:00.000Z");
    expect(isStockExpiringSoon(past, now)).toBe(false);
  });

  it("returns true when expiredAt equals now (lower boundary)", () => {
    expect(isStockExpiringSoon(new Date(now), now)).toBe(true);
  });

  it("returns true when expiredAt equals the exact window edge (upper boundary)", () => {
    const windowEdge = new Date(now);
    windowEdge.setDate(windowEdge.getDate() + DEFAULT_EXPIRING_WINDOW_DAYS);
    expect(isStockExpiringSoon(windowEdge, now)).toBe(true);
  });

  it("returns false when expiredAt is beyond the window", () => {
    const beyond = new Date(now);
    beyond.setDate(beyond.getDate() + DEFAULT_EXPIRING_WINDOW_DAYS + 1);
    expect(isStockExpiringSoon(beyond, now)).toBe(false);
  });

  it("respects a custom windowDays override", () => {
    const threeDaysOut = new Date(now);
    threeDaysOut.setDate(threeDaysOut.getDate() + 3);

    expect(isStockExpiringSoon(threeDaysOut, now, 3)).toBe(true);
    expect(isStockExpiringSoon(threeDaysOut, now, 2)).toBe(false);
  });
});
