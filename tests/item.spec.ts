import prisma from "@/shared/db/prisma";
import { test, expect } from "@playwright/test";

test.describe("CRUD operations for Item", () => {
  test.describe.configure({ mode: "serial" });

  const TEST_PREFIX = `TEST_${Date.now()}+${Math.floor(Math.random() * 1000)}`;
  let createdItemId: string;
  let testCategoryId: string;
  let testLocationId: string;

  test("Setup: Create test category for items", async ({ request }) => {
    const response = await request.post("/api/categories", {
      data: { name: `${TEST_PREFIX}ItemCategory` },
    });
    const body = await response.json();
    console.log("Category Create Response:", body);

    expect(response.status()).toBe(201);

    type CategoryDto = { id: string; name: string };

    // Get the category ID from list
    const listResponse = await request.get(
      "/api/categories?sortOrder=asc&sortBy=name&page=1&dataPerPage=100",
    );
    const listBody = await listResponse.json();
    const categories: CategoryDto[] = listBody.data;

    const category = categories.find((c) => {
      console.log("Category:", `${TEST_PREFIX}ItemCategory`);
      console.log("Category name:", c.name);
      return c.name === `${TEST_PREFIX}ItemCategory`;
    });
    expect(category).toBeDefined();
    testCategoryId = category!.id;
  });

  test("Setup: Get test location ID (I haven't created the location yet)", async ({
    request,
  }) => {
    testLocationId = "cmpe19lj7000d5ouqm8izv6ap"; //hard coded for a while;
  });

  test("Create a new item", async ({ request }) => {
    const response = await request.post("/api/items", {
      data: {
        name: `${TEST_PREFIX}chair`,
        description: "A high-performance chair for testing",
        categoryId: testCategoryId,
        locationId: testLocationId,
        sellingPrice: 999.99,
        image: "https://example.com/chair.jpg",
        stock: {
          quantity: 10,
          totalCost: 8000,
          reason: "Initial stock for testing",
        },
        attributes: {
          color: "black",
          weight: "1.5kg",
        },
      },
    });

    console.log("76 Items ln: ", response);

    const body = await response.json();
    console.log("Create Response:", body);

    expect(response.status()).toBe(201);
    expect(body.message).toContain(`${TEST_PREFIX}chair`);
  });

  test("Get list of items", async ({ request }) => {
    const response = await request.get(
      "/api/items?page=1&dataPerPage=10&sortBy=name&orderBy=asc",
    );
    const body = await response.json();
    console.log("Get List Response:", body);

    expect(response.status()).toBe(200);
    // ItemGetManyApiResponse = ApiResponse<items[]> → body.data is the array
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("Get single item by ID", async ({ request }) => {
    // First get list to find the item ID
    const listResponse = await request.get(
      "/api/items?page=1&dataPerPage=100&sortBy=name&orderBy=asc",
    );
    const listBody = await listResponse.json();

    type ItemDto = { id: string; name: string };
    // ItemGetManyApiResponse = ApiResponse<items[]> → body.data is the array
    const items: ItemDto[] = listBody.data;

    const item = items.find((p) => p.name === `${TEST_PREFIX}chair`);
    expect(item).toBeDefined();
    createdItemId = item!.id;

    // Get single item
    const response = await request.get(`/api/items/${createdItemId}`);
    const body = await response.json();
    console.log("Get Single Response:", body);

    expect(response.status()).toBe(200);
    // ItemGetByIdApiResponse = ApiResponse<item> → body.data is the item object
    expect(body.data).toBeDefined();
    expect(body.data.id).toBe(createdItemId);
  });

  test("Get items by category", async ({ request }) => {
    const response = await request.get(
      `/api/items?isByCategory=true&categoryId=${testCategoryId}&page=1&dataPerPage=10&sortBy=name&orderBy=asc`,
    );
    const body = await response.json();
    console.log("Get By Category Response:", body);

    expect(response.status()).toBe(200);
    // ItemGetManyApiResponse = ApiResponse<items[]> → body.data is the array
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("Update an item", async ({ request }) => {
    const response = await request.patch("/api/items", {
      data: {
        itemId: createdItemId,
        name: `${TEST_PREFIX}Gaming Chair`,
        description: "Updated description for gaming",
        categoryId: testCategoryId,
        sellingPrice: 1299.99,
        image: "https://example.com/gaming-chair.jpg",
      },
    });
    const body = await response.json();
    console.log("Update Response:", body);

    expect(response.status()).toBe(200);
    expect(body.message).toContain(`${TEST_PREFIX}Gaming Chair`);
  });

  test("Delete an item", async ({ request }) => {
    const response = await request.delete(`/api/items/${createdItemId}`);
    const body = await response.json();
    console.log("Delete Response:", body);

    expect(response.status()).toBe(200);
    expect(body.message).toContain(`${TEST_PREFIX}Gaming Chair`);
  });

  test("Error: Create item with short name", async ({ request }) => {
    const response = await request.post("/api/items", {
      data: {
        name: "",
        description: "Test description",
        categoryId: testCategoryId,
        locationId: testLocationId,
        sellingPrice: 100,
      },
    });
    const body = await response.json();
    console.log("Short Name Error Response:", body);

    expect(response.status()).toBe(400);
  });

  test("Error: Create item with invalid category", async ({ request }) => {
    const response = await request.post("/api/items", {
      data: {
        name: `${TEST_PREFIX}InvalidProduct`,
        description: "Test description",
        categoryId: "XX",
        locationId: testLocationId,
        sellingPrice: 100,
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
        name: `${TEST_PREFIX}UpdatedName`,
        description: "Updated description",
        categoryId: testCategoryId,
        sellingPrice: 200,
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

  // Cleanup leftover test data
  test("Cleanup: Delete leftover test data", async ({ browser }) => {
    const context = await browser.newContext({
      storageState: "playwright/.auth/manager.json",
    });
    const request = context.request;

    // Delete test items
    // ItemGetManyApiResponse = ApiResponse<items[]> → body.data is the array
    const itemList = await request.get(
      "http://localhost:3000/api/items?page=1&dataPerPage=100&sortBy=name&orderBy=asc",
    );
    const itemBody = await itemList.json();
    const items: { id: string; name: string }[] = itemBody.data ?? [];

    for (const item of items) {
      if (item.name.startsWith(TEST_PREFIX)) {
        await request.delete(`http://localhost:3000/api/items/${item.id}`);
      }
    }

    // Delete test categories
    const categoryList = await request.get(
      "http://localhost:3000/api/categories?page=1&dataPerPage=100",
    );
    const { data: categories } = await categoryList.json();

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
