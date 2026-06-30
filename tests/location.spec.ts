import { test, expect } from "@playwright/test";
import { LocationType } from "@prisma/client";

test.describe.configure({ mode: "serial" });

test.describe("CRUD operations for Location", () => {
  const TEST_PREFIX = `TEST_${Date.now()}+${Math.floor(Math.random() * 1000)}`;
  let createdLocationId: string;
  let locationIdToDelete: string;

  const createdLocationName = `${TEST_PREFIX}North Wing Cellar`;
  const updatedLocationName = `${TEST_PREFIX}North Wing Cellar Updated`;

  test("Create a new location", async ({ request }) => {
    // Prepared a location to delete in order to test the deletion of a location with no items
    await request.post("/api/locations", {
      data: {
        name: "TEST_LOCATION_TO_DELETE",
        type: LocationType.MAIN_WAREHOUSE,
        description: "Test storage location for automated CRUD checks",
      },
    });

    // Create the main test location
    const response = await request.post("/api/locations", {
      data: {
        name: createdLocationName,
        type: LocationType.MAIN_WAREHOUSE,
        description: "Test storage location for automated CRUD checks",
      },
    });

    const locationBody = await response.json();
    console.log("Create Response:", locationBody);

    expect(response.status()).toBe(201);
    expect(locationBody.message).toContain(createdLocationName);

    const listResponse = await request.get(
      "/api/locations?sortOrderEnum=asc&sortBy=name&page=1&dataPerPage=100",
    );
    const listBody = await listResponse.json();
    const location = listBody.data.locations.find(
      (loc: { name: string }) => loc.name === createdLocationName,
    );

    const locationToDelete = listBody.data.locations.find(
      (loc: { name: string }) => loc.name === "TEST_LOCATION_TO_DELETE",
    );

    expect(location).toBeDefined();
    createdLocationId = location.id;
    locationIdToDelete = locationToDelete.id;

    await request.post("/api/categories", {
      data: { name: `${TEST_PREFIX}Book` },
    });

    const categoryDataResponse = await request.get(
      "/api/categories?sortOrder=asc&sortBy=name&page=1&dataPerPage=100",
    );
    const categoryBody = await categoryDataResponse.json();
    console.log("Get Category List Response:", categoryBody);

    const category = categoryBody.data.categories.find(
      (cat: { name: string }) => cat.name === `${TEST_PREFIX}Book`,
    );

    const testCategoryId = category.id;

    const createItemResponse = await request.post("/api/items", {
      data: {
        name: `${TEST_PREFIX}Luxury King Pillow - Firm`,
        description: "Premium goose down pillow for guest rooms",
        categoryId: testCategoryId,
        locationId: location.id,
        sellingPrice: 450000,
        image: "https://example.com/luxury-king-pillow.jpg",
        stock: {
          quantity: 50,
          totalCost: 1500000,
          reason: "Bulk purchase for room setup",
        },
        attributes: {
          size: "King",
          fill: "Goose Down",
          color: "White",
        },
      },
    });

    console.log(await createItemResponse.json());
    expect(createItemResponse.status()).toBe(201);

    const itemDataResponse = await request.get(
      "/api/items?page=1&dataPerPage=100&sortBy=name&orderBy=asc",
    );

    const itemDataBody = await itemDataResponse.json();

    const createdItem = itemDataBody.data.items.find(
      (item: { name: string; id: string }) =>
        item.name === `${TEST_PREFIX}Luxury King Pillow - Firm`,
    );
    console.log("Created Item:", itemDataBody.data.items);

    await request.post("/api/stocks", {
      data: {
        itemId: createdItem.id,
        locationId: createdLocationId,
        quantity: 20,
        totalCost: 600000,
        reason: "Initial stock for testing",
        type: "READY",
      },
    });
  });

  test("Get list of locations", async ({ request }) => {
    const response = await request.get(
      "/api/locations?sortOrderEnum=asc&sortBy=name&page=1&dataPerPage=10",
    );
    const body = await response.json();
    console.log("Get List Response:", body);

    expect(response.status()).toBe(200);
    expect(body.data.locations).toBeDefined();
    expect(Array.isArray(body.data.locations)).toBe(true);
  });

  test("Get list of locations filtered by type", async ({ request }) => {
    const response = await request.get(
      `/api/locations?sortOrderEnum=asc&sortBy=name&page=1&dataPerPage=10&locationType=${LocationType.MAIN_WAREHOUSE}`,
    );
    const body = await response.json();
    console.log("Get List By Type Response:", body);

    expect(response.status()).toBe(200);
    expect(body.data.locations).toBeDefined();
    expect(Array.isArray(body.data.locations)).toBe(true);
    expect(
      body.data.locations.every(
        (location: { type: LocationType }) =>
          location.type === LocationType.MAIN_WAREHOUSE,
      ),
    ).toBe(true);
  });

  test("Get single location by ID", async ({ request }) => {
    console.log("createdLocationId:", createdLocationId);

    const response = await request.get(
      `/api/locations/${createdLocationId}?itemPage=1&itemDataPerPage=10`,
    );
    const body = await response.json();
    console.log("Get Single Response:", body);

    expect(response.status()).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.data.location.name).toBe(createdLocationName);
    expect(body.data.location.type).toBe(LocationType.MAIN_WAREHOUSE);
    expect(body.data.location.stocks).toBeDefined();
    expect(Array.isArray(body.data.location.stocks)).toBe(true);
  });

  test("Update a location", async ({ request }) => {
    const response = await request.patch("/api/locations", {
      data: {
        locationId: createdLocationId,
        name: updatedLocationName,
        description: "Updated test storage location",
        type: LocationType.OPERATIONAL,
      },
    });
    const body = await response.json();
    console.log("Update Response:", body);

    expect(response.status()).toBe(200);
    expect(body.message).toContain(updatedLocationName);

    const getResponse = await request.get(
      `/api/locations/${createdLocationId}`,
    );
    const getBody = await getResponse.json();

    expect(getResponse.status()).toBe(200);

    console.log(getBody);

    expect(getBody.data.location.name).toContain(updatedLocationName);
  });

  test("Error: There is still a data in that location", async ({ request }) => {
    const response = await request.delete(
      `/api/locations/${createdLocationId}`,
    );
    const body = await response.json();
    console.log("Delete Response:", body);

    expect(response.status()).toBe(400);
    expect(body.message).toContain(
      "Item was found in this location. Migrate all the item before deleting.",
    );
  });

  test("Delete a location", async ({ request }) => {
    const response = await request.delete(
      `/api/locations/${locationIdToDelete}`,
    );
    const body = await response.json();
    console.log("Delete Response:", body);

    expect(response.status()).toBe(200);
    expect(body.message).toContain("deleted successfully");
  });

  test("Error: Create location with short name", async ({ request }) => {
    const response = await request.post("/api/locations", {
      data: {
        name: "Bo",
        type: LocationType.MAIN_WAREHOUSE,
      },
    });
    const body = await response.json();
    console.log("Short Name Error Response:", body);

    expect(response.status()).toBe(400);
  });

  test("Error: Create duplicate location name", async ({ request }) => {
    const duplicateName = `${TEST_PREFIX}Duplicate Location`;

    await request.post("/api/locations", {
      data: {
        name: duplicateName,
        type: LocationType.FLOOR_LOCKER,
      },
    });

    const response = await request.post("/api/locations", {
      data: {
        name: duplicateName,
        type: LocationType.FRONT_OFFICE,
      },
    });
    const body = await response.json();
    console.log("Duplicate Error Response:", body);

    expect(response.status()).toBe(409);
    expect(body.message.toLowerCase()).toContain("name");
  });

  test("Error: Update non-existent location", async ({ request }) => {
    const response = await request.patch("/api/locations", {
      data: {
        locationId: "non-existent-id-12345",
        name: `${TEST_PREFIX}Missing Location`,
      },
    });
    const body = await response.json();
    console.log("Non-existent Update Error Response:", body);

    expect(response.status()).toBe(404);
  });

  test("Error: Delete non-existent location", async ({ request }) => {
    const response = await request.delete(
      "/api/locations/non-existent-id-12345",
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

    const list = await request.get(
      "http://localhost:3000/api/locations?page=1&dataPerPage=100&sortOrderEnum=asc&sortBy=name",
    );
    const { data: locationResponse } = await list.json();

    for (const location of locationResponse.locations) {
      if (location.name.startsWith(TEST_PREFIX)) {
        await request.delete(
          `http://localhost:3000/api/locations/${location.id}`,
        );
      }
    }

    await context.close();
  });
});
