import { test, expect } from "@playwright/test";

test.describe("CRUD operations for Category", () => {
  test.describe.configure({ mode: "serial" });

  const TEST_PREFIX = `TEST_${Date.now()}+${Math.floor(Math.random() * 1000)}`;
  let createdCategoryId: string;

  test("Create a new category", async ({ request }) => {
    const response = await request.post("/api/categories", {
      data: { name: `${TEST_PREFIX}Book` },
    });
    const body = await response.json();
    console.log("Create Response:", body);

    expect(response.status()).toBe(201);
    createdCategoryId = body.data;
  });

  test("Get list of categories", async ({ request }) => {
    const response = await request.get(
      "/api/categories?sortOrder=asc&sortBy=name&page=1&dataPerPage=10",
    );
    const body = await response.json();
    console.log("Get List Response:", body);

    expect(response.status()).toBe(200);
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("Get single category by ID", async ({ request }) => {
    console.log("createdCategoryId: ", createdCategoryId);
    const response = await request.get(
      `/api/categories/${createdCategoryId}`,
    );
    const body = await response.json();
    console.log("Get Single Response:", body);

    expect(response.status()).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.data.id).toBe(createdCategoryId);
  });

  test("Update a category", async ({ request }) => {
    const response = await request.patch("/api/categories", {
      data: { id: createdCategoryId, name: `${TEST_PREFIX}BookUpdated` },
    });
    const body = await response.json();
    console.log("Update Response:", body);

    expect(response.status()).toBe(200);
  });

  test("Delete a category", async ({ request }) => {
    const response = await request.delete(
      `/api/categories/${createdCategoryId}`,
    );
    const body = await response.json();
    console.log("Delete Response:", body);

    expect(response.status()).toBe(200);
  });

  test("Error: Create category with short name", async ({ request }) => {
    const response = await request.post("/api/categories", {
      data: { name: "Bo" },
    });
    const body = await response.json();
    console.log("Short Name Error Response:", body);

    expect(response.status()).toBe(400);
  });

  test("Error: Create duplicate category name", async ({ request }) => {
    // Create first
    await request.post("/api/categories", {
      data: { name: `${TEST_PREFIX}Duplicate` },
    });

    // Create duplicate
    const response = await request.post("/api/categories", {
      data: { name: `${TEST_PREFIX}Duplicate` },
    });
    const body = await response.json();
    console.log("Duplicate Error Response:", body);

    expect(response.status()).toBe(409);
    expect(body.message.toLowerCase()).toContain("name");
  });

  test("Error: Update non-existent category", async ({ request }) => {
    const response = await request.patch("/api/categories", {
      data: { name: "Updated Name", id: "non-existent-id-12345" },
    });
    const body = await response.json();
    console.log("Non-existent Update Error Response:", body);

    expect(response.status()).toBe(404);
  });

  test("Error: Delete non-existent category", async ({ request }) => {
    const response = await request.delete(
      "/api/categories/non-existent-id-12345",
    );
    const body = await response.json();
    console.log("Non-existent Delete Error Response:", body);

    expect(response.status()).toBe(404);
  });

  // Cleanup leftover test data (duplicate test creates data that isn't deleted)
  test("Cleanup: Delete leftover test data", async ({ browser }) => {
    const context = await browser.newContext({
      storageState: "playwright/.auth/manager.json",
    });
    const request = context.request;

    const list = await request.get(
      "http://localhost:3000/api/categories?page=1&dataPerPage=100",
    );
    const { data: categories } = await list.json();

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
