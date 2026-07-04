// import { test, expect, APIRequestContext } from "@playwright/test";

// const STOCK_MOVEMENTS_API = "/api/stock-movements";
// const QUICK_DISCARD_API = `${STOCK_MOVEMENTS_API}?stockMovementCreateMode=QUICK_DISCARD`;
// const QUICK_LAUNDRY_OUT_API = `${STOCK_MOVEMENTS_API}?stockMovementCreateMode=QUICK_LAUNDRY_OUT`;

// async function getStock(request: APIRequestContext, stockId: string) {
//   const res = await request.get(`/api/stocks/${stockId}`);
//   expect(res.status()).toBe(200);
//   const body = await res.json();
//   return body.data as {
//     id: string;
//     quantity: number;
//     type: string;
//     itemId: string;
//     locationId: string;
//   };
// }

// async function findStockByType(request: APIRequestContext) {
//   const res = await request.get(`/api/stock-movements?page=1&dataPerPage=100`);
//   expect(res.status()).toBe(200);
//   const body = await res.json();
//   const stocks: { id: string; quantity: number; type: string }[] =
//     body.data?.stockMovements ?? [];
//   return stocks;
// }

// test.describe.configure({ mode: "serial" });

// test.describe("CRUD operations for Stock Movements", () => {
//   const TEST_PREFIX = `TEST_${Date.now()}+${Math.floor(Math.random() * 1000)}`;
//   let createdStockMovementId: string;
//   let testItemId: string;
//   let testItemName: string;
//   let testSourceLocationId: string;
//   let testDestinationLocationId: string;
//   let testCategoryId: string;
//   let readyStockId: string;

//   test.beforeAll(
//     "Setup: Create test item, resolve location, and seed a READY stock",
//     async ({ request }) => {
//       const categoryResponse = await request.post("/api/categories", {
//         data: { name: `${TEST_PREFIX}Stock Movement Test Category` },
//       });
//       expect(categoryResponse.status()).toBe(201);

//       const categoryListResponse = await request.get(
//         "/api/categories?sortOrder=asc&sortBy=name&page=1&dataPerPage=100",
//       );
//       const categoryListBody = await categoryListResponse.json();

//       type CategoryDto = { id: string; name: string };
//       const categories: CategoryDto[] = categoryListBody.data.categories;
//       const category = categories.find(
//         (c) => c.name === `${TEST_PREFIX}Stock Movement Test Category`,
//       );
//       expect(category).toBeDefined();
//       testCategoryId = category!.id;

//       const locationResponse = await request.get(
//         "/api/locations?page=1&dataPerPage=10",
//       );
//       const locationBody = await locationResponse.json();
//       expect(locationResponse.status()).toBe(200);
//       testDestinationLocationId = locationBody.data.locations[0].id;
//       testSourceLocationId = locationBody.data.locations[1].id;

//       const itemResponse = await request.post("/api/items", {
//         data: {
//           name: `${TEST_PREFIX}Test Stock Movement Item`,
//           description: "Item for stock movement testing",
//           categoryId: testCategoryId,
//           locationId: testDestinationLocationId,
//           sellingPrice: 100000,
//         },
//       });
//       expect(itemResponse.status()).toBe(201);

//       const listResponse = await request.get(
//         "/api/items?page=1&dataPerPage=100&sortBy=name&orderBy=asc",
//       );
//       const listBody = await listResponse.json();

//       type ItemDto = { id: string; name: string };
//       const items: ItemDto[] = listBody.data?.items ?? [];
//       const item = items.find(
//         (p) => p.name === `${TEST_PREFIX}Test Stock Movement Item`,
//       );
//       expect(item).toBeDefined();
//       testItemId = item!.id;
//       testItemName = item!.name;

//       // Seed 100 units of READY stock at the source location via the stocks
//       // API so later tests (TRANSFER, ADJUSTMENT, MARK_AS_*, quick actions)
//       // have a known starting quantity to assert against.
//       const seedStockResponse = await request.post("/api/stocks", {
//         data: {
//           itemId: testItemId,
//           quantity: 100,
//           totalCost: 1000000,
//           reason: "Seed stock for stock movement test suite",
//           type: "READY",
//           locationId: testSourceLocationId,
//         },
//       });
//       const seededStockBody = await seedStockResponse.json();
//       expect(seedStockResponse.status()).toBe(201);
//       const seededStock = await findStockByType(request, stockId: seededStockBody.data.id);

