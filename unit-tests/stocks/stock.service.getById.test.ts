import stockService from "@/features/stocks/stock.service";
import {
  stockRepository,
  stockSelectData,
  stockWhereUniqueInput,
} from "@/features/stocks/stock.repository";
import { notFound } from "@/shared/lib/error-handlers";
import { PrismaClient } from "@prisma/client";
import { Session } from "next-auth";
import { mockDeep, mockReset } from "jest-mock-extended";

jest.mock("@/features/stocks/stock.repository");

const mockedStockRepository = stockRepository as jest.Mocked<
  typeof stockRepository
>;

const mockedStockWhereUniqueInput =
  stockWhereUniqueInput as jest.MockedFunction<typeof stockWhereUniqueInput>;

const mockedSelectDataStock = stockSelectData as jest.MockedFunction<
  typeof stockSelectData
>;

const fakeSession = { id: "user-1", role: "HOTEL_MANAGER" } as Session["user"];
const prismaMock = mockDeep<PrismaClient>();

describe("stockService.getById", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReset(prismaMock);
  });

  it("returns the stock with the correct message when it exists", async () => {
    const stockMock = {
      id: "stock-1",
      quantity: 10,
      type: "READY",
      expiredAt: null,
      itemId: "item-1",
      locationId: "loc-1",
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-02"),
      item: { id: "item-1", name: "Chocolate Cake" },
      location: { id: "loc-1", name: "Pantry A" },
      creator: { id: "user-1", name: "Alice" },
    };

    mockedStockRepository.get.mockResolvedValue(stockMock as any);

    mockedStockWhereUniqueInput.mockReturnValue({ id: "stock-1" });

    mockedSelectDataStock.mockReturnValue({
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

    const result = await stockService.getById(
      fakeSession,
      "stock-1",
      prismaMock,
    );

    expect(mockedStockRepository.get).toHaveBeenCalledWith(
      { id: "stock-1" },
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
      prismaMock,
    );

    expect(result).toEqual({
      message: "Stock retrieved successfully",
      data: stockMock,
    });
  });

  it("throws notFound when stock does not exist", async () => {
    mockedStockRepository.get.mockResolvedValue(null);

    await expect(
      stockService.getById(fakeSession, "nonexistent-stock", prismaMock),
    ).rejects.toEqual(notFound("Stock not found"));
  });
});
