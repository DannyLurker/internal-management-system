import locationService from "@/features/locations/location.service";
import {
  locationRepository,
  locationSelectData,
} from "@/features/locations/location.repository";
import { stockRepository } from "@/features/stocks/stock.repository";
import { notFound } from "@/shared/lib/error-handlers";
import { PrismaClient } from "@prisma/client";
import { Session } from "next-auth";
import { LocationGetByIdSchema } from "@/shared/lib/zods/location.zod";

jest.mock("@/features/locations/location.repository");
jest.mock("@/features/stocks/stock.repository");

const mockedLocationRepository = locationRepository as jest.Mocked<
  typeof locationRepository
>;
const mockedStockRepository = stockRepository as jest.Mocked<
  typeof stockRepository
>;

const fakeSession = { id: "user-1", role: "HOTEL_MANAGER" } as Session["user"];
const fakePrisma = {} as PrismaClient;

const baseParams = {
  itemPage: 1,
  itemDataPerPage: 10,
  sortBy: "name",
  sortOrder: "asc",
} as LocationGetByIdSchema;

describe("locationService.getById", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // buildLocationWhereClause/buildStockWhereClause equivalents used by
    // getById are exercised for real elsewhere (unit tests) — here we only
    // care that getById wires locationRepository.get + stockRepository
    // together correctly, so we stub the count call to a fixed value.
    mockedStockRepository.buildStockCountWhereClause.mockImplementation(
      (base) => base,
    );
    mockedStockRepository.countQuantity.mockResolvedValue(42);
  });

  it("throws notFound and never calls stockRepository.countQuantity when the location doesn't exist", async () => {
    mockedLocationRepository.get.mockResolvedValue(null);

    await expect(
      locationService.getById(
        fakeSession,
        "loc-missing",
        baseParams,
        fakePrisma,
      ),
    ).rejects.toEqual(notFound("Location not found"));

    expect(mockedStockRepository.countQuantity).not.toHaveBeenCalled();
  });

  it("returns the location together with the total stock count", async () => {
    mockedLocationRepository.get.mockResolvedValue({
      id: "loc-1",
      name: "Main Warehouse",
      stocks: [{ item: { name: "Towel" }, quantity: 10, type: "READY" }],
    });

    (locationSelectData as jest.Mock).mockReturnValue({});

    const result = await locationService.getById(
      fakeSession,
      "loc-1",
      baseParams,
      fakePrisma,
    );

    expect(mockedLocationRepository.get).toHaveBeenCalledWith(
      { id: "loc-1" },
      expect.anything(),
      fakePrisma,
    );
    expect(mockedStockRepository.countQuantity).toHaveBeenCalled();
    expect(result).toEqual({
      message: "Location retrieved successfully",
      data: {
        location: expect.objectContaining({ id: "loc-1" }),
        totalStocks: 42,
      },
    });
  });

  it("passes itemSearchQuery through to buildStockCountWhereClause", async () => {
    mockedLocationRepository.get.mockResolvedValue({
      id: "loc-1",
      stocks: [],
    });

    mockedStockRepository.buildStockWhereClause.mockReturnValue({});

    await locationService.getById(
      fakeSession,
      "loc-1",
      { ...baseParams, itemSearchQuery: "towel" },
      fakePrisma,
    );

    expect(
      mockedStockRepository.buildStockCountWhereClause,
    ).toHaveBeenCalledWith(expect.any(Object), "towel");
  });
});