//       const findSeededStockById = seededStock.expect(seededStock).toBeDefined();
//       readyStockId = seededStock.id;
//       expect(seededStock.quantity).toBe(100);
//     },
//   );

//   // ---------------------------------------------------------------------
//   // Baseline CRUD (unchanged behavior)
//   // ---------------------------------------------------------------------

//   test("Create a new stock movement (RECEIVE, no stockId)", async ({
//     request,
//   }) => {
//     const response = await request.post(STOCK_MOVEMENTS_API, {
//       data: {
//         itemId: testItemId,
//         stockMovementType: "RECEIVE",
//         quantity: 25,
//         totalCost: 750000,
//         reason: "Initial movement test stock receive",
//         destinationLocationId: testDestinationLocationId,
//       },
//     });

//     const body = await response.json();
//     expect(response.status()).toBe(200);
//     expect(body.message).toContain("Stock movement created successfully");
//     expect(body.data.id).toBeDefined();

//     createdStockMovementId = body.data.id;
//   });

//   test("Get list of stock movements", async ({ request }) => {
//     const response = await request.get(
//       "/api/stock-movements?page=1&dataPerPage=10&sortBy=createdAt&sortOrder=asc",
//     );
//     const body = await response.json();

//     expect(response.status()).toBe(200);
//     expect(Array.isArray(body.data.movements)).toBe(true);
//   });

//   test("Get single stock movement by ID", async ({ request }) => {
//     const response = await request.get(
//       `/api/stock-movements/${createdStockMovementId}`,
//     );
//     const body = await response.json();

//     expect(response.status()).toBe(200);
//     expect(body.data.id).toBe(createdStockMovementId);
//   });

//   test("Update a stock movement", async ({ request }) => {
//     const response = await request.patch(
//       `/api/stock-movements/${createdStockMovementId}`,
//       { data: { reason: "Updated stock movement test reason" } },
//     );
//     const body = await response.json();

//     expect(response.status()).toBe(200);
//     expect(body.message).toContain("Stock movement updated successfully");
//     expect(body.data.id).toBe(createdStockMovementId);
//   });

//   // ---------------------------------------------------------------------
//   // TRANSFER
//   // ---------------------------------------------------------------------

//   test("Transfer stock to a different location moves quantity correctly", async ({
//     request,
//   }) => {
//     const before = await getStock(request, readyStockId);

//     const response = await request.post(STOCK_MOVEMENTS_API, {
//       data: {
//         itemId: testItemId,
//         stockId: readyStockId,
//         stockMovementType: "TRANSFER",
//         quantity: 20,
//         reason: "Transfer stock to destination location",
//         sourceLocationId: testSourceLocationId,
//         destinationLocationId: testDestinationLocationId,
//       },
//     });
//     expect(response.status()).toBe(200);

//     const after = await getStock(request, readyStockId);
//     expect(after.quantity).toBe(before.quantity - 20);

//     const destinationStock = await findStockByType(
//       request,
//       testItemName,
//       testItemId,
//       testDestinationLocationId,
//       "READY",
//     );
//     expect(destinationStock).toBeDefined();
//     expect(destinationStock.quantity).toBeGreaterThanOrEqual(20);
//   });

//   test("Error: Transfer more than available quantity fails", async ({
//     request,
//   }) => {
//     const before = await getStock(request, readyStockId);

//     const response = await request.post(STOCK_MOVEMENTS_API, {
//       data: {
//         itemId: testItemId,
//         stockId: readyStockId,
//         stockMovementType: "TRANSFER",
//         quantity: before.quantity + 1000,
//         reason: "Transfer exceeding available quantity",
//         sourceLocationId: testSourceLocationId,
//         destinationLocationId: testDestinationLocationId,
//       },
//     });

//     expect(response.status()).toBe(400);

//     const after = await getStock(request, readyStockId);
//     expect(after.quantity).toBe(before.quantity);
//   });

//   // ---------------------------------------------------------------------
//   // ADJUSTMENT
//   // ---------------------------------------------------------------------

//   test("Adjustment with positive quantity increases stock", async ({
//     request,
//   }) => {
//     const before = await getStock(request, readyStockId);

