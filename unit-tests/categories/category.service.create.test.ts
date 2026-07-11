import auditLogsRepository from "@/features/audit-logs/audit-log.repository";
import categoryRepository from "@/features/categories/category.repository";
import categoryService from "@/features/categories/category.service";
import { internalServerError } from "@/shared/lib/error-handlers";

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
const date = new Date();

const prismaMock = mockDeep<PrismaClient>();

describe("categoryService.create", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReset(prismaMock);
  });

  it("creates the category and writes a CREATE audit log with the right metadata", async () => {
    mockedCategoryRepository.create.mockResolvedValue({
      id: "category-new-1",
      name: "CategoryNew1",
      createdAt: date,
      updatedAt: date,
      createdBy: fakeSession.id,
      updatedBy: fakeSession.id,
    });

    prismaMock.$transaction.mockImplementation((callback) =>
      callback(prismaMock),
    );

    const result = await categoryService.create(
      fakeSession,
      {
        name: "CategoryNew1",
      },
      prismaMock,
    );

    expect(mockedCategoryRepository.create).toHaveBeenCalledWith(
      {
        createdBy: "user-1",
        name: "CategoryNew1",
      },
      prismaMock,
    );

    expect(mockedAuditLogsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: fakeSession.id,
        action: "CREATE",
        entity: "CATEGORY",
        entityId: "category-new-1",
        metadata: expect.objectContaining({
          id: "category-new-1",
          name: "CategoryNew1",
        }),
      }),
      prismaMock,
    );

    expect(result).toEqual({
      message: "CategoryNew1 category was successfully created",
      id: "category-new-1",
    });
  });

  it("does not write an audit log if the repository create call fails", async () => {
    mockedCategoryRepository.create.mockRejectedValue(internalServerError());
    prismaMock.$transaction.mockImplementation((callback) =>
      callback(prismaMock),
    );

    await expect(
      categoryService.create(fakeSession, { name: "CategoryNew1" }, prismaMock),
    ).rejects.toThrow("Something went wrong. Try it again later");

    expect(mockedAuditLogsRepository.create).not.toHaveBeenCalled();
  });
});
