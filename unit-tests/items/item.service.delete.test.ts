import itemService from "@/features/items/item.service";
import itemRepository from "@/features/items/item.repository";
import auditLogsRepository from "@/features/audit-logs/audit-log.repository";
import { badRequest } from "@/shared/lib/error-handlers";
import { PrismaClient } from "@prisma/client";
import { Session } from "next-auth";
import { mockDeep, mockReset } from "jest-mock-extended";

jest.mock("@/features/items/item.repository");
jest.mock("@/features/audit-logs/audit-log.repository");

const mockedItemRepository = itemRepository as jest.Mocked<typeof itemRepository>;
const mockedAuditLogsRepository = auditLogsRepository as jest.Mocked<typeof auditLogsRepository>;

const fakeSession = { id: "user-1", role: "HOTEL_MANAGER" } as Session["user"];
const prismaMock = mockDeep<PrismaClient>();

describe("itemService.delete", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReset(prismaMock);
  });

  it("throws badRequest error when the item is active", async () => {
    prismaMock.$transaction.mockImplementation((callback) => callback(prismaMock));

    mockedItemRepository.findById.mockResolvedValue({
      id: "item-1",
      name: "Active Item",
      isActive: true,
    } as any);

    await expect(
      itemService.delete(fakeSession, "item-1", prismaMock),
    ).rejects.toEqual(
      badRequest("You cannot delete an active item. Please deactivate it first."),
    );

    expect(mockedItemRepository.findById).toHaveBeenCalledWith(
      "item-1",
      prismaMock,
    );

    expect(mockedItemRepository.delete).not.toHaveBeenCalled();
    expect(mockedAuditLogsRepository.create).not.toHaveBeenCalled();
  });

  it("successfully deletes the item and logs a delete audit log when the item is inactive", async () => {
    prismaMock.$transaction.mockImplementation((callback) => callback(prismaMock));

    mockedItemRepository.findById.mockResolvedValue({
      id: "item-1",
      name: "Inactive Item",
      isActive: false,
    } as any);

    mockedItemRepository.delete.mockResolvedValue({
      id: "item-1",
      name: "Inactive Item",
    } as any);

    const result = await itemService.delete(fakeSession, "item-1", prismaMock);

    expect(mockedItemRepository.delete).toHaveBeenCalledWith("item-1", prismaMock);

    expect(mockedAuditLogsRepository.create).toHaveBeenCalledWith(
      {
        userId: "user-1",
        action: "DELETE",
        entity: "ITEM",
        entityId: "item-1",
        metadata: {
          name: "Inactive Item",
        },
      },
      prismaMock,
    );

    expect(result).toEqual({
      message: "Inactive Item deleted successfully",
      id: "item-1",
    });
  });
});