//     const response = await request.post(STOCK_MOVEMENTS_API, {
//       data: {
//         itemId: testItemId,
//         stockId: readyStockId,
//         stockMovementType: "ADJUSTMENT",
//         quantity: 5,
//         reason: "Positive stock count adjustment",
//         sourceLocationId: testSourceLocationId,
//       },
//     });
//     expect(response.status()).toBe(200);

//     const after = await getStock(request, readyStockId);
//     expect(after.quantity).toBe(before.quantity + 5);
//   });

//   test("Adjustment with negative quantity decreases stock", async ({
//     request,
//   }) => {
//     const before = await getStock(request, readyStockId);

//     const response = await request.post(STOCK_MOVEMENTS_API, {
//       data: {
//         itemId: testItemId,
//         stockId: readyStockId,
//         stockMovementType: "ADJUSTMENT",
//         quantity: -5,
//         reason: "Negative stock count adjustment",
//         sourceLocationId: testSourceLocationId,
//       },
//     });
//     expect(response.status()).toBe(200);

//     const after = await getStock(request, readyStockId);
//     expect(after.quantity).toBe(before.quantity - 5);
//   });

//   test("Error: Adjustment below zero is rejected", async ({ request }) => {
//     const before = await getStock(request, readyStockId);

//     const response = await request.post(STOCK_MOVEMENTS_API, {
//       data: {
//         itemId: testItemId,
//         stockId: readyStockId,
//         stockMovementType: "ADJUSTMENT",
//         quantity: -(before.quantity + 100),
//         reason: "Adjustment that would go negative",
//         sourceLocationId: testSourceLocationId,
//       },
//     });

//     expect(response.status()).toBe(400);

//     const after = await getStock(request, readyStockId);
//     expect(after.quantity).toBe(before.quantity);
//   });

//   // ---------------------------------------------------------------------
//   // MARK_AS_* family
//   // ---------------------------------------------------------------------

//   for (const targetType of ["DAMAGED", "DIRTY", "LOST", "EXPIRED"] as const) {
//     test(`MARK_AS_${targetType} decrements source and increments ${targetType} stock`, async ({
//       request,
//     }) => {
//       const before = await getStock(request, readyStockId);

//       const response = await request.post(STOCK_MOVEMENTS_API, {
//         data: {
//           itemId: testItemId,
//           stockId: readyStockId,
//           stockMovementType: `MARK_AS_${targetType}`,
//           quantity: 3,
//           reason: `Mark stock as ${targetType.toLowerCase()} for testing`,
//           sourceLocationId: testSourceLocationId,
//           destinationLocationId: testSourceLocationId,
//         },
//       });
//       expect(response.status()).toBe(200);

//       const after = await getStock(request, readyStockId);
//       expect(after.quantity).toBe(before.quantity - 3);

//       const targetStock = await findStockByType(
//         request,
//         testItemName,
//         testItemId,
//         testSourceLocationId,
//         targetType,
//       );
//       expect(targetStock).toBeDefined();
//       expect(targetStock.quantity).toBeGreaterThanOrEqual(3);
//     });
//   }

//   test(`MARK_AS_DAMAGED called twice accumulates on the same DAMAGED stock row`, async ({
//     request,
//   }) => {
//     const targetBefore = await findStockByType(
//       request,
//       testItemName,
//       testItemId,
//       testSourceLocationId,
//       "DAMAGED",
//     );
//     expect(targetBefore).toBeDefined();

//     await request.post(STOCK_MOVEMENTS_API, {
//       data: {
//         itemId: testItemId,
//         stockId: readyStockId,
//         stockMovementType: "MARK_AS_DAMAGED",
//         quantity: 2,
//         reason: "Second damage mark to test accumulation",
//         sourceLocationId: testSourceLocationId,
//         destinationLocationId: testSourceLocationId,
//       },
//     });

//     const targetAfter = await findStockByType(
//       request,
//       testItemName,
//       testItemId,
//       testSourceLocationId,
//       "DAMAGED",
//     );
//     expect(targetAfter.id).toBe(targetBefore.id);
//     expect(targetAfter.quantity).toBe(targetBefore.quantity + 2);
//   });

//   test("Error: MARK_AS_DAMAGED beyond available quantity is rejected", async ({
//     request,
//   }) => {
//     const before = await getStock(request, readyStockId);

