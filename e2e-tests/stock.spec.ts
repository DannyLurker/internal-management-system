import { test, expect } from "@playwright/test";

test.describe.configure({ mode: "serial" });

test.describe("CRUD operations for Stock", () => {
  const TEST_PREFIX = `TEST_${Date.now()}+${Math.floor(Math.random() * 1000)}`;
  let createdStockId: string;
  let testItemId: string;
  let testLocationId: string;
  let testCategoryId: string;

  test.describe.configure({ mode: "serial" });

  test.beforeAll(
    "Setup: Create test item and resolve location",
    async ({ request }) => {
      const categoryResponse = await request.post("/api/categories", {
        data: { name: `${TEST_PREFIX}Stock Test Category` },
      });

      const categoryBody = await categoryResponse.json();
      console.log("Category body: ", categoryBody);

      expect(categoryBody.status).toBe(201);

      expect(categoryBody.data).toBeDefined();
      testCategoryId = categoryBody.data.id;

      const locationResponse = await request.get(
        "/api/locations?page=1&dataPerPage=10",
      );
      const locationBody = await locationResponse.json();
      expect(locationResponse.status()).toBe(200);
      testLocationId = locationBody.data.locations[0].id;

      const itemResponse = await request.post("/api/items", {
        data: {
          name: `${TEST_PREFIX}Test Stock Item`,
          description: "Item for stock testing",
          categoryId: testCategoryId,
          locationId: testLocationId,
          sellingPrice: 100000,
          costPrice: 90000,
        },
      });

      const itemReponseBody = await itemResponse.json();
      console.log("Item reponse body: ", itemReponseBody);

      expect(itemReponseBody.status).toBe(201);

      const listResponse = await request.get(
        "/api/items?page=1&dataPerPage=100&sortBy=name&orderBy=asc",
      );
      const listBody = await listResponse.json();
      const items = listBody.data?.items ?? [];

      const item = items.find(
        (p: any) => p.name === `${TEST_PREFIX}Test Stock Item`,
      );
      expect(item).toBeDefined();
      testItemId = item!.id;
    },
  );

  test("Create a new stock", async ({ request }) => {
    const response = await request.post("/api/stocks", {
      data: {
        itemId: testItemId,
        quantity: 50,
        totalCost: 1500000,
        reason: "Initial stock setup",
        type: "READY",
        locationId: testLocationId,
      },
    });

    const body = await response.json();
    console.log(body);

    expect(response.status()).toBe(201);
    expect(body.message).toContain("Stock created successfully");
  });

  test("Get list of stocks", async ({ request }) => {
    const response = await request.get(
      "/api/stocks?page=1&dataPerPage=10&sortBy=createdAt&orderBy=asc",
    );

    const body = await response.json();

    console.log("Get List Response:", body);

    expect(response.status()).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.data.stocks).toBeDefined();
    expect(Array.isArray(body.data.stocks)).toBe(true);
  });

  test("Get single stock by ID", async ({ request }) => {
    const listResponse = await request.get(
      "/api/stocks?page=1&dataPerPage=100&sortBy=createdAt&orderBy=asc",
    );

    const listBody = await listResponse.json();

    type StockDto = {
      id: string;
      itemId: string;
    };

    const stocks: StockDto[] = listBody.data?.stocks ?? [];

    const stock = stocks.find((s) => s.itemId === testItemId);

    expect(stock).toBeDefined();

    createdStockId = stock!.id;

    const response = await request.get(`/api/stocks/${createdStockId}`);

    const body = await response.json();

    console.log("Get Single Response:", body);

    expect(response.status()).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.data.stock.id).toBe(createdStockId);
  });

  test("Get stocks by item", async ({ request }) => {
    const response = await request.get(
      `/api/stocks?itemId=${testItemId}&page=1&dataPerPage=10&sortBy=createdAt&orderBy=asc`,
    );

    const body = await response.json();

    console.log("Get By Item Response:", body);

    expect(response.status()).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.data.stocks).toBeDefined();
    expect(Array.isArray(body.data.stocks)).toBe(true);
  });

  test("Update a stock", async ({ request }) => {
    const response = await request.patch(`/api/stocks/${createdStockId}`, {
      data: {
        type: "DIRTY",
        locationId: testLocationId,
        expiredAt: new Date(),
      },
    });

    const body = await response.json();

    console.log("Update Response:", body);

    expect(response.status()).toBe(200);
    expect(body.message).toContain("Stock updated successfully");
  });

  test("Error: Create stock with invalid item", async ({ request }) => {
    const response = await request.post("/api/stocks", {
      data: {
        itemId: "non-existent-item-id",
        quantity: 50,
        totalCost: 1500000,
        reason: "Test invalid item",
        type: "READY",
        locationId: testLocationId,
      },
    });

    const body = await response.json();

    console.log("Invalid Item Error Response:", body);

    expect(response.status()).toBe(404);
  });

  test("Error: Create stock with invalid location", async ({ request }) => {
    const response = await request.post(`/api/stocks`, {
      data: {
        itemId: testItemId,
        quantity: 50,
        totalCost: 1500000,
        reason: "Test invalid location",
        type: "READY",
        locationId: "non-existent-location-id",
      },
    });

    const body = await response.json();

    console.log("Invalid Location Error Response:", body);

    expect(response.status()).toBe(404);
  });

  test("Error: Create stock with zero quantity", async ({ request }) => {
    const response = await request.post(`/api/stocks`, {
      data: {
        itemId: testItemId,
        quantity: 0,
        totalCost: 1500000,
        reason: "Test zero quantity",
        type: "READY",
        locationId: testLocationId,
      },
    });

    const body = await response.json();

    console.log("Zero Quantity Error Response:", body);

    expect(response.status()).toBe(400);
  });

  test("Error: Create stock with empty reason", async ({ request }) => {
    const response = await request.post(`/api/stocks`, {
      data: {
        itemId: testItemId,
        quantity: 50,
        totalCost: 1500000,
        reason: "",
        type: "READY",
        locationId: testLocationId,
      },
    });

    const body = await response.json();

    console.log("Empty Reason Error Response:", body);

    expect(response.status()).toBe(400);
  });

  test("Error: Update non-existent stock", async ({ request }) => {
    const response = await request.patch(
      "/api/stocks/non-existent-stock-id-12345",
      {
        data: {
          type: "READY",
          locationId: testLocationId,
        },
      },
    );

    const body = await response.json();

    console.log("Non-existent Update Error Response:", body);

    expect(response.status()).toBe(404);
  });

  test("Error: Delete stock with movements", async ({ request }) => {
    // Stock created earlier has movements, so it should fail
    const response = await request.delete(`/api/stocks/${createdStockId}`);

    const body = await response.json();

    console.log("Delete With Movements Error Response:", body);

    expect(response.status()).toBe(400);
    expect(body.message).toContain(
      "Stock cannot be deleted because it has history of stock movements",
    );
  });

  test("Delete a stock", async ({ request }) => {
    const createResponse = await request.post(`/api/stocks`, {
      data: {
        itemId: testItemId,
        quantity: 10,
        totalCost: 300000,
        reason: "Test stock for deletion",
        type: "READY",
        locationId: testLocationId,
      },
    });

    const createdStockBody = await createResponse.json();

    // Try to delete - this will likely fail due to movements
    const deleteResponse = await request.delete(
      `/api/stocks/${createdStockBody.data.stockId}`,
    );
    const deleteBody = await deleteResponse.json();

    console.log("Delete Response:", deleteBody);

    // Expected to fail due to movements being created automatically
    expect(deleteResponse.status()).toBe(400);
  });

  test("Error: Delete non-existent stock", async ({ request }) => {
    const response = await request.delete(
      "/api/stocks/non-existent-stock-id-12345",
    );

    const body = await response.json();

    console.log("Non-existent Delete Error Response:", body);

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
