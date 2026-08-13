import itemService from "@/features/items/item.service";
import itemRepository from "@/features/items/item.repository";
import { stockRepository } from "@/features/stocks/stock.repository";
import stockMovementsRepository from "@/features/stock-movements/stock-movements.repository";
import { PrismaClient } from "@prisma/client";
import { Session } from "next-auth";
import { mockDeep, mockReset } from "jest-mock-extended";

jest.mock("@/features/items/item.repository", () => {
  const actual = jest.requireActual("@/features/items/item.repository");
  const autoMocked = jest.createMockFromModule(
    "@/features/items/item.repository",
  ) as typeof actual;
  return {
    ...autoMocked,
    createSelectItemData: actual.createSelectItemData,
    createIncludeItemData: actual.createIncludeItemData,
  };
});
jest.mock("@/features/stocks/stock.repository");
jest.mock("@/features/stock-movements/stock-movements.repository");

const mockedItemRepository = itemRepository as jest.Mocked<
  typeof itemRepository
>;
const mockedStockRepository = stockRepository as jest.Mocked<
  typeof stockRepository
>;
const mockedStockMovementsRepository = stockMovementsRepository as jest.Mocked<
  typeof stockMovementsRepository
>;

const fakeSession = { id: "user-1", role: "HOTEL_MANAGER" } as Session["user"];
const prismaMock = mockDeep<PrismaClient>();

describe("itemService.getById", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReset(prismaMock);
  });

  it("retrieves the item and calculates all correct stock aggregates, including low stock", async () => {
    const itemMock = {
      id: "item-1",
      name: "Chocolate Cake",
      minThreshold: 5,
      stocks: [{ id: "stock-1", quantity: 4 }],
    };

    mockedStockRepository.buildStockWhereClause.mockReturnValue({
      itemId: "item-1",
    });

    mockedItemRepository.getById.mockResolvedValue(itemMock as any);
    mockedStockRepository.countRows.mockResolvedValue(1);

    mockedStockRepository.getGroupedStockQuantities.mockResolvedValue([
      { type: "READY", _sum: { quantity: 4 } },
      { type: "EXPIRED", _sum: { quantity: 2 } },
      { type: "DAMAGED", _sum: { quantity: 1 } },
      { type: "LOST", _sum: { quantity: 3 } },
      { type: "DIRTY", _sum: { quantity: 2 } },
    ] as any);

    mockedStockRepository.countRows.mockResolvedValue(4);
    mockedStockRepository.aggregate.mockResolvedValue({ quantity: 4, totalCost: 100 } as any);

    mockedStockMovementsRepository.countQuantity.mockImplementation(
      async (where) => {
        if ("stockId" in where && where.stockId === null) {
          return 2; // unlocated
        }
        if ("type" in where && where.type === "DISCARD") {
          return 1; // discarded
        }
        return 0;
      },
    );

    const params = {
      itemStockPage: 1,
      itemStocksPerpage: 10,
      sortBy: "createdAt" as const,
      orderBy: "asc" as const,
      status: "ALL" as const,
    };

    const result = await itemService.getById(
      fakeSession,
      "item-1",
      params,
      prismaMock,
    );

    expect(mockedStockRepository.buildStockWhereClause).toHaveBeenCalledWith(
      null,
      {
        sortBy: "createdAt",
        stockStatusType: "ALL",
      },
    );

    expect(mockedItemRepository.getById).toHaveBeenCalledWith(
      "item-1",
      expect.any(Object),
      expect.any(Object),
      expect.any(Object),
      0,
      10,
      "createdAt",
      "asc",
      prismaMock,
    );

    // Assert correct aggregations
    // totalLocatedItems = sum of non-LOST = 4 (READY) + 2 (EXPIRED) + 1 (DAMAGED) + 2 (DIRTY) = 9
    expect(result.data.totalLocatedItemQuantity).toBe(9);
    expect(result.data.totalUnlocatedItemQuantity).toBe(2);
    expect(result.data.totalDiscardedItems).toBe(1);
    expect(result.data.totalReadyStock).toBe(4);
    expect(result.data.totalExpiredStock).toBe(2);
    expect(result.data.totalDamagedStock).toBe(1);
    expect(result.data.totalLostStock).toBe(3);
    expect(result.data.totalDirtyStock).toBe(2);
    expect(result.data.itemStockCount).toBe(4);

    // Since minThreshold is 5 and totalReadyStock is 4, isStockLow should be "Low in stock"
    expect(result.data.item.isStockLow).toBe("Low in stock");
  });

  it("sets isStockLow to '-' if totalReadyStock is greater than minThreshold", async () => {
    const itemMock = {
      id: "item-2",
      name: "Vanilla Cake",
      minThreshold: 5,
      stocks: [],
    };

    mockedStockRepository.buildStockWhereClause.mockReturnValue({
      itemId: "item-2",
    });

    mockedItemRepository.getById.mockResolvedValue(itemMock as any);
    mockedStockRepository.countRows.mockResolvedValue(0);
    mockedStockRepository.getGroupedStockQuantities.mockResolvedValue([]);
    mockedStockRepository.countRows.mockResolvedValue(10); // ready stock = 10 > minThreshold 5
    mockedStockRepository.aggregate.mockResolvedValue({ quantity: 10, totalCost: 0 } as any);
    mockedStockMovementsRepository.countQuantity.mockResolvedValue(0);

    const params = {
      itemStockPage: 1,
      itemStocksPerpage: 10,
      sortBy: "createdAt" as const,
      orderBy: "asc" as const,
      status: "ALL" as const,
    };

    const result = await itemService.getById(
      fakeSession,
      "item-2",
      params,
      prismaMock,
    );

    expect(result.data.item.isStockLow).toBe("-");
  });
});
