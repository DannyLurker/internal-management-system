import locationService from "@/features/locations/location.service";
import {
  locationRepository,
  locationSelectData,
} from "@/features/locations/location.repository";
import { forbidden } from "@/shared/lib/error-handlers";
import { PrismaClient } from "@prisma/client";
import { Session } from "next-auth";

jest.mock("@/features/locations/location.repository");

const mockedLocationRepository = locationRepository as jest.Mocked<
  typeof locationRepository
>;

function makeFakePrisma(countResult: number) {
  return {
    location: {
      count: jest.fn().mockResolvedValue(countResult),
    },
  } as unknown as PrismaClient;
}

const managerSession = {
  id: "user-1",
  role: "HOTEL_MANAGER",
} as Session["user"];
const frontDeskSession = {
  id: "user-2",
  role: "FRONT_DESK",
} as Session["user"];

const baseParams = {
  page: 1,
  dataPerPage: 10,
  sortBy: "name",
  sortOrderEnum: "asc",
} as any;

describe("locationService.getMany", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws forbidden and never queries the repository for a role that can't manage locations", async () => {
    const prisma = makeFakePrisma(0);

    await expect(
      locationService.getMany(frontDeskSession, baseParams, prisma),
    ).rejects.toEqual(forbidden("You're not allowed to access this feature"));

    expect(mockedLocationRepository.getMany).not.toHaveBeenCalled();
    expect(prisma.location.count as jest.Mock).not.toHaveBeenCalled();
  });

  it("returns locations with pagination and totalCount for an allowed role", async () => {
    (locationRepository.buildLocationWhereClause as jest.Mock).mockReturnValue(
      {},
    );
    (locationSelectData as jest.Mock).mockReturnValue({});
    mockedLocationRepository.getMany.mockResolvedValue([
      { id: "loc-1", name: "Main Warehouse" },
      { id: "loc-2", name: "Front Office" },
    ] as any);
    const prisma = makeFakePrisma(2);

    const result = await locationService.getMany(
      managerSession,
      baseParams,
      prisma,
    );

    expect(mockedLocationRepository.getMany).toHaveBeenCalledWith(
      expect.anything(), // whereQuery
      expect.anything(), // selectData
      0, // skip = (1 - 1) * 10
      10, // take
      "asc",
      "name",
      prisma,
    );
    expect(result).toEqual({
      message: "Locations retrieved successfully",
      data: {
        locations: [
          { id: "loc-1", name: "Main Warehouse" },
          { id: "loc-2", name: "Front Office" },
        ],
        totalCount: 2,
      },
    });
  });

  it("computes skip correctly for page 3 with 10 per page", async () => {
    mockedLocationRepository.getMany.mockResolvedValue([] as any);
    const prisma = makeFakePrisma(0);

    await locationService.getMany(
      managerSession,
      { ...baseParams, page: 3, dataPerPage: 10 },
      prisma,
    );

    expect(mockedLocationRepository.getMany).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      20, // skip = (3 - 1) * 10
      10,
      "asc",
      "name",
      prisma,
    );
  });
});
