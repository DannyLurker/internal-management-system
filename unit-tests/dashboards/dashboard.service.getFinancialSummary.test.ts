import dashboardService from "@/features/dashboards/dashboard.service";
import stockMovementsRepository from "@/features/stock-movements/stock-movements.repository";
import {
  stockRepository,
  stockWhereInput,
} from "@/features/stocks/stock.repository";

import { FinancialSummaryParamSchema } from "@/shared/lib/zods/dashboard.zod";
import { PrismaClient } from "@prisma/client";
import { Session } from "next-auth";
import { mockDeep, mockReset } from "jest-mock-extended";
import { resolveDateRange } from "@/features/dashboards/components/sub-components/DateFilterDropdown";
import { laundryRepository } from "@/features/laundry/laundry.repository";

const dateRange = resolveDateRange("last7");
const startDate = dateRange.startDate.toISOString();
const endDate = dateRange.endDate.toISOString();

jest.mock("@/features/stock-movements/stock-movements.repository", () => {
  const actual = jest.requireActual(
    "@/features/stock-movements/stock-movements.repository",
  );
  const autoMocked = jest.createMockFromModule(
    "@/features/stock-movements/stock-movements.repository",
  ) as typeof actual;
  return {
    ...autoMocked,
    createStockMovementWhereInput: actual.createStockMovementWhereInput,
  };
});

jest.mock("@/features/stocks/stock.repository", () => {
  const actual = jest.requireActual("@/features/stocks/stock.repository");
  const autoMocked = jest.createMockFromModule(
    "@/features/stocks/stock.repository",
  ) as typeof actual;
  return {
    ...autoMocked,
    stockWhereInput: actual.stockWhereInput,
    stockSelectData: actual.stockSelectData,
  };
});

jest.mock("@/features/laundry/laundry.repository", () => {
  const actual = jest.requireActual("@/features/laundry/laundry.repository");
  const autoMocked = jest.createMockFromModule(
    "@/features/laundry/laundry.repository",
  ) as typeof actual;
  return {
    ...autoMocked,
    createLaundryWhereInput: actual.createLaundryWhereInput,
  };
});

const mockedStockMovementsRepository = stockMovementsRepository as jest.Mocked<
  typeof stockMovementsRepository
>;
const mockedStockRepository = stockRepository as jest.Mocked<
  typeof stockRepository
>;
const mockedLaundryRepository = laundryRepository as jest.Mocked<
  typeof laundryRepository
>;

const fakeSession = { id: "user-1", role: "HOTEL_MANAGER" } as Session["user"];
const prismaMock = mockDeep<PrismaClient>();

