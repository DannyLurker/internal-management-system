import { test, expect } from "@playwright/test";

test.describe.configure({ mode: "serial" });

test.describe("CRUD operations for Item", () => {
  const TEST_PREFIX = `TEST_${Date.now()}+${Math.floor(Math.random() * 1000)}`;
  let createdItemId: string;
  let testCategoryId: string;
  let testLocationId: string;

  test.describe.configure({ mode: "serial" });

  test.beforeAll(
    "Setup: Create test category and resolve location",
    async ({ request }) => {
      // 1. Create category
      const categoryResponse = await request.post("/api/categories", {
        data: { name: `${TEST_PREFIX}Hotel Linen` },
      });
      expect(categoryResponse.status()).toBe(201);

      const listResponse = await request.get(
        "/api/categories?sortOrder=asc&sortBy=name&page=1&dataPerPage=100",
      );
      const listBody = await listResponse.json();
      const categories = listBody.data.categories;

      const category = categories.find(
        (c: any) => c.name === `${TEST_PREFIX}Hotel Linen`,
      );

      expect(category).toBeDefined();
      testCategoryId = category.id;

      const locationResponse = await request.get(
        "/api/locations?page=1&dataPerPage=10",
      );
      const locationBody = await locationResponse.json();

      expect(locationResponse.status()).toBe(200);
      console.log(locationBody);
      testLocationId = locationBody.data.locations[0].id;
    },
  );

  test("Create a new item", async ({ request }) => {
    const sellingPrice = 450000;
    const totalCost = 1500000;

    const response = await request.post("/api/items", {
      data: {
        name: `${TEST_PREFIX}Luxury King Pillow`,
        description: "Premium goose down pillow for guest rooms",
        categoryId: testCategoryId,
        locationId: testLocationId,
        sellingPrice,
        image: "https://example.com/luxury-king-pillow.jpg",
        stock: {
          quantity: 50,
          totalCost,
          reason: "Bulk purchase for room setup",
        },
        attributes: {
          size: "King",
          fill: "Goose Down",
          color: "White",
        },
      },
    });

    const body = await response.json();
    expect(response.status()).toBe(201);
    expect(body.message).toContain(`${TEST_PREFIX}Luxury King Pillow`);
  });

  test("Get list of items", async ({ request }) => {
    const response = await request.get(
      "/api/items?page=1&dataPerPage=10&sortBy=name&orderBy=asc",
    );

    const body = await response.json();

    console.log("Get List Response:", body);

    expect(response.status()).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.data.items).toBeDefined();
    expect(Array.isArray(body.data.items)).toBe(true);
  });

  test("Get single item by ID", async ({ request }) => {
    const listResponse = await request.get(
      "/api/items?page=1&dataPerPage=100&sortBy=name&orderBy=asc",
    );

    const listBody = await listResponse.json();

    type ItemDto = {
      id: string;
      name: string;
    };

    const items: ItemDto[] = listBody.data?.items ?? [];

    const item = items.find(
      (p) => p.name === `${TEST_PREFIX}Luxury King Pillow`,
    );

    expect(item).toBeDefined();

    createdItemId = item!.id;

    const response = await request.get(`/api/items/${createdItemId}`);

    const body = await response.json();

    console.log("Get Single Response:", body);

    expect(response.status()).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.data.item.id).toBe(createdItemId);
  });

  test("Get items by category", async ({ request }) => {
    const response = await request.get(
      `/api/items?isByCategory=true&categoryId=${testCategoryId}&page=1&dataPerPage=10&sortBy=name&orderBy=asc`,
    );

    const body = await response.json();

    console.log("Get By Category Response:", body);

    expect(response.status()).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.data.items).toBeDefined();
    expect(Array.isArray(body.data.items)).toBe(true);
  });

  test("Update an item", async ({ request }) => {
    const updatedSellingPrice = 499000;

    const response = await request.patch("/api/items", {
      data: {
        itemId: createdItemId,
        name: `${TEST_PREFIX}Luxury King Pillow - Firm`,
        description: "Updated firm edition of premium goose down pillow",
        categoryId: testCategoryId,
        sellingPrice: updatedSellingPrice,
        image: "https://example.com/luxury-king-pillow-firm.jpg",
      },
    });

    const body = await response.json();

    console.log("Update Response:", {
      ...body,
      formattedSellingPrice: updatedSellingPrice,
    });

    expect(response.status()).toBe(200);

    expect(body.message).toContain(`${TEST_PREFIX}Luxury King Pillow - Firm`);
  });

  test("Error: Delete an active item", async ({ request }) => {
    const response = await request.delete(`/api/items/${createdItemId}`);

    const body = await response.json();

    console.log("Delete Response:", body);

    expect(response.status()).toBe(400);

    expect(body.message).toContain(
      `You cannot delete an active item. Please deactivate it first.`,
    );
  });

  test("Delete an item", async ({ request }) => {
    await request.patch(`/api/items`, {
      data: {
        name: `${TEST_PREFIX}Luxury King Pillow - Firm`,
        itemId: createdItemId,
        isActive: false,
        description: "TEST_PREFIX",
      },
    });

    const response = await request.delete(`/api/items/${createdItemId}`);

    const body = await response.json();

    console.log("Delete Response:", body);

    expect(response.status()).toBe(200);

    expect(body.message).toContain(`${TEST_PREFIX}Luxury King Pillow - Firm`);
  });

  test("Error: Create item with short name", async ({ request }) => {
    const response = await request.post("/api/items", {
      data: {
        name: "",
        description: "Test description",
        categoryId: testCategoryId,
        locationId: testLocationId,
        sellingPrice: 100000,
      },
    });

    const body = await response.json();

    console.log("Short Name Error Response:", body);

    expect(response.status()).toBe(400);
  });

  test("Error: Create item with invalid category", async ({ request }) => {
    const response = await request.post("/api/items", {
      data: {
        name: `${TEST_PREFIX}InvalidHotelItem`,
        description: "Test description",
        categoryId: "XX",
        locationId: testLocationId,
        sellingPrice: 100000,
      },
    });

    const body = await response.json();

    console.log("Invalid Category Error Response:", body);

    expect(response.status()).toBe(400);
  });

  test("Error: Update non-existent item", async ({ request }) => {
    const response = await request.patch("/api/items", {
      data: {
        itemId: "non-existent-id-12345",
        name: `${TEST_PREFIX}UpdatedHotelItem`,
        description: "Updated description",
        categoryId: testCategoryId,
        sellingPrice: 200000,
      },
    });

    const body = await response.json();

    console.log("Non-existent Update Error Response:", body);

    expect(response.status()).toBe(404);
  });

  test("Error: Delete non-existent item", async ({ request }) => {
    const response = await request.delete("/api/items/non-existent-id-12345");

    const body = await response.json();

    console.log("Non-existent Delete Error Response:", body);

    expect(response.status()).toBe(404);
  });

  test("Cleanup: Delete leftover test data", async ({ browser }) => {
    // Keep your cleanup script exactly the same at the bottom of the stack
    const context = await browser.newContext({
      storageState: "playwright/.auth/manager.json",
    });
    const request = context.request;

    const itemList = await request.get(
      "http://localhost:3000/api/items?page=1&dataPerPage=100&sortBy=name&orderBy=asc",
    );
    const itemBody = await itemList.json();
    const items: { id: string; name: string }[] = itemBody.data?.items ?? [];

    for (const item of items) {
      if (item.name.startsWith(TEST_PREFIX)) {
        await request.delete(`http://localhost:3000/api/items/${item.id}`);
      }
    }

    await context.close();
  });
});
