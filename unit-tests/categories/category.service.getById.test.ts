import categoryService from "@/features/categories/category.service";
import categoryRepository from "@/features/categories/category.repository";
import itemRepository from "@/features/items/item.repository";
import { notFound } from "@/shared/lib/error-handlers";
import { PrismaClient } from "@prisma/client";
import { Session } from "next-auth";
import { CategoryGetByIdSchema } from "@/shared/lib/zods/category.zod";
import { mockDeep, mockReset } from "jest-mock-extended";

jest.mock("@/features/categories/category.repository");
jest.mock("@/features/items/item.repository");

const mockedCategoryRepository = categoryRepository as jest.Mocked<
  typeof categoryRepository
>;
const mockedItemRepository = itemRepository as jest.Mocked<
  typeof itemRepository
>;

const fakeSession = { id: "user-1", role: "HOTEL_MANAGER" } as Session["user"];
const prismaMock = mockDeep<PrismaClient>();

const baseParams: CategoryGetByIdSchema = {
  page: 1,
  dataPerPage: 10,
  sortBy: "name",
  sortOrder: "asc",
  search: "",
};

describe("categoryService.getById", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReset(prismaMock);
    mockedItemRepository.buildWhereClause.mockReturnValue({});
  });

  it("throws notFound error when the category does not exist", async () => {
    mockedCategoryRepository.getById.mockResolvedValue(null);

    await expect(
      categoryService.getById(
        fakeSession,
        "cat-missing",
        baseParams,
        prismaMock,
      ),
    ).rejects.toEqual(notFound("Category not found"));

    expect(mockedItemRepository.countItems).not.toHaveBeenCalled();
  });

  it("returns category with totalItems as 0 if the category has no items", async () => {
    mockedCategoryRepository.getById.mockResolvedValue({
      id: "cat-1",
      name: "Beverages",
      items: [],
    } as any);

    const result = await categoryService.getById(
      fakeSession,
      "cat-1",
      baseParams,
      prismaMock,
    );

    expect(mockedCategoryRepository.getById).toHaveBeenCalledWith(
      "cat-1",
      expect.anything(),
      expect.anything(),
      expect.anything(),
      "name",
      "asc",
      0,
      10,
      prismaMock,
    );
    expect(mockedItemRepository.countItems).not.toHaveBeenCalled();
    expect(result).toEqual({
      message: "Category retrieved successfully",
      category: {
        id: "cat-1",
        name: "Beverages",
        items: [],
        totalItems: 0,
      },
    });
  });

  it("returns category with totalItems count if the category has items", async () => {
    mockedCategoryRepository.getById.mockResolvedValue({
      id: "cat-1",
      name: "Beverages",
      _count: {
        items: 1,
        userCreatedBy: 1,
        userUpdatedBy: 1,
      },
      items: [
        {
          id: "item-1",
          name: "Coke",
          categoryId: "cat-1",
          attributes: [],
          description: "Soft drink",
          image: null,
          sellingPrice: 15000,
          minThreshold: 10,
          createdBy: "user-1",
          createdAt: new Date(),
          updatedBy: "user-1",
          updatedAt: new Date(),
        },
      ],
    } as any);
    mockedItemRepository.countItems.mockResolvedValue(5);

    const result = await categoryService.getById(
      fakeSession,
      "cat-1",
      baseParams,
      prismaMock,
    );

    expect(mockedItemRepository.countItems).toHaveBeenCalledWith(
      { id: "item-1" },
      prismaMock,
    );
    expect(result).toEqual({
      message: "Category retrieved successfully",
      category: {
        id: "cat-1",
        name: "Beverages",
        _count: { items: 1, userCreatedBy: 1, userUpdatedBy: 1 },
        items: [
          {
            id: "item-1",
            name: "Coke",
            categoryId: "cat-1",
            attributes: [],
            description: "Soft drink",
            image: null,
            sellingPrice: 15000,
            minThreshold: 10,
            createdBy: "user-1",
            createdAt: expect.any(Date), // 💡 Menggunakan ini agar tes tidak sensitif milidetik
            updatedBy: "user-1",
            updatedAt: expect.any(Date), // 💡 Menggunakan ini agar tes tidak sensitif milidetik
          },
        ],
        totalItems: 5,
      },
    });
  });

  it("passes search query parameter to buildWhereClause", async () => {
    mockedCategoryRepository.getById.mockResolvedValue({
      id: "cat-1",
      name: "Beverages",
      items: [],
    } as any);

    await categoryService.getById(
      fakeSession,
      "cat-1",
      { ...baseParams, search: "coke" },
      prismaMock,
    );

    expect(mockedItemRepository.buildWhereClause).toHaveBeenCalledWith(null, null, "coke");
  });
});
