import locationRules from "@/features/locations/location.rule";

describe("canDeleteLocation", () => {
  it("allows deletion when the location has no stocks", () => {
    const result = locationRules.canDeleteLocation({ stocks: [] });

    expect(result.allowed).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it("blocks deletion when the location has at least one stock", () => {
    const result = locationRules.canDeleteLocation({
      stocks: [{ id: "stock-1" }],
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe(
      "Item was found in this location. Migrate all the item before deleting.",
    );
  });

  it("blocks deletion regardless of how many stocks exist", () => {
    const result = locationRules.canDeleteLocation({
      stocks: [{ id: "stock-1" }, { id: "stock-2" }, { id: "stock-3" }],
    });

    expect(result.allowed).toBe(false);
  });
});
