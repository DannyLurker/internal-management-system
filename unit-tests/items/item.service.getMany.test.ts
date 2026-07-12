import itemService from "@/features/items/item.service";
import itemRepository, {
  createIncludeItemData,
} from "@/features/items/item.repository";
import { PrismaClient } from "@prisma/client";
import { Session } from "next-auth";
import { mockDeep, mockReset } from "jest-mock-extended";

jest.mock("@/features/items/item.repository");

const mockedItemRepository = itemRepository as jest.Mocked<
  typeof itemRepository
>;
const mockedCreateIncludeItemData =
  createIncludeItemData as jest.MockedFunction<typeof createIncludeItemData>;
const fakeSession = { id: "user-1", role: "HOTEL_MANAGER" } as Session["user"];
const prismaMock = mockDeep<PrismaClient>();

describe("itemService.getMany", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReset(prismaMock);
  });

  it("retrieves a paginated list of items with the correct parameters", async () => {
    const whereClauseMock = { categoryId: "cat-1" };
    mockedItemRepository.buildWhereClause.mockReturnValue(whereClauseMock);

    const itemsMock = [
      { id: "item-1", name: "Item One", categoryId: "cat-1" },
      { id: "item-2", name: "Item Two", categoryId: "cat-1" },
    ];
    mockedItemRepository.getManyInclude.mockResolvedValue(itemsMock as any);
    mockedItemRepository.countItems.mockResolvedValue(5);
    mockedCreateIncludeItemData.mockReturnValue({
      category: { select: { id: true, name: true } },
    });

    const params = {
      page: 2,
      dataPerPage: 2,
      findBy: "category" as const,
      categoryId: "cat-1",
      search: "test",
      sortBy: "name" as const,
      orderBy: "asc" as const,
    };

    const result = await itemService.getMany(fakeSession, params, prismaMock);

    expect(mockedItemRepository.buildWhereClause).toHaveBeenCalledWith(
      "category",
      "cat-1",
      "test",
    );

    expect(mockedItemRepository.getManyInclude).toHaveBeenCalledWith(
      whereClauseMock,
      { category: { select: { id: true, name: true } } },
      2, // skip = (page 2 - 1) * 2 = 2
      2, // take = 2
      "name",
      "asc",
      prismaMock,
    );

    expect(mockedItemRepository.countItems).toHaveBeenCalledWith(
      whereClauseMock,
      prismaMock,
    );

    expect(result).toEqual({
      message: "Item data retrieved successfully",
      data: {
        items: itemsMock,
        totalItems: 5,
      },
    });
  });

  it("handles null findBy and categoryId params gracefully", async () => {
    const whereClauseMock = {};
    mockedItemRepository.buildWhereClause.mockReturnValue(whereClauseMock);
    mockedItemRepository.getManyInclude.mockResolvedValue([]);
    mockedItemRepository.countItems.mockResolvedValue(0);

    const params = {
      page: 1,
      dataPerPage: 10,
      sortBy: "createdAt" as const,
      orderBy: "desc" as const,
    };

    const result = await itemService.getMany(fakeSession, params, prismaMock);

    expect(mockedItemRepository.buildWhereClause).toHaveBeenCalledWith(
      null,
      null,
      undefined,
    );

    expect(result).toEqual({
      message: "Item data retrieved successfully",
      data: {
        items: [],
        totalItems: 0,
      },
    });
  });
});
