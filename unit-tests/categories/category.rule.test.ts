import categoryRules from "@/features/categories/category.rule";

describe("canDeleteCategory", () => {
  it("allows deletion when the category has no items", () => {
    const result = categoryRules.canDeleteCategory({ items: [] });

    expect(result.allowed).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it("blocks deletion when the location has at least one stock", () => {
    const result = categoryRules.canDeleteCategory({
      items: [{ id: "item-1" }],
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe(
      "Item was found in this category. Migrate all the items before deleting.",
    );
  });

  it("blocks deletion regardless of how many stocks exist", () => {
    const result = categoryRules.canDeleteCategory({
      items: [{ id: "item-1" }, { id: "item-2" }, { id: "item-3" }],
    });

    expect(result.allowed).toBe(false);
  });
});
