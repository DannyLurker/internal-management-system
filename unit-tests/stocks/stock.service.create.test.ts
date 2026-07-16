import stockService from "@/features/stocks/stock.service";
import { stockRepository } from "@/features/stocks/stock.repository";
import auditLogsRepository from "@/features/audit-logs/audit-log.repository";
import { notFound } from "@/shared/lib/error-handlers";
import { PrismaClient, StockType } from "@prisma/client";
import { Session } from "next-auth";
import { mockDeep, mockReset } from "jest-mock-extended";

jest.mock("@/features/stocks/stock.repository");
jest.mock("@/features/audit-logs/audit-log.repository");

const mockedStockRepository = stockRepository as jest.Mocked<
  typeof stockRepository
>;
const mockedAuditLogsRepository = auditLogsRepository as jest.Mocked<
  typeof auditLogsRepository
>;

const fakeSession = { id: "user-1", role: "HOTEL_MANAGER" } as Session["user"];
const prismaMock = mockDeep<PrismaClient>();

describe("stockService.create", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReset(prismaMock);
  });

  it("creates a new stock entry when no existing stock matches and writes a CREATE audit log", async () => {
    prismaMock.$transaction.mockImplementation((callback) =>
      callback(prismaMock),
    );

    // Item exists
    prismaMock.item.findUnique.mockResolvedValue({ id: "item-1" } as any);
    // No existing stock found
    prismaMock.stock.findFirst.mockResolvedValue(null);
    // Location exists
    prismaMock.location.findUnique.mockResolvedValue({ id: "loc-1" } as any);

    const createdStock = {
      id: "stock-1",
      itemId: "item-1",
      locationId: "loc-1",
      quantity: 10,
      type: "READY",
      expiredAt: null,
    };
    mockedStockRepository.create.mockResolvedValue(createdStock as any);

    const expiredDate = new Date();

    expiredDate.setDate(expiredDate.getDate() + 14);

    const inputData = {
      itemId: "item-1",
      locationId: "loc-1",
      quantity: 10,
      type: "READY" as StockType,
      expiredAt: expiredDate,
      reason: "Initial receive",
      totalCost: 50000,
    };

    const result = await stockService.create(
      fakeSession,
      inputData,
      prismaMock,
    );

    expect(prismaMock.item.findUnique).toHaveBeenCalledWith({
      where: { id: "item-1" },
    });
    expect(prismaMock.location.findUnique).toHaveBeenCalledWith({
      where: { id: "loc-1" },
    });
    expect(mockedStockRepository.create).toHaveBeenCalled();
    expect(mockedStockRepository.update).not.toHaveBeenCalled();

    expect(mockedAuditLogsRepository.create).toHaveBeenCalledWith(
      {
        userId: "user-1",
        action: "CREATE",
        entity: "STOCK",
        entityId: "stock-1",
        metadata: {
          itemId: "item-1",
          locationId: "loc-1",
          quantity: 10,
          type: "READY",
          expiredAt: null,
        },
      },
      prismaMock,
    );

    expect(result).toEqual({
      message: "Stock created successfully",
      id: "stock-1",
    });
  });

  it("increments existing stock quantity when stock with same itemId, locationId, type, and expiredAt already exists", async () => {
    prismaMock.$transaction.mockImplementation((callback) =>
      callback(prismaMock),
    );

    prismaMock.item.findUnique.mockResolvedValue({ id: "item-1" } as any);
    prismaMock.stock.findFirst.mockResolvedValue({
      id: "stock-existing",
      itemId: "item-1",
      locationId: "loc-1",
      quantity: 5,
      type: "READY",
      expiredAt: null,
    } as any);
    prismaMock.location.findUnique.mockResolvedValue({ id: "loc-1" } as any);

    const updatedStock = {
      id: "stock-existing",
      itemId: "item-1",
      locationId: "loc-1",
      quantity: 15,
      type: "READY",
      expiredAt: null,
    };
    mockedStockRepository.update.mockResolvedValue(updatedStock as any);

    const expiredDate = new Date();

    expiredDate.setDate(expiredDate.getDate() + 14);

    const inputData = {
      itemId: "item-1",
      locationId: "loc-1",
      quantity: 10,
      type: "READY" as StockType,
      expiredAt: expiredDate,
      reason: "Restock",
      totalCost: 30000,
    };

    const result = await stockService.create(
      fakeSession,
      inputData,
      prismaMock,
    );

    expect(mockedStockRepository.update).toHaveBeenCalledWith(
      "stock-existing",
      expect.objectContaining({
        quantity: { increment: 10 },
      }),
      prismaMock,
    );
    expect(mockedStockRepository.create).not.toHaveBeenCalled();

    expect(mockedAuditLogsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "CREATE",
        entity: "STOCK",
        entityId: "stock-existing",
      }),
      prismaMock,
    );

    expect(result).toEqual({
      message: "Stock created successfully",
      id: "stock-existing",
    });
  });

  it("throws notFound when item does not exist", async () => {
    prismaMock.$transaction.mockImplementation((callback) =>
      callback(prismaMock),
    );

    prismaMock.item.findUnique.mockResolvedValue(null);

    const expiredDate = new Date();

    expiredDate.setDate(expiredDate.getDate() + 14);

    const inputData = {
      itemId: "nonexistent-item",
      locationId: "loc-1",
      quantity: 5,
      type: "READY" as StockType,
      expiredAt: expiredDate,
      reason: "Test",
      totalCost: 0,
    };

    await expect(
      stockService.create(fakeSession, inputData, prismaMock),
    ).rejects.toEqual(notFound("Item not found"));

    expect(mockedStockRepository.create).not.toHaveBeenCalled();
    expect(mockedAuditLogsRepository.create).not.toHaveBeenCalled();
  });

  it("throws notFound when location does not exist", async () => {
    prismaMock.$transaction.mockImplementation((callback) =>
      callback(prismaMock),
    );

    prismaMock.item.findUnique.mockResolvedValue({ id: "item-1" } as any);
    prismaMock.stock.findFirst.mockResolvedValue(null);
    prismaMock.location.findUnique.mockResolvedValue(null);

    const expiredDate = new Date();

    expiredDate.setDate(expiredDate.getDate() + 14);

    const inputData = {
      itemId: "item-1",
      locationId: "nonexistent-loc",
      quantity: 5,
      type: "READY" as StockType,
      expiredAt: expiredDate,
      reason: "Test",
      totalCost: 0,
    };

    await expect(
      stockService.create(fakeSession, inputData, prismaMock),
    ).rejects.toEqual(notFound("Location not found"));

    expect(mockedStockRepository.create).not.toHaveBeenCalled();
    expect(mockedAuditLogsRepository.create).not.toHaveBeenCalled();
  });

  it("does not write an audit log if the stock repository create throws", async () => {
    prismaMock.$transaction.mockImplementation((callback) =>
      callback(prismaMock),
    );

    prismaMock.item.findUnique.mockResolvedValue({ id: "item-1" } as any);
    prismaMock.stock.findFirst.mockResolvedValue(null);
    prismaMock.location.findUnique.mockResolvedValue({ id: "loc-1" } as any);
    mockedStockRepository.create.mockRejectedValue(
      new Error("Database write failed"),
    );

    const expiredDate = new Date();

    expiredDate.setDate(expiredDate.getDate() + 14);

    const inputData = {
      itemId: "item-1",
      locationId: "loc-1",
      quantity: 10,
      type: "READY" as StockType,
      expiredAt: expiredDate,
      reason: "Test",
      totalCost: 0,
    };

    await expect(
      stockService.create(fakeSession, inputData, prismaMock),
    ).rejects.toThrow("Database write failed");

    expect(mockedAuditLogsRepository.create).not.toHaveBeenCalled();
  });
});