describe("dashboardService.getFinancialSummary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReset(prismaMock);
  });

  it("retrieves financial summary without date range filters using default pagination", async () => {
    const expiredStockMock = [
      {
        id: "stock-exp-1",
        quantity: 5,
        expiredAt: new Date("2026-08-01"),
        item: { name: "Milk" },
        location: { name: "Fridge" },
      },
    ];

    const lowStocksMock = [
      {
        id: "item-1",
        name: "Soap",
        minThreshold: 10,
        isActive: true,
        currentStock: 3,
      },
    ];

    mockedStockMovementsRepository.calculateInventoryValue
      .mockResolvedValueOnce(1500) // totalSpend
      .mockResolvedValueOnce(200) // totalStockWastageValue
      .mockResolvedValueOnce(800) // totalConsume
      .mockResolvedValueOnce(1200); // totalSale

    mockedStockRepository.totalInventoryValue.mockResolvedValue(5000);
    mockedLaundryRepository.aggregate.mockResolvedValue(50);
    mockedStockRepository.findMany.mockResolvedValue(expiredStockMock as any);
    mockedStockRepository.countRows.mockResolvedValue(1);
    mockedStockRepository.getLowStocks.mockResolvedValue(lowStocksMock as any);
    mockedStockRepository.getTotalLowStocks.mockResolvedValue([
      { count: BigInt(1) },
    ]);

    const params: FinancialSummaryParamSchema = {
      flaggedExpiredStockPage: 1,
      flaggedExpiredStockDataPerPage: 10,
      lowStockAlertPage: 1,
      lowStockAlertDataPerPage: 10,
      startDate: undefined as any,
      endDate: undefined as any,
    };

    const result = await dashboardService.getFinancialSummary(
      fakeSession,
      params,
      prismaMock,
    );

    // Verify stockMovementsRepository calculateInventoryValue calls
    expect(
      mockedStockMovementsRepository.calculateInventoryValue,
    ).toHaveBeenNthCalledWith(
      1,
      {
        OR: [{ type: "RECEIVE" }, { type: "ADJUSTMENT", totalCost: { gt: 0 } }],
      },
      prismaMock,
    );

    expect(
      mockedStockMovementsRepository.calculateInventoryValue,
    ).toHaveBeenNthCalledWith(
      2,
      {
        OR: [
          {
            type: {
              in: [
                "DISCARD",
                "MARK_AS_DAMAGED",
                "MARK_AS_EXPIRED",
                "MARK_AS_LOST",
              ],
            },
          },
          { type: "ADJUSTMENT", totalCost: { lt: 0 } },
        ],
      },
      prismaMock,
    );

    expect(
      mockedStockMovementsRepository.calculateInventoryValue,
    ).toHaveBeenNthCalledWith(
      3,
      {
        type: "CONSUME",
      },
      prismaMock,
    );

    expect(
      mockedStockMovementsRepository.calculateInventoryValue,
    ).toHaveBeenNthCalledWith(
      4,
      {
        type: "SALE",
      },
      prismaMock,
    );

    // Verify stockRepository totalInventoryValue call
    expect(mockedStockRepository.totalInventoryValue).toHaveBeenCalledWith(
      {
        type: "READY",
        OR: [
          { expiredAt: { gte: expect.any(Date) } },
          { expiredAt: { equals: null } },
        ],
        quantity: { gte: 0 },
      },
      prismaMock,
    );

    // Verify laundryRepository aggregate call
    expect(mockedLaundryRepository.aggregate).toHaveBeenCalledWith(
      {
        status: "SENT",
      },
      prismaMock,
    );

    // Verify stockRepository findMany call for flagged expired stocks
    expect(mockedStockRepository.findMany).toHaveBeenCalledWith(
      {
        type: "READY",
        expiredAt: { lte: expect.any(Date) },
        quantity: { not: 0 },
      },
      {
        id: true,
        item: { select: { name: true } },
        location: { select: { name: true } },
        expiredAt: true,
        quantity: true,
      },
      {
        orderBy: { expiredAt: "asc" },
        skip: 0,
        take: 10,
      },
      prismaMock,
    );

    // Verify stockRepository countRows call
    expect(mockedStockRepository.countRows).toHaveBeenCalledWith(
      {
        type: "READY",
        expiredAt: { lte: expect.any(Date) },
        quantity: { not: 0 },
      },
      prismaMock,
    );

    // Verify getLowStocks and getTotalLowStocks calls
    expect(mockedStockRepository.getLowStocks).toHaveBeenCalledWith(
      10,
      0,
      prismaMock,
    );
    expect(mockedStockRepository.getTotalLowStocks).toHaveBeenCalledWith(
      prismaMock,
    );

    expect(stockWhereInput);

    // Verify return result structure
    expect(result).toEqual({
      message: "Manager dashboard data retrieved successfully",
      data: {
        totalSpend: 1500,
        totalInventoryValue: 5000,
        totalStockWastageValue: 200,
        totalLaundryOutStock: 50,
        totalConsume: 800,
        totalSale: 1200,
        lowStockData: lowStocksMock,
        totalLowStockCount: 1,
        flaggedExpiredStocks: {
          flaggedExpiredStockData: expiredStockMock,
          totalExpiredCount: 1,
        },
      },
    });
  });

  it("applies date range filter when startDate and endDate are provided", async () => {
    mockedStockMovementsRepository.calculateInventoryValue.mockResolvedValue(0);
    mockedStockRepository.totalInventoryValue.mockResolvedValue(0);
    mockedLaundryRepository.aggregate.mockResolvedValue(0);
    mockedStockRepository.findMany.mockResolvedValue([]);
    mockedStockRepository.countRows.mockResolvedValue(0);
    mockedStockRepository.getLowStocks.mockResolvedValue([]);
    mockedStockRepository.getTotalLowStocks.mockResolvedValue([
      { count: BigInt(0) },
    ]);

    const params: FinancialSummaryParamSchema = {
      startDate,
      endDate,
      flaggedExpiredStockPage: 1,
      flaggedExpiredStockDataPerPage: 10,
      lowStockAlertPage: 1,
      lowStockAlertDataPerPage: 10,
    };

    await dashboardService.getFinancialSummary(fakeSession, params, prismaMock);

    const expectedDateRange = {
      createdAt: {
        gte: new Date(startDate),
        lt: new Date(endDate),
      },
    };

    expect(
      mockedStockMovementsRepository.calculateInventoryValue,
    ).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining(expectedDateRange),
      prismaMock,
    );

    expect(
      mockedStockMovementsRepository.calculateInventoryValue,
    ).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining(expectedDateRange),
      prismaMock,
    );

    expect(
      mockedStockMovementsRepository.calculateInventoryValue,
    ).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining(expectedDateRange),
      prismaMock,
    );

    expect(
      mockedStockMovementsRepository.calculateInventoryValue,
    ).toHaveBeenNthCalledWith(
      4,
      expect.objectContaining(expectedDateRange),
      prismaMock,
    );

    expect(mockedLaundryRepository.aggregate).toHaveBeenCalledWith(
      expect.objectContaining(expectedDateRange),
      prismaMock,
    );
  });

  it("calculates pagination offset and limit correctly for flagged expired stocks and low stock alerts", async () => {
    mockedStockMovementsRepository.calculateInventoryValue.mockResolvedValue(0);
    mockedStockRepository.totalInventoryValue.mockResolvedValue(0);
    mockedLaundryRepository.aggregate.mockResolvedValue(0);
    mockedStockRepository.findMany.mockResolvedValue([]);
    mockedStockRepository.countRows.mockResolvedValue(0);
    mockedStockRepository.getLowStocks.mockResolvedValue([]);
    mockedStockRepository.getTotalLowStocks.mockResolvedValue([
      { count: BigInt(0) },
    ]);

    const params: FinancialSummaryParamSchema = {
      flaggedExpiredStockPage: 3,
      flaggedExpiredStockDataPerPage: 5,
      lowStockAlertPage: 2,
      lowStockAlertDataPerPage: 20,
      startDate,
      endDate,
    };

    await dashboardService.getFinancialSummary(fakeSession, params, prismaMock);

    expect(mockedStockRepository.findMany).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
      {
        orderBy: { expiredAt: "asc" },
        skip: 20, // (3 - 1) * 10
        take: 5,
      },
      prismaMock,
    );

    expect(mockedStockRepository.getLowStocks).toHaveBeenCalledWith(
      20,
      20,
      prismaMock,
    );
  });

  it("handles null values and empty aggregates gracefully", async () => {
    mockedStockMovementsRepository.calculateInventoryValue.mockResolvedValue(
      null,
    );
    mockedStockRepository.totalInventoryValue.mockResolvedValue(0);
    mockedLaundryRepository.aggregate.mockResolvedValue(null);
    mockedStockRepository.findMany.mockResolvedValue([]);
    mockedStockRepository.countRows.mockResolvedValue(0);
    mockedStockRepository.getLowStocks.mockResolvedValue([]);
    mockedStockRepository.getTotalLowStocks.mockResolvedValue([
      { count: BigInt(0) },
    ]);

    const params: FinancialSummaryParamSchema = {
      flaggedExpiredStockPage: 1,
      flaggedExpiredStockDataPerPage: 10,
      lowStockAlertPage: 1,
      lowStockAlertDataPerPage: 10,
      startDate,
      endDate,
    };

    const result = await dashboardService.getFinancialSummary(
      fakeSession,
      params,
      prismaMock,
    );

    expect(result).toEqual({
      message: "Manager dashboard data retrieved successfully",
      data: {
        totalSpend: null,
        totalInventoryValue: 0,
        totalStockWastageValue: null,
        totalLaundryOutStock: null,
        totalConsume: null,
        totalSale: null,
        lowStockData: [],
        totalLowStockCount: 0,
        flaggedExpiredStocks: {
          flaggedExpiredStockData: [],
          totalExpiredCount: 0,
        },
      },
    });
  });
});
