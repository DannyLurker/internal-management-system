// Environment setup for push notification dependencies
process.env.VAPID_SUBJECT = "mailto:admin@example.com";
process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY =
  "BODfHCuNmOf40o7PBsBT-1nmZCtGO9bPBWNnufOq-7IJyZPBzEDaP0dZu2SDSUTZFpqGmH3z9jJwMv_LExT_2Os";
process.env.VAPID_PRIVATE_KEY = "dlcAeEogpKe7pTE9s5xKU8nlGPaje55UDimXMKog60A";

import auditLogsRepository from "@/features/audit-logs/audit-log.repository";
import itemRepository from "@/features/items/item.repository";
import { locationRepository } from "@/features/locations/location.repository";
import { stockRequestRepository } from "@/features/stock-requests/stock-request.repository";
import stockRequestService from "@/features/stock-requests/stock-request.service";
import { stockRepository } from "@/features/stocks/stock.repository";
import { sendPushToUser } from "@/shared/lib/push";
import { StockRequestCreateSchema } from "@/shared/lib/zods/stock-request.zod";
import { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset } from "jest-mock-extended";
import { Session } from "next-auth";

// Mocking external dependencies only (do NOT mock stockRequestService)
jest.mock("@/features/stock-requests/stock-request.repository");
jest.mock("@/features/locations/location.repository");
jest.mock("@/features/items/item.repository");
jest.mock("@/features/stocks/stock.repository");
jest.mock("@/features/audit-logs/audit-log.repository");
jest.mock("@/shared/lib/push");

const mockedStockRequestRepository = stockRequestRepository as jest.Mocked<
  typeof stockRequestRepository
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

const mockedSendPushToUser = sendPushToUser as jest.MockedFunction<
  typeof sendPushToUser
>;

// Test mock fixtures
const housekeepingFakeSession = {
  name: "Housekeeper John",
  id: "user-2",
  role: "HOUSEKEEPING",
} as Session["user"];

const prismaMock = mockDeep<PrismaClient>();

describe("stockRequestService.create", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReset(prismaMock);

    // Mock Prisma transaction execution to execute callback directly
    prismaMock.$transaction.mockImplementation(async (callback: any) =>
      callback(prismaMock),
    );
  });

  it("should successfully create a stock request, record an audit log, and send push notifications", async () => {
    // 1. Setup repository mock responses
    mockedItemRepository.findById.mockResolvedValue({
      id: "itemId-1",
      name: "Towel",
    } as any);

    mockedStockRepository.findById.mockResolvedValue({
      id: "stock-1",
      locationId: "loc-1",
    } as any);

    mockedLocationRepository.findById.mockResolvedValue({
      id: "loc-2",
      name: "Floor 2 Locker",
    } as any);

    mockedStockRequestRepository.create.mockResolvedValue({
      id: "stock-request-1",
      itemId: "itemId-1",
      requestedQuantity: 10,
      sourceLocationId: "loc-1",
      destinationLocationId: "loc-2",
      type: "ISSUE",
      reason: "mock request stock",
    } as any);

    mockedAuditLogRepository.create.mockResolvedValue({ id: "audit-1" } as any);
    mockedSendPushToUser.mockResolvedValue();

    // 2. Define test input payload
    const payload: StockRequestCreateSchema = {
      itemId: "itemId-1",
      destinationLocationId: "loc-2",
      stockId: "stock-1",
      quantity: 10,
      reason: "Restocking housekeeping cart",
      requestType: "ISSUE",
    };

    // 3. Execute the service method under test
    const result = await stockRequestService.create(
      housekeepingFakeSession,
      payload,
      prismaMock,
    );

    // 4. Verify audit log creation
    expect(mockedAuditLogRepository.create).toHaveBeenCalledWith(
      {
        entity: "STOCK_REQUEST",
        action: "CREATE",
        entityId: "stock-request-1",
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

    // 5. Verify notification targeting managers
    expect(mockedSendPushToUser).toHaveBeenCalledWith(
      null,
      ["HOTEL_MANAGER", "SUPERVISOR"],
      {
        title: "New Stock Request",
        body: `${housekeepingFakeSession.name} has submitted a new stock request.`,
        url: process.env.NEXT_PUBLIC_BASE_URL + "/stock-requests",
      },
    );

    // 6. Verify final service output
    expect(result).toEqual({
      message: "Stock request created successfully",
      data: {
        id: "stock-request-1",
      },
    });
  });
});
