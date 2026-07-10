import categoryService from "@/features/categories/category.service";
import categoryRepository from "@/features/categories/category.repository";
import { PrismaClient } from "@prisma/client";
import { Session } from "next-auth";
import { CategoryGetManySchema } from "@/shared/lib/zods/category.zod";
import { mockDeep, mockReset } from "jest-mock-extended";

jest.mock("@/features/categories/category.repository");

const mockedCategoryRepository = categoryRepository as jest.Mocked<
  typeof categoryRepository
>;

const fakeSession = { id: "user-1", role: "HOTEL_MANAGER" } as Session["user"];
const prismaMock = mockDeep<PrismaClient>();

const baseParams: CategoryGetManySchema = {
  page: 1,
  dataPerPage: 10,
  sortBy: "name",
  sortOrder: "asc",
  search: "",
};

describe("categoryService.getMany", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReset(prismaMock);
    mockedCategoryRepository.buildWhereClause.mockReturnValue({});
  });

  it("returns list of categories with formatted totalItems count and the total rows count", async () => {
    mockedCategoryRepository.getMany.mockResolvedValue([
      {
        id: "cat-1",
        name: "Beverages",
        _count: {
          items: 3,
        },
      },
      {
        id: "cat-2",
        name: "Rooms",
        _count: {
          items: 0,
        },
      },
    ] as any);
    mockedCategoryRepository.countCategoryRows.mockResolvedValue(2);

    const result = await categoryService.getMany(
      fakeSession,
      baseParams,
      prismaMock,
    );

    expect(mockedCategoryRepository.getMany).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        _count: {
          select: {
            items: true,
          },
        },
      }),
      "name",
      "asc",
      0,
      10,
      prismaMock,
    );
    expect(mockedCategoryRepository.countCategoryRows).toHaveBeenCalledWith(
      {},
      prismaMock,
    );
    expect(result).toEqual({
      message: "Category data retrieved Successfully.",
      categories: {
        categories: [
          {
            id: "cat-1",
            name: "Beverages",
            _count: {
              items: 3,
            },
            totalItems: 3,
          },
          {
            id: "cat-2",
            name: "Rooms",
            _count: {
              items: 0,
            },
            totalItems: 0,
          },
        ],
        totalCategoryData: 2,
      },
    });
  });

  it("applies search query parameter to buildWhereClause", async () => {
    mockedCategoryRepository.getMany.mockResolvedValue([]);
    mockedCategoryRepository.countCategoryRows.mockResolvedValue(0);

    await categoryService.getMany(
      fakeSession,
      { ...baseParams, search: "bev" },
      prismaMock,
    );

    expect(mockedCategoryRepository.buildWhereClause).toHaveBeenCalledWith("bev");
  });
});