//     const response = await request.post(STOCK_MOVEMENTS_API, {
//       data: {
//         itemId: testItemId,
//         stockId: readyStockId,
//         stockMovementType: "MARK_AS_DAMAGED",
//         quantity: before.quantity + 500,
//         reason: "Damage mark exceeding available quantity",
//         sourceLocationId: testSourceLocationId,
//         destinationLocationId: testSourceLocationId,
//       },
//     });

//     expect(response.status()).toBe(400);

//     const after = await getStock(request, readyStockId);
//     expect(after.quantity).toBe(before.quantity);
//   });

//   // ---------------------------------------------------------------------
//   // CONSUME / SALE
//   // ---------------------------------------------------------------------

//   test("CONSUME decrements stock and does not create a destination stock", async ({
//     request,
//   }) => {
//     const before = await getStock(request, readyStockId);

//     const response = await request.post(STOCK_MOVEMENTS_API, {
//       data: {
//         itemId: testItemId,
//         stockId: readyStockId,
//         stockMovementType: "CONSUME",
//         quantity: 4,
//         reason: "Internal consumption test",
//         sourceLocationId: testSourceLocationId,
//       },
//     });
//     expect(response.status()).toBe(200);

//     const after = await getStock(request, readyStockId);
//     expect(after.quantity).toBe(before.quantity - 4);
//   });

//   test("SALE decrements stock", async ({ request }) => {
//     const before = await getStock(request, readyStockId);

//     const response = await request.post(STOCK_MOVEMENTS_API, {
//       data: {
//         itemId: testItemId,
//         stockId: readyStockId,
//         stockMovementType: "SALE",
//         quantity: 4,
//         totalCost: 40000,
//         reason: "Point of sale test",
//         sourceLocationId: testSourceLocationId,
//       },
//     });
//     expect(response.status()).toBe(200);

//     const after = await getStock(request, readyStockId);
//     expect(after.quantity).toBe(before.quantity - 4);
//   });

//   // ---------------------------------------------------------------------
//   // LAUNDRY_OUT / DISCARD via generic create() — only valid from DAMAGED/DIRTY
//   // ---------------------------------------------------------------------

//   test("Error: DISCARD via create() rejected when source stock is READY", async ({
//     request,
//   }) => {
//     const response = await request.post(STOCK_MOVEMENTS_API, {
//       data: {
//         itemId: testItemId,
//         stockId: readyStockId,
//         stockMovementType: "DISCARD",
//         quantity: 1,
//         totalCost: 1000,
//         reason: "Attempt to discard directly from READY stock",
//         sourceLocationId: testSourceLocationId,
//       },
//     });

//     // No branch matches (currentStock.type is READY, not DAMAGED/DIRTY),
//     // so `movement` stays undefined and the service raises badRequest.
//     expect(response.status()).toBe(400);
//   });

//   test("LAUNDRY_OUT via create() succeeds from a DIRTY stock", async ({
//     request,
//   }) => {
//     const dirtyStock = await findStockByType(
//       request,
//       testItemName,
//       testItemId,
//       testSourceLocationId,
//       "DIRTY",
//     );
//     expect(dirtyStock).toBeDefined();
//     const before = dirtyStock.quantity;

//     const response = await request.post(STOCK_MOVEMENTS_API, {
//       data: {
//         itemId: testItemId,
//         stockId: dirtyStock.id,
//         stockMovementType: "LAUNDRY_OUT",
//         quantity: 1,
//         reason: "Send dirty stock out for laundry",
//         sourceLocationId: testSourceLocationId,
//       },
//     });
//     expect(response.status()).toBe(200);

//     const after = await getStock(request, dirtyStock.id);
//     expect(after.quantity).toBe(before - 1);
//   });

//   // ---------------------------------------------------------------------
//   // quickDiscard
//   // ---------------------------------------------------------------------

//   test("quickDiscard moves quantity from READY into the target discard stock", async ({
//     request,
//   }) => {
//     const before = await getStock(request, readyStockId);

//     const response = await request.post(QUICK_DISCARD_API, {
//       data: {
//         stockId: readyStockId,
//         quantity: 3,
//         totalCost: 5000,
//         discardAs: "EXPIRED",
//         reason: "Quick discard directly from ready stock",
//       },
//     });

//     const body = await response.json();
//     expect(response.status()).toBe(200);
//     expect(body.message).toContain("Stock discarded successfully");

