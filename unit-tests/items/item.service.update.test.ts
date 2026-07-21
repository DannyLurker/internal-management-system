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

describe("itemService.update", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReset(prismaMock);
  });

  it("updates the item and writes an UPDATE audit log with the right metadata", async () => {
    prismaMock.$transaction.mockImplementation((callback) =>
      callback(prismaMock),
    );

    const updatedItemMock = {
      id: "item-1",
      name: "Updated Item",
      categoryId: "cat-2",
      sellingPrice: 18000,
      costPrice: 7000,
    };

    mockedItemRepository.update.mockResolvedValue(updatedItemMock as any);

    const updateData = {
      name: "Updated Item",
      description: "Updated description",
      categoryId: "cat-2",
      sellingPrice: 18000,
      costPrice: 7000,
      isActive: true,
      attributes: {},
    };

    const result = await itemService.update(
      fakeSession,
      "item-1",
      updateData,
      prismaMock,
    );

    expect(mockedItemRepository.update).toHaveBeenCalledWith(
      "user-1",
      "item-1",
      updateData,
      prismaMock,
    );

    expect(mockedAuditLogsRepository.create).toHaveBeenCalledWith(
      {
        userId: "user-1",
        action: "UPDATE",
        entity: "ITEM",
        entityId: "item-1",
        metadata: {
          name: "Updated Item",
          categoryId: "cat-2",
          sellingPrice: 18000,
          costPrice: 7000,
        },
      },
      prismaMock,
    );

    expect(result).toEqual({
      message: "Updated Item updated successfully",
      id: "item-1",
    });
  });

  it("does not write an audit log if repository update throws an error", async () => {
    prismaMock.$transaction.mockImplementation((callback) =>
      callback(prismaMock),
    );
    mockedItemRepository.update.mockRejectedValue(
      new Error("Database update failed"),
    );

    const updateData = {
      name: "Updated Item",
      description: "Updated description",
      costPrice: 7000,
      isActive: true,
      attributes: {},
    };

    await expect(
      itemService.update(fakeSession, "item-1", updateData, prismaMock),
    ).rejects.toThrow("Database update failed");

    expect(mockedAuditLogsRepository.create).not.toHaveBeenCalled();
  });
});
