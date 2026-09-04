import auditLogsRepository from "@/features/audit-logs/audit-log.repository";
import itemRepository from "@/features/items/item.repository";
import { locationRepository } from "@/features/locations/location.repository";
import { stockRequestRepository } from "@/features/stock-requests/stock-request.repository";
import stockRequestService from "@/features/stock-requests/stock-request.service";
import { stockRepository } from "@/features/stocks/stock.repository";
import { StockRequestCreateSchema } from "@/shared/lib/zods/stock-request.zod";
import { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset } from "jest-mock-extended";
import { Session } from "next-auth";

jest.mock("@/features/stock-requests/stock-request.repository");
jest.mock("@/features/stock-requests/stock-request.service");
jest.mock("@/features/locations/location.repository");
jest.mock("@/features/items/item.repository");
jest.mock("@/features/stocks/stock.repository");
jest.mock("@/features/audit-logs/audit-log.repository");

const mockedStockRequestRepository = stockRequestRepository as jest.Mocked<
  typeof stockRequestRepository
>;

const mockedStockRequestService = stockRequestService as jest.Mocked<
  typeof stockRequestService
>;

const mockedLocationRepository = locationRepository as jest.Mocked<
  typeof locationRepository
>;

const mockedItemRepository = itemRepository as jest.Mocked<
  typeof itemRepository
>;

const mockedStockRepository = stockRepository as jest.Mocked<
  typeof stockRepository
>;

const mockedAuditLogRepository = auditLogsRepository as jest.Mocked<
  typeof auditLogsRepository
>;

const managerFakeSession = {
  id: "user-1",
  role: "HOTEL_MANAGER",
} as Session["user"];

const housekeepingFakeSession = {
  id: "user-2",
  role: "HOUSEKEEPING",
} as Session["user"];

const prismaMock = mockDeep<PrismaClient>();

describe("stockService.create", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReset(prismaMock);
    prismaMock.$transaction.mockImplementation((callback) =>
      callback(prismaMock),
    );
  });

  it("Create a new stock request and stock request log", async () => {
    mockedItemRepository.findById.mockResolvedValue({
      id: "itemId-1",
    } as any);

    mockedStockRepository.findById.mockResolvedValue({
      id: "stock-1",
      locationId: "loc-1",
    } as any);

    mockedLocationRepository.findById.mockResolvedValue({
      id: "loc-2",
    } as any);

    mockedStockRequestService.create.mockResolvedValue({
      id: "stock-request-1",
    } as any);

    const payload: StockRequestCreateSchema = {
      itemId: "itemId-1",
      destinationLocationId: "loc-2",
      stockId: "stock-1",
      quantity: 10,
      reason: "mock request stock",
      requestType: "ISSUE",
    };

    const stockRequest = mockedStockRequestService.create(
      housekeepingFakeSession,
      payload,
      prismaMock,
    );

    expect(mockedAuditLogRepository.create).toHaveBeenCalledWith(
      {
        entity: "STOCK_REQUEST",
        action: "CREATE",
        entityId: "stock-1",
        metadata: {
          itemId: "itemId-1",
          quantity: 10,
          sourceLocationId: "loc-1",
          destinationLocationId: "loc-2",
          requestType: "ISSUE",
          reason: "mock request stock",
        },
        userId: housekeepingFakeSession.id,
      },
      prismaMock,
    );

    expect(stockRequest).toEqual({
      message: "Stock request created successfully",
      id: "stock-request-1",
    });
  });
});
