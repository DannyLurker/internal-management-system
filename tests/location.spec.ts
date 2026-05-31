import { test, expect } from "@playwright/test";
import { LocationType } from "@prisma/client";

test.describe.configure({ mode: "serial" });

test.describe("CRUD operations for Location", () => {
  const TEST_PREFIX = `TEST_${Date.now()}+${Math.floor(Math.random() * 1000)}`;
  let createdLocationId: string;

  const createdLocationName = `${TEST_PREFIX}North Wing Cellar`;
  const updatedLocationName = `${TEST_PREFIX}North Wing Cellar Updated`;

  test("Create a new location", async ({ request }) => {
    const response = await request.post("/api/locations", {
      data: {
        name: createdLocationName,
        type: LocationType.MAIN_WAREHOUSE,
        description: "Test storage location for automated CRUD checks",
      },
    });
    const body = await response.json();
    console.log("Create Response:", body);

    expect(response.status()).toBe(201);
    expect(body.message).toContain(createdLocationName);

    const listResponse = await request.get(
      "/api/locations?sortOrderEnum=asc&sortBy=name&page=1&dataPerPage=100",
    );
    const listBody = await listResponse.json();
    const location = listBody.data.find(
      (loc: { name: string }) => loc.name === createdLocationName,
    );

    expect(location).toBeDefined();
    createdLocationId = location.id;
  });

  test("Get list of locations", async ({ request }) => {
    const response = await request.get(
      "/api/locations?sortOrderEnum=asc&sortBy=name&page=1&dataPerPage=10",
    );
    const body = await response.json();
    console.log("Get List Response:", body);

    expect(response.status()).toBe(200);
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("Get list of locations filtered by type", async ({ request }) => {
    const response = await request.get(
      `/api/locations?sortOrderEnum=asc&sortBy=name&page=1&dataPerPage=10&locationType=${LocationType.MAIN_WAREHOUSE}`,
    );
    const body = await response.json();
    console.log("Get List By Type Response:", body);

    expect(response.status()).toBe(200);
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
    expect(
      body.data.every(
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
    expect(body.data.name).toBe(createdLocationName);
    expect(body.data.type).toBe(LocationType.MAIN_WAREHOUSE);
    expect(body.data.stocks).toBeDefined();
    expect(Array.isArray(body.data.stocks)).toBe(true);
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

    const getResponse = await request.get(`/api/locations/${createdLocationId}`);
    const getBody = await getResponse.json();

    expect(getResponse.status()).toBe(200);
    expect(getBody.data.name).toBe(updatedLocationName);
    expect(getBody.data.type).toBe(LocationType.OPERATIONAL);
  });

  test("Delete a location", async ({ request }) => {
    const response = await request.delete(
      `/api/locations/${createdLocationId}`,
    );
    const body = await response.json();
    console.log("Delete Response:", body);

    expect(response.status()).toBe(200);
    expect(body.message).toContain(updatedLocationName);
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
    const { data: locations } = await list.json();

    for (const location of locations) {
      if (location.name.startsWith(TEST_PREFIX)) {
        await request.delete(
          `http://localhost:3000/api/locations/${location.id}`,
        );
      }
    }

    await context.close();
  });
});