//     const after = await getStock(request, readyStockId);
//     expect(after.quantity).toBe(before.quantity - 3);

//     const expiredStock = await findStockByType(
//       request,
//       testItemName,
//       testItemId,
//       testSourceLocationId,
//       "EXPIRED",
//     );
//     expect(expiredStock).toBeDefined();
//     // This assertion is the one that catches the original bug: the
//     // destination stock's quantity must actually reflect the discard.
//     expect(expiredStock.quantity).toBeGreaterThanOrEqual(3);
//   });

//   test("quickDiscard accumulates onto an existing destination stock row instead of creating a duplicate", async ({
//     request,
//   }) => {
//     const targetBefore = await findStockByType(
//       request,
//       testItemName,
//       testItemId,
//       testSourceLocationId,
//       "EXPIRED",
//     );
//     expect(targetBefore).toBeDefined();

//     await request.post(QUICK_DISCARD_API, {
//       data: {
//         stockId: readyStockId,
//         quantity: 2,
//         totalCost: 3000,
//         discardAs: "EXPIRED",
//         reason: "Second quick discard to test accumulation",
//       },
//     });

//     const targetAfter = await findStockByType(
//       request,
//       testItemName,
//       testItemId,
//       testSourceLocationId,
//       "EXPIRED",
//     );
//     expect(targetAfter.id).toBe(targetBefore.id);
//     expect(targetAfter.quantity).toBe(targetBefore.quantity + 2);
//   });

//   test("Error: quickDiscard beyond available quantity is rejected", async ({
//     request,
//   }) => {
//     const before = await getStock(request, readyStockId);

//     const response = await request.post(QUICK_DISCARD_API, {
//       data: {
//         stockId: readyStockId,
//         quantity: before.quantity + 1000,
//         totalCost: 1000,
//         discardAs: "LOST",
//         reason: "Quick discard exceeding available quantity",
//       },
//     });

//     expect(response.status()).toBe(400);

//     const after = await getStock(request, readyStockId);
//     expect(after.quantity).toBe(before.quantity);
//   });

//   test("Error: quickDiscard with missing stockId returns 400", async ({
//     request,
//   }) => {
//     const response = await request.post(QUICK_DISCARD_API, {
//       data: {
//         quantity: 1,
//         totalCost: 1000,
//         discardAs: "LOST",
//         reason: "Missing stock id on purpose",
//       },
//     });

//     expect(response.status()).toBe(400);
//   });

//   // ---------------------------------------------------------------------
//   // quickLaundryOut
//   // ---------------------------------------------------------------------

//   test("quickLaundryOut moves quantity from READY into DIRTY", async ({
//     request,
//   }) => {
//     const before = await getStock(request, readyStockId);

//     const response = await request.post(QUICK_LAUNDRY_OUT_API, {
//       data: {
//         stockId: readyStockId,
//         quantity: 5,
//         totalCost: 0,
//         reason: "Quick laundry out from ready stock",
//       },
//     });

//     const body = await response.json();
//     expect(response.status()).toBe(200);
//     expect(body.message).toContain("Stock got laundry out successfully");

//     const after = await getStock(request, readyStockId);
//     expect(after.quantity).toBe(before.quantity - 5);

//     const dirtyStock = await findStockByType(
//       request,
//       testItemName,
//       testItemId,
//       testSourceLocationId,
//       "DIRTY",
//     );
//     expect(dirtyStock).toBeDefined();
//     expect(dirtyStock.quantity).toBeGreaterThanOrEqual(5);
//   });

//   test("Error: quickLaundryOut rejected when source stock type is not READY or DAMAGED", async ({
//     request,
//   }) => {
//     const dirtyStock = await findStockByType(
//       request,
//       testItemName,
//       testItemId,
//       testSourceLocationId,
//       "DIRTY",
//     );
//     expect(dirtyStock).toBeDefined();

//     const response = await request.post(QUICK_LAUNDRY_OUT_API, {
//       data: {
//         stockId: dirtyStock.id,
//         quantity: 1,
//         totalCost: 0,
//         reason: "Attempt laundry out from an already-dirty stock",
//       },
//     });

//     expect(response.status()).toBe(400);
//   });

//   test("Error: quickLaundryOut beyond available quantity is rejected", async ({
//     request,
//   }) => {
//     const before = await getStock(request, readyStockId);

