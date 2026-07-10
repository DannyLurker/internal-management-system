import categoryService from "@/features/categories/category.service";
import categoryRepository from "@/features/categories/category.repository";
import auditLogsRepository from "@/features/audit-logs/audit-log.repository";
import { PrismaClient } from "@prisma/client";
import { Session } from "next-auth";
import { mockDeep, mockReset } from "jest-mock-extended";

jest.mock("@/features/categories/category.repository");
jest.mock("@/features/audit-logs/audit-log.repository");

const mockedCategoryRepository = categoryRepository as jest.Mocked<
  typeof categoryRepository
>;
const mockedAuditLogsRepository = auditLogsRepository as jest.Mocked<
  typeof auditLogsRepository
>;

const fakeSession = { id: "user-1", role: "HOTEL_MANAGER" } as Session["user"];
const prismaMock = mockDeep<PrismaClient>();

describe("categoryService.update", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReset(prismaMock);
  });

  it("successfully updates the category and creates an update audit log with old and new names", async () => {
    prismaMock.$transaction.mockImplementation((callback) => callback(prismaMock));
    prismaMock.category.findUnique.mockResolvedValue({
      id: "cat-1",
      name: "Beverages",
    } as any);

    mockedCategoryRepository.update.mockResolvedValue({
      id: "cat-1",
      name: "Cold Drinks",
    } as any);

    const result = await categoryService.update(
      fakeSession,
      "cat-1",
      { name: "Cold Drinks" },
      prismaMock,
    );

    expect(prismaMock.category.findUnique).toHaveBeenCalledWith({
      where: { id: "cat-1" },
    });

    expect(mockedCategoryRepository.update).toHaveBeenCalledWith(
      { id: "cat-1", name: "Cold Drinks" },
      prismaMock,
    );

    expect(mockedAuditLogsRepository.create).toHaveBeenCalledWith(
      {
        action: "UPDATE",
        entity: "CATEGORY",
        entityId: "cat-1",
        metadata: {
          id: "cat-1",
          oldName: "Beverages",
          newName: "Cold Drinks",
        },
        userId: "user-1",
      },
      prismaMock,
    );

    expect(result).toEqual({
      message: "Succesfully updated into Cold Drinks",
      id: "cat-1",
    });
  });

  it("handles case where the category to update does not exist previously", async () => {
    prismaMock.$transaction.mockImplementation((callback) => callback(prismaMock));
    prismaMock.category.findUnique.mockResolvedValue(null);

    mockedCategoryRepository.update.mockResolvedValue({
      id: "cat-1",
      name: "Cold Drinks",
    } as any);

    const result = await categoryService.update(
      fakeSession,
      "cat-1",
      { name: "Cold Drinks" },
      prismaMock,
    );

    expect(mockedAuditLogsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: {
          id: "cat-1",
          oldName: undefined,
          newName: "Cold Drinks",
        },
      }),
      prismaMock,
    );

    expect(result).toEqual({
      message: "Succesfully updated into Cold Drinks",
      id: "cat-1",
    });
  });
});
