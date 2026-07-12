import itemService from "@/features/items/item.service";
import itemRepository from "@/features/items/item.repository";
import auditLogsRepository from "@/features/audit-logs/audit-log.repository";
import { PrismaClient } from "@prisma/client";
import { Session } from "next-auth";
import { mockDeep, mockReset } from "jest-mock-extended";

jest.mock("@/features/items/item.repository");
jest.mock("@/features/audit-logs/audit-log.repository");

const mockedItemRepository = itemRepository as jest.Mocked<
  typeof itemRepository
>;
const mockedAuditLogsRepository = auditLogsRepository as jest.Mocked<
  typeof auditLogsRepository
>;

const fakeSession = { id: "user-1", role: "HOTEL_MANAGER" } as Session["user"];
const prismaMock = mockDeep<PrismaClient>();

describe("itemService.create", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReset(prismaMock);
  });

  it("creates the item and writes a CREATE audit log with the right metadata", async () => {
    prismaMock.$transaction.mockImplementation((callback) =>
      callback(prismaMock),
    );

    mockedItemRepository.create.mockResolvedValue({
      id: "item-1",
      name: "Mock Item",
      description: "A description",
      categoryId: "cat-1",
      sellingPrice: 15000,
      attributes: {},
      createdAt: new Date(),
      createdBy: "user-1",
      image: null,
      isActive: true,
      minThreshold: 10,
      updatedAt: new Date(),
      updatedBy: "user-1",
    });

    const inputData = {
      name: "Mock Item",
      description: "A description",
      categoryId: "cat-1",
      locationId: "loc-1",
      sellingPrice: 15000,
      stock: {
        quantity: 10,
        totalCost: 100000,
        reason: "Initial stock",
      },
      minThreshold: 10,
      attributes: {},
    };

    const result = await itemService.create(fakeSession, inputData, prismaMock);

    expect(mockedItemRepository.create).toHaveBeenCalledWith(
      "user-1",
      inputData,
      prismaMock,
    );

    expect(mockedAuditLogsRepository.create).toHaveBeenCalledWith(
      {
        userId: "user-1",
        action: "CREATE",
        entity: "ITEM",
        entityId: "item-1",
        metadata: {
          name: "Mock Item",
          categoryId: "cat-1",
          locationId: "loc-1",
          sellingPrice: 15000,
          initialStock: 10,
        },
      },
      prismaMock,
    );

    expect(result).toEqual({
      message: "Mock Item created successfully",
      id: "item-1",
    });
  });

  it("uses 0 for initialStock if data.stock is undefined", async () => {
    prismaMock.$transaction.mockImplementation((callback) =>
      callback(prismaMock),
    );

    mockedItemRepository.create.mockResolvedValue({
      id: "item-1",
      name: "Mock Item",
      description: "A description",
      categoryId: "cat-1",
      sellingPrice: 15000,
      attributes: {},
      createdAt: new Date(),
      createdBy: "user-1",
      image: null,
      isActive: true,
      minThreshold: 0,
      updatedAt: new Date(),
      updatedBy: "user-1",
    } as any);

    const inputData = {
      name: "Mock Item",
      description: "A description",
      categoryId: "cat-1",
      locationId: "loc-1",
      sellingPrice: 15000,
      minThreshold: 10,
      attributes: {},
    };

    const result = await itemService.create(fakeSession, inputData, prismaMock);

    expect(mockedAuditLogsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          initialStock: 0,
        }),
      }),
      prismaMock,
    );

    expect(result).toEqual({
      message: "Mock Item created successfully",
      id: "item-1",
    });
  });

  it("does not write an audit log if repository create throws an error", async () => {
    prismaMock.$transaction.mockImplementation((callback) =>
      callback(prismaMock),
    );
    mockedItemRepository.create.mockRejectedValue(
      new Error("Database write failed"),
    );

    const inputData = {
      name: "Mock Item",
      description: "A description",
      categoryId: "cat-1",
      locationId: "loc-1",
      attributes: {},
    };

    await expect(
      itemService.create(fakeSession, inputData, prismaMock),
    ).rejects.toThrow("Database write failed");

    expect(mockedAuditLogsRepository.create).not.toHaveBeenCalled();
  });
});
