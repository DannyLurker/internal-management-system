import prisma from "@/shared/db/prisma";
import { test, expect } from "@playwright/test";

const formatToIDR = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 2,
  }).format(value);
};

test.describe("CRUD operations for Item", () => {
  test.describe.configure({ mode: "serial" });

  const TEST_PREFIX = `TEST_${Date.now()}+${Math.floor(Math.random() * 1000)}`;
  let createdItemId: string;
  let testCategoryId: string;
  let testLocationId: string;

  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test("Setup: Create test category for items", async ({ request }) => {
    const response = await request.post("/api/categories", {
      data: { name: `${TEST_PREFIX}Hotel Linen` },
    });

    const body = await response.json();
    console.log("Category Create Response:", body);

    expect(response.status()).toBe(201);

    type CategoryDto = { id: string; name: string };

    const listResponse = await request.get(
      "/api/categories?sortOrder=asc&sortBy=name&page=1&dataPerPage=100",
    );

    const listBody = await listResponse.json();
    const categories: CategoryDto[] = listBody.data;

    const category = categories.find((c) => {
      console.log("Category Target:", `${TEST_PREFIX}Hotel Linen`);
      console.log("Category Name:", c.name);

      return c.name === `${TEST_PREFIX}Hotel Linen`;
    });

    expect(category).toBeDefined();

    testCategoryId = category!.id;
  });

  test("Setup: Get test location ID dynamically", async () => {
    const location = await prisma.location.findFirst({
      where: { name: "Main Warehouse" },
    });

    if (location) {
      testLocationId = location.id;
    } else {
      const fallbackLoc = await prisma.location.findFirst();

      if (!fallbackLoc) {
        throw new Error(
          "No location found in database. Please run db seed first.",
        );
      }

      testLocationId = fallbackLoc.id;
    }

    console.log("Resolved testLocationId:", testLocationId);
  });

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

    console.log("Create Item Response Status:", response.status());

    const body = await response.json();

    console.log("Create Response:", {
      ...body,
      formattedSellingPrice: formatToIDR(sellingPrice),
      formattedTotalCost: formatToIDR(totalCost),
    });

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
    expect(body.data.id).toBe(createdItemId);
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
      formattedSellingPrice: formatToIDR(updatedSellingPrice),
    });

    expect(response.status()).toBe(200);

    expect(body.message).toContain(`${TEST_PREFIX}Luxury King Pillow - Firm`);
  });

  test("Delete an item", async ({ request }) => {
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