//     const response = await request.post(QUICK_LAUNDRY_OUT_API, {
//       data: {
//         stockId: readyStockId,
//         quantity: before.quantity + 1000,
//         totalCost: 0,
//         reason: "Quick laundry out exceeding available quantity",
//       },
//     });

//     expect(response.status()).toBe(400);

//     const after = await getStock(request, readyStockId);
//     expect(after.quantity).toBe(before.quantity);
//   });

//   // ---------------------------------------------------------------------
//   // Existing validation error cases
//   // ---------------------------------------------------------------------

//   test("Error: Create stock movement with invalid item", async ({
//     request,
//   }) => {
//     const response = await request.post(STOCK_MOVEMENTS_API, {
//       data: {
//         itemId: "non-existent-item-id",
//         stockMovementType: "RECEIVE",
//         quantity: 25,
//         totalCost: 750000,
//         reason: "Invalid item movement test",
//         destinationLocationId: testDestinationLocationId,
//       },
//     });
//     expect(response.status()).toBe(404);
//   });

//   test("Error: Create stock movement with invalid destination location", async ({
//     request,
//   }) => {
//     const response = await request.post(STOCK_MOVEMENTS_API, {
//       data: {
//         itemId: testItemId,
//         stockMovementType: "RECEIVE",
//         quantity: 25,
//         totalCost: 750000,
//         reason: "Invalid location movement test",
//         destinationLocationId: "non-existent-location-id",
//       },
//     });
//     expect(response.status()).toBe(404);
//   });

//   test("Error: Create stock movement with zero quantity", async ({
//     request,
//   }) => {
//     const response = await request.post(STOCK_MOVEMENTS_API, {
//       data: {
//         itemId: testItemId,
//         stockMovementType: "RECEIVE",
//         quantity: 0,
//         totalCost: 750000,
//         reason: "Zero quantity movement test",
//         destinationLocationId: testDestinationLocationId,
//       },
//     });
//     expect(response.status()).toBe(400);
//   });

//   test("Error: Create stock movement with short reason", async ({
//     request,
//   }) => {
//     const response = await request.post(STOCK_MOVEMENTS_API, {
//       data: {
//         itemId: testItemId,
//         stockMovementType: "RECEIVE",
//         quantity: 25,
//         totalCost: 750000,
//         reason: "short",
//         destinationLocationId: testDestinationLocationId,
//       },
//     });
//     expect(response.status()).toBe(400);
//   });

//   test("Error: Update non-existent stock movement", async ({ request }) => {
//     const response = await request.patch(
//       "/api/stock-movements/non-existent-stock-movement-id-12345",
//       { data: { reason: "Valid reason for missing stock movement" } },
//     );
//     expect(response.status()).toBe(404);
//   });

//   // ---------------------------------------------------------------------
//   // Cleanup
//   // ---------------------------------------------------------------------

//   test("Cleanup: Delete leftover test data", async ({ browser }) => {
//     const context = await browser.newContext({
//       storageState: "playwright/.auth/manager.json",
//     });
//     const request = context.request;

//     const itemList = await request.get(
//       "http://localhost:3000/api/items?page=1&dataPerPage=100&sortBy=name&orderBy=asc",
//     );
//     const itemBody = await itemList.json();
//     const items: { id: string; name: string }[] = itemBody.data?.items ?? [];

//     for (const item of items) {
//       if (item.name.startsWith(TEST_PREFIX)) {
//         await request.patch("http://localhost:3000/api/items", {
//           data: {
//             itemId: item.id,
//             name: item.name,
//             isActive: false,
//             description: "Cleanup",
//           },
//         });
//         await request.delete(`http://localhost:3000/api/items/${item.id}`);
//       }
//     }

//     const categoryList = await request.get(
//       "http://localhost:3000/api/categories?sortOrder=asc&sortBy=name&page=1&dataPerPage=100",
//     );
//     const categoryBody = await categoryList.json();
//     const categories: { id: string; name: string }[] =
//       categoryBody.data?.categories ?? [];

//     for (const category of categories) {
//       if (category.name.startsWith(TEST_PREFIX)) {
//         await request.delete(
//           `http://localhost:3000/api/categories/${category.id}`,
//         );
//       }
//     }

//     await context.close();
//   });
// });
