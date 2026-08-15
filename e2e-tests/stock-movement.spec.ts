import { test, expect } from "@playwright/test";

test.describe.configure({ mode: "serial" });

test.describe("CRUD operations for Stock Movements", () => {
  const TEST_PREFIX = `TEST_${Date.now()}+${Math.floor(Math.random() * 1000)}`;
  let createdStockMovementId: string;
  let testItemId: string;
  let testStockId: string;
  let testLocationId: string;
  let testCategoryId: string;

  test.describe.configure({ mode: "serial" });

  test.beforeAll(
    "Setup: Create test item, stock, and resolve location",
    async ({ request }) => {
      // 1. Create category
      const categoryResponse = await request.post("/api/categories", {
        data: { name: `${TEST_PREFIX}Stock Movement Test Category` },
      });
      expect(categoryResponse.status()).toBe(201);

      const categoryListResponse = await request.get(
        "/api/categories?sortOrder=asc&sortBy=name&page=1&dataPerPage=100",
      );
      const categoryListBody = await categoryListResponse.json();
      const categories = categoryListBody.data.categories;

      const category = categories.find(
        (c: any) => c.name === `${TEST_PREFIX}Stock Movement Test Category`,
      );
      expect(category).toBeDefined();
      testCategoryId = category!.id;

      // 2. Get location
      const locationResponse = await request.get(
        "/api/locations?page=1&dataPerPage=10",
      );
      const locationBody = await locationResponse.json();
      expect(locationResponse.status()).toBe(200);
      testLocationId = locationBody.data.locations[0].id;

      // 3. Create item
      const itemResponse = await request.post("/api/items", {
        data: {
          name: `${TEST_PREFIX}Test Stock Movement Item`,
          description: "Item for stock movement testing",
          categoryId: testCategoryId,
          locationId: testLocationId,
          sellingPrice: 100000,
          costPrice: 90000,
        },
      });
      expect(itemResponse.status()).toBe(201);

      const listResponse = await request.get(
        "/api/items?page=1&dataPerPage=100&sortBy=name&orderBy=asc",
      );
      const listBody = await listResponse.json();
      const items = listBody.data?.items ?? [];

      const item = items.find(
        (p: any) => p.name === `${TEST_PREFIX}Test Stock Movement Item`,
      );
      expect(item).toBeDefined();
      testItemId = item!.id;

      // 4. Create stock
      const stockResponse = await request.post("/api/stocks", {
        data: {
          itemId: testItemId,
          quantity: 100,
          totalCost: 1000000,
          reason: "Initial stock for movement testing",
          type: "READY",
          locationId: testLocationId,
        },
      });
      expect(stockResponse.status()).toBe(201);

      const stockListResponse = await request.get(
        "/api/stocks?page=1&dataPerPage=100&sortBy=createdAt&orderBy=asc",
      );
      const stockListBody = await stockListResponse.json();
      const stocks = stockListBody.data?.stocks ?? [];

      const stock = stocks.find((s: any) => s.itemId === testItemId);
      expect(stock).toBeDefined();
      testStockId = stock!.id;
    },
  );

  test("Create a new stock movement (RECEIVE)", async ({ request }) => {
    const response = await request.post("/api/stock-movements", {
      data: {
        itemId: testItemId,
        stockId: testStockId,
        stockMovementType: "RECEIVE",
        quantity: 25,
        totalCost: 750000,
        reason: "Initial movement test stock receive",
        destinationLocationid: testLocationId,
      },
    });

    const body = await response.json();
    console.log("Create Response:", body);

    expect(response.status()).toBe(200);
    expect(body.message).toContain("Stock movement created successfully");
    expect(body.data.stockMovementId).toBeDefined();

    createdStockMovementId = body.data.stockMovementId;
  });

  test("Get list of stock movements", async ({ request }) => {
    const response = await request.get(
      "/api/stock-movements?page=1&dataPerPage=10&sortBy=createdAt&sortOrder=asc",
    );
    const body = await response.json();

    console.log("Get List Response:", body);

    expect(response.status()).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.data.movements).toBeDefined();
    expect(Array.isArray(body.data.movements)).toBe(true);
  });

  test("Get single stock movement by ID", async ({ request }) => {
    const response = await request.get(
      `/api/stock-movements/${createdStockMovementId}`,
    );
    const body = await response.json();

    console.log("Get Single Response:", body);

    expect(response.status()).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.data.id).toBe(createdStockMovementId);
  });

  test("Update a stock movement", async ({ request }) => {
    const response = await request.patch(
      `/api/stock-movements/${createdStockMovementId}`,
      {
        data: { reason: "Updated stock movement test reason for validation" },
      },
    );
    const body = await response.json();

    console.log("Update Response:", body);

    expect(response.status()).toBe(200);
    expect(body.message).toContain("Stock movement updated successfully");
  });

  test("Error: Create stock movement with invalid item", async ({
    request,
  }) => {
    const response = await request.post("/api/stock-movements", {
      data: {
        itemId: "non-existent-item-id",
        stockMovementType: "RECEIVE",
        quantity: 25,
        totalCost: 750000,
        reason: "Invalid item movement test",
        destinationLocationid: testLocationId,
      },
    });
    const body = await response.json();

    console.log("Invalid Item Error Response:", body);

    expect(response.status()).toBe(404);
  });

  test("Error: Create stock movement with invalid stock", async ({
    request,
  }) => {
    const response = await request.post("/api/stock-movements", {
      data: {
        itemId: testItemId,
        stockId: "non-existent-stock-id",
        stockMovementType: "RECEIVE",
        quantity: 25,
        totalCost: 750000,
        reason: "Invalid stock movement test",
        destinationLocationid: testLocationId,
      },
    });
    const body = await response.json();

    console.log("Invalid Stock Error Response:", body);

    expect(response.status()).toBe(404);
  });

  test("Error: Create stock movement with invalid destination location", async ({
    request,
  }) => {
    const response = await request.post("/api/stock-movements", {
      data: {
        itemId: testItemId,
        stockMovementType: "RECEIVE",
        quantity: 25,
        totalCost: 750000,
        reason: "Invalid location movement test",
        destinationLocationId: "non-existent-location-id12345",
      },
    });
    const body = await response.json();

    console.log("Invalid Location Error Response:", body);

    expect(response.status()).toBe(404);
  });

  test("Error: Create stock movement with zero quantity", async ({
    request,
  }) => {
    const response = await request.post("/api/stock-movements", {
      data: {
        itemId: testItemId,
        stockMovementType: "RECEIVE",
        quantity: 0,
        totalCost: 750000,
        reason: "Zero quantity movement test",
        destinationLocationid: testLocationId,
      },
    });
    const body = await response.json();

    console.log("Zero Quantity Error Response:", body);

    expect(response.status()).toBe(400);
  });

  test("Error: Create stock movement with short reason", async ({
    request,
  }) => {
    const response = await request.post("/api/stock-movements", {
      data: {
        itemId: testItemId,
        stockMovementType: "RECEIVE",
        quantity: 25,
        totalCost: 750000,
        reason: "short",
        destinationLocationid: testLocationId,
      },
    });
    const body = await response.json();

    console.log("Short Reason Error Response:", body);

    expect(response.status()).toBe(400);
  });

  test("Error: TRANSFER without source and destination locations", async ({
    request,
  }) => {
    const response = await request.post("/api/stock-movements", {
      data: {
        itemId: testItemId,
        stockId: testStockId,
        stockMovementType: "TRANSFER",
        quantity: 10,
        reason: "Transfer without locations test",
      },
    });
    const body = await response.json();

    console.log("Transfer Without Locations Error Response:", body);

    expect(response.status()).toBe(400);
  });

  test("Error: RECEIVE without destination location", async ({ request }) => {
    const response = await request.post("/api/stock-movements", {
      data: {
        itemId: testItemId,
        stockMovementType: "RECEIVE",
        quantity: 10,
        reason: "Receive without destination test",
      },
    });
    const body = await response.json();

    console.log("Receive Without Destination Error Response:", body);

    expect(response.status()).toBe(400);
  });

  test("Error: Update non-existent stock movement", async ({ request }) => {
    const response = await request.patch(
      "/api/stock-movements/non-existent-stock-movement-id-12345",
      { data: { reason: "Valid reason for missing stock movement" } },
    );
    const body = await response.json();

    console.log("Non-existent Update Error Response:", body);

    expect(response.status()).toBe(404);
  });

  test("Cleanup: Delete leftover test data", async ({ browser }) => {
    const context = await browser.newContext({
      storageState: "playwright/.auth/manager.json",
    });
    const request = context.request;

    // Delete test items
    const itemList = await request.get(
      "http://localhost:3000/api/items?page=1&dataPerPage=100&sortBy=name&orderBy=asc",
    );
    const itemBody = await itemList.json();
    const items: { id: string; name: string }[] = itemBody.data?.items ?? [];

    for (const item of items) {
      if (item.name.startsWith(TEST_PREFIX)) {
        // Deactivate item first
        await request.patch(`http://localhost:3000/api/items`, {
          data: {
            itemId: item.id,
            name: item.name,
            isActive: false,
            description: "Cleanup",
          },
        });
        // Then delete
        await request.delete(`http://localhost:3000/api/items/${item.id}`);
      }
    }

    // Delete test categories
    const categoryList = await request.get(
      "http://localhost:3000/api/categories?sortOrder=asc&sortBy=name&page=1&dataPerPage=100",
    );
    const categoryBody = await categoryList.json();
    const categories: { id: string; name: string }[] =
      categoryBody.data?.categories ?? [];

    for (const category of categories) {
      if (category.name.startsWith(TEST_PREFIX)) {
        await request.delete(
          `http://localhost:3000/api/categories/${category.id}`,
        );
      }
    }

    await context.close();
  });
});
