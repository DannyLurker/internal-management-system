import stockService from "@/features/stocks/stock.service";
import {
  stockRepository,
  stockSelectData,
} from "@/features/stocks/stock.repository";
import { PrismaClient } from "@prisma/client";
import { Session } from "next-auth";
import { mockDeep, mockReset } from "jest-mock-extended";

jest.mock("@/features/stocks/stock.repository");

const mockedStockRepository = stockRepository as jest.Mocked<
  typeof stockRepository
>;

const mockedStockSelectData = stockSelectData as jest.MockedFunction<
  typeof stockSelectData
>;

const fakeSession = { id: "user-1", role: "HOTEL_MANAGER" } as Session["user"];
const prismaMock = mockDeep<PrismaClient>();

describe("stockService.getMany", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReset(prismaMock);
  });

  it("retrieves a paginated list of stocks with correct parameters", async () => {
    const stocksMock = [
      {
        id: "stock-1",
        quantity: 10,
        type: "READY",
        expiredAt: null,
        itemId: "item-1",
        locationId: "loc-1",
        createdAt: new Date(),
        updatedAt: new Date(),
        item: { id: "item-1", name: "Cake" },
        location: { id: "loc-1", name: "Pantry" },
        creator: { id: "user-1", name: "Alice" },
      },
    ];

    mockedStockRepository.getMany.mockResolvedValue(stocksMock as any);
    mockedStockSelectData.mockReturnValue({
      id: true,
      quantity: true,
      type: true,
      expiredAt: true,
      itemId: true,
      locationId: true,
      createdAt: true,
      updatedAt: true,
      item: {
        select: {
          id: true,
          name: true,
        },
      },
      location: {
        select: {
          id: true,
          name: true,
        },
      },
      creator: {
        select: {
          id: true,
          name: true,
        },
      },
    });
    prismaMock.stock.count.mockResolvedValue(5);

    const params = {
      page: 2,
      dataPerPage: 1,
      sortBy: "createdAt" as const,
      sortOrder: "asc" as const,
    };

    const result = await stockService.getMany(fakeSession, params, prismaMock);

    expect(mockedStockRepository.getMany).toHaveBeenCalledWith(
      {}, // no filters applied
      {
        id: true,
        quantity: true,
        type: true,
        expiredAt: true,
        itemId: true,
        locationId: true,
        createdAt: true,
        updatedAt: true,
        item: {
          select: {
            id: true,
            name: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      1, // skip = (page 2 - 1) * 1 = 1
      1, // take = 1
      "asc",
      "createdAt",
      prismaMock,
    );

    expect(prismaMock.stock.count).toHaveBeenCalledWith({ where: {} });

    expect(result).toEqual({
      message: "Stocks retrieved successfully",
      data: { stocks: stocksMock, totalCount: 5 },
    });
  });

  it("applies searchQuery filter on item name and location name", async () => {
    mockedStockRepository.getMany.mockResolvedValue([]);
    prismaMock.stock.count.mockResolvedValue(0);

    const params = {
      page: 1,
      dataPerPage: 10,
      sortBy: "createdAt" as const,
      sortOrder: "desc" as const,
      searchQuery: "Pantry",
    };

    await stockService.getMany(fakeSession, params, prismaMock);

    expect(mockedStockRepository.getMany).toHaveBeenCalledWith(
      expect.objectContaining({
        OR: [
          { item: { name: { contains: "Pantry", mode: "insensitive" } } },
          { location: { name: { contains: "Pantry", mode: "insensitive" } } },
        ],
      }),
      expect.any(Object),
      0,
      10,
      "desc",
      "createdAt",
      prismaMock,
    );
  });

  it("applies type filter only when sortBy is stockType", async () => {
    mockedStockRepository.getMany.mockResolvedValue([]);
    prismaMock.stock.count.mockResolvedValue(0);

    const params = {
      page: 1,
      dataPerPage: 10,
      sortBy: "stockType" as const,
      sortOrder: "asc" as const,
      type: "DAMAGED" as const,
    };

    await stockService.getMany(fakeSession, params, prismaMock);

    expect(mockedStockRepository.getMany).toHaveBeenCalledWith(
      expect.objectContaining({ type: "DAMAGED" }),
      expect.any(Object),
      0,
      10,
      "asc",
      "stockType",
      prismaMock,
    );
  });

  it("does not apply type filter when sortBy is not stockType", async () => {
    mockedStockRepository.getMany.mockResolvedValue([]);
    prismaMock.stock.count.mockResolvedValue(0);

    const params = {
      page: 1,
      dataPerPage: 10,
      sortBy: "createdAt" as const,
      sortOrder: "asc" as const,
      type: "DAMAGED" as const,
    };

    await stockService.getMany(fakeSession, params, prismaMock);

    const callArgs = mockedStockRepository.getMany.mock.calls[0][0];
    expect(callArgs).not.toHaveProperty("type");
  });

  it("applies locationId and itemId filters when provided", async () => {
    mockedStockRepository.getMany.mockResolvedValue([]);
    prismaMock.stock.count.mockResolvedValue(0);

    const params = {
      page: 1,
      dataPerPage: 10,
      sortBy: "createdAt" as const,
      sortOrder: "asc" as const,
      locationId: "loc-99",
      itemId: "item-99",
    };

    await stockService.getMany(fakeSession, params, prismaMock);

    expect(mockedStockRepository.getMany).toHaveBeenCalledWith(
      expect.objectContaining({ locationId: "loc-99", itemId: "item-99" }),
      expect.any(Object),
      0,
      10,
      "asc",
      "createdAt",
      prismaMock,
    );
  });
});
