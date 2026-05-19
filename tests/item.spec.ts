import { ItemCreateSchema } from "@/shared/lib/zods/item.zod";
import { test, expect } from "@playwright/test";

test.describe("CRUD operations for Product", () => {
  test.describe.configure({ mode: "serial" });

  const TEST_PREFIX = `TEST_${Date.now()}+${Math.floor(Math.random() * 1000)}`;
  let createdProductId: string;
  let testCategoryId: string;

  test("Setup: Create test category for items", async ({ request }) => {
    const response = await request.post("/api/categories", {
      data: { name: `${TEST_PREFIX}ProductCategory` },
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
      console.log("Category:", `${TEST_PREFIX}ProductCategory`);
      console.log("Category name:", c.name);
      return c.name === `${TEST_PREFIX}ProductCategory`;
    });
    expect(category).toBeDefined();
    testCategoryId = category!.id;
  });

  test("Create a new product", async ({ request }) => {
    const response = await request.post("/api/items", {
      data: {
        name: `${TEST_PREFIX}Laptop`,
        description: "A high-performance laptop for testing",
        categoryId: testCategoryId,
        price: 999.99,
        image: "https://example.com/laptop.jpg",
        initialStock: 10,
        attributes: {
          color: "black",
          weight: "1.5kg",
        },
      },
    });
    const body = await response.json();
    console.log("Create Response:", body);

    expect(response.status()).toBe(201);
    expect(body.message).toContain(`${TEST_PREFIX}Laptop`);
  });

  test("Get list of products", async ({ request }) => {
    const response = await request.get(
      "/api/products?page=1&dataPerPage=10&sortBy=name&orderBy=asc",
    );
    const body = await response.json();
    console.log("Get List Response:", body);

    expect(response.status()).toBe(200);
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("Get single product by ID", async ({ request }) => {
    // First get list to find the product ID
    const listResponse = await request.get(
      "/api/products?page=1&dataPerPage=100&sortBy=name&orderBy=asc",
    );
    const listBody = await listResponse.json();

    type ProductDto = { id: string; name: string };
    const products: ProductDto[] = listBody.data;

    const product = products.find((p) => p.name === `${TEST_PREFIX}Laptop`);
    expect(product).toBeDefined();
    createdProductId = product!.id;

    // Get single product
    const response = await request.get(`/api/products/${createdProductId}`);
    const body = await response.json();
    console.log("Get Single Response:", body);

    expect(response.status()).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.data.id).toBe(createdProductId);
  });

  test("Get products by category", async ({ request }) => {
    const response = await request.get(
      `/api/products?isByCategory=true&categoryId=${testCategoryId}`,
    );
    const body = await response.json();
    console.log("Get By Category Response:", body);

    expect(response.status()).toBe(200);
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("Update a product", async ({ request }) => {
    const response = await request.patch("/api/products", {
      data: {
        productId: createdProductId,
        name: `${TEST_PREFIX}Gaming Laptop`,
        description: "Updated description for gaming",
        categoryId: testCategoryId,
        price: 1299.99,
        image: "https://example.com/gaming-laptop.jpg",
      },
    });
    const body = await response.json();
    console.log("Update Response:", body);

    expect(response.status()).toBe(200);
    expect(body.message).toContain(`${TEST_PREFIX}Gaming Laptop`);
  });

  test("Delete a product", async ({ request }) => {
    const response = await request.delete(`/api/products/${createdProductId}`);
    const body = await response.json();
    console.log("Delete Response:", body);

    expect(response.status()).toBe(200);
    expect(body.message).toContain(`${TEST_PREFIX}Gaming Laptop`);
  });

  test("Error: Create product with short name", async ({ request }) => {
    const response = await request.post("/api/products", {
      data: {
        name: "",
        description: "Test description",
        categoryId: testCategoryId,
        price: 100,
      },
    });
    const body = await response.json();
    console.log("Short Name Error Response:", body);

    expect(response.status()).toBe(400);
  });

  test("Error: Create product with invalid category", async ({ request }) => {
    const response = await request.post("/api/products", {
      data: {
        name: `${TEST_PREFIX}InvalidProduct`,
        description: "Test description",
        categoryId: "XX",
        price: 100,
      },
    });
    const body = await response.json();
    console.log("Invalid Category Error Response:", body);

    expect(response.status()).toBe(400);
  });

  test("Error: Update non-existent product", async ({ request }) => {
    const response = await request.patch("/api/products", {
      data: {
        productId: "non-existent-id-12345",
        name: `${TEST_PREFIX}UpdatedName`,
        description: "Updated description",
        categoryId: testCategoryId,
        price: 200,
      },
    });
    const body = await response.json();
    console.log("Non-existent Update Error Response:", body);

    expect(response.status()).toBe(404);
  });

  test("Error: Delete non-existent product", async ({ request }) => {
    const response = await request.delete(
      "/api/products/non-existent-id-12345",
    );
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

    // Delete test products
    const productList = await request.get(
      "http://localhost:3000/api/products?page=1&dataPerPage=100",
    );
    const { data: products } = await productList.json();

    for (const product of products) {
      if (product.name.startsWith(TEST_PREFIX)) {
        await request.delete(
          `http://localhost:3000/api/products/${product.id}`,
        );
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
