import stockMovementsService from "@/features/stock-movements/stock-movements.service";

test("Should return stock movement data", async () => {
  const stockMovements = await stockMovementsService.getMany({});

  expect(Array.isArray(stockMovements.data.movements)).toBe(true);
});
