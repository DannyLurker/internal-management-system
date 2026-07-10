import categoryService from "@/features/categories/category.service";
import categoryRepository from "@/features/categories/category.repository";
import categoryRules from "@/features/categories/category.rule";
import auditLogsRepository from "@/features/audit-logs/audit-log.repository";
import { badRequest } from "@/shared/lib/error-handlers";
import { PrismaClient } from "@prisma/client";
import { Session } from "next-auth";
import { mockDeep, mockReset } from "jest-mock-extended";

jest.mock("@/features/categories/category.repository");
jest.mock("@/features/categories/category.rule");
jest.mock("@/features/audit-logs/audit-log.repository");

const mockedCategoryRepository = categoryRepository as jest.Mocked<
  typeof categoryRepository
>;
const mockedCategoryRules = categoryRules as jest.Mocked<
  typeof categoryRules
>;
const mockedAuditLogsRepository = auditLogsRepository as jest.Mocked<
  typeof auditLogsRepository
>;

const fakeSession = { id: "user-1", role: "HOTEL_MANAGER" } as Session["user"];
const prismaMock = mockDeep<PrismaClient>();

describe("categoryService.delete", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReset(prismaMock);
  });

  it("throws badRequest error when the category is not found", async () => {
    prismaMock.$transaction.mockImplementation((callback) => callback(prismaMock));
    prismaMock.category.findUnique.mockResolvedValue(null);

    await expect(
      categoryService.delete(fakeSession, "cat-missing", prismaMock),
    ).rejects.toEqual(badRequest("Category not found"));

    expect(mockedCategoryRepository.delete).not.toHaveBeenCalled();
    expect(mockedAuditLogsRepository.create).not.toHaveBeenCalled();
  });

  it("throws badRequest error if deletion is not allowed by categoryRules", async () => {
    prismaMock.$transaction.mockImplementation((callback) => callback(prismaMock));
    prismaMock.category.findUnique.mockResolvedValue({
      name: "Beverages",
      items: [{ id: "item-1" }],
    } as any);

    mockedCategoryRules.canDeleteCategory.mockReturnValue({
      allowed: false,
      reason: "Item was found in this category. Migrate all the items before deleting.",
    });

    await expect(
      categoryService.delete(fakeSession, "cat-1", prismaMock),
    ).rejects.toEqual(badRequest("Item was found in this category. Migrate all the items before deleting."));

    expect(mockedCategoryRules.canDeleteCategory).toHaveBeenCalledWith({
      items: [{ id: "item-1" }],
    });
    expect(mockedCategoryRepository.delete).not.toHaveBeenCalled();
    expect(mockedAuditLogsRepository.create).not.toHaveBeenCalled();
  });

  it("successfully deletes the category and logs a delete audit log when allowed", async () => {
    prismaMock.$transaction.mockImplementation((callback) => callback(prismaMock));
    prismaMock.category.findUnique.mockResolvedValue({
      name: "Beverages",
      items: [],
    } as any);

    mockedCategoryRules.canDeleteCategory.mockReturnValue({
      allowed: true,
    });
    mockedCategoryRepository.delete.mockResolvedValue({
      id: "cat-1",
      name: "Beverages",
    } as any);

    const result = await categoryService.delete(fakeSession, "cat-1", prismaMock);

    expect(mockedCategoryRepository.delete).toHaveBeenCalledWith("cat-1", prismaMock);
    expect(mockedAuditLogsRepository.create).toHaveBeenCalledWith(
      {
        action: "DELETE",
        entity: "CATEGORY",
        entityId: "cat-1",
        metadata: {
          id: "cat-1",
          name: "Beverages",
        },
        userId: "user-1",
      },
      prismaMock,
    );
    expect(result).toEqual({
      message: "Beverages category was succesfully deleted",
      id: "cat-1",
    });
  });
});
