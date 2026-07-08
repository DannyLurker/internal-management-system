import locationService from "@/features/locations/location.service";
import { locationRepository } from "@/features/locations/location.repository";
import auditLogsRepository from "@/features/audit-logs/audit-log.repository";
import { notFound } from "@/shared/lib/error-handlers";
import { PrismaClient } from "@prisma/client";
import { Session } from "next-auth";

jest.mock("@/features/locations/location.repository");
jest.mock("@/features/audit-logs/audit-log.repository");

const mockedLocationRepository = locationRepository as jest.Mocked<
  typeof locationRepository
>;
const mockedAuditLogsRepository = auditLogsRepository as jest.Mocked<
  typeof auditLogsRepository
>;

function makeFakePrisma(): PrismaClient {
  return {
    $transaction: jest.fn((callback) => callback({} as any)),
  } as unknown as PrismaClient;
}

const fakeSession = { id: "user-1", role: "HOTEL_MANAGER" } as Session["user"];

describe("locationService.update", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws notFound and never calls update/audit-log when the location doesn't exist", async () => {
    mockedLocationRepository.get.mockResolvedValue(null);
    const prisma = makeFakePrisma();

    await expect(
      locationService.update(
        fakeSession,
        "loc-missing",
        { name: "New Name", type: "OPERATIONAL", description: null } as any,
        prisma,
      ),
    ).rejects.toEqual(notFound("Location not found"));

    expect(mockedLocationRepository.update).not.toHaveBeenCalled();
    expect(mockedAuditLogsRepository.create).not.toHaveBeenCalled();
  });

  it("updates the location and logs both old and new values in the audit metadata", async () => {
    mockedLocationRepository.get.mockResolvedValue({
      name: "Room 101",
      type: "MAIN_WAREHOUSE",
      description: "Old description",
    } as any);
    mockedLocationRepository.update.mockResolvedValue({
      id: "loc-1",
      name: "Room 101 Renamed",
      type: "OPERATIONAL",
      description: "New description",
    } as any);
    const prisma = makeFakePrisma();

    const result = await locationService.update(
      fakeSession,
      "loc-1",
      {
        name: "Room 101 Renamed",
        type: "OPERATIONAL",
        description: "New description",
      } as any,
      prisma,
    );

    expect(mockedLocationRepository.update).toHaveBeenCalledWith(
      "loc-1",
      expect.objectContaining({
        name: "Room 101 Renamed",
        type: "OPERATIONAL",
        description: "New description",
        userCreatedBy: { connect: { id: "user-1" } },
      }),
      expect.anything(),
    );

    expect(mockedAuditLogsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        action: "UPDATE",
        entity: "LOCATION",
        entityId: "loc-1",
        metadata: expect.objectContaining({
          id: "loc-1",
          old: {
            name: "Room 101",
            type: "MAIN_WAREHOUSE",
            description: "Old description",
          },
          new: {
            name: "Room 101 Renamed",
            type: "OPERATIONAL",
            description: "New description",
          },
        }),
      }),
      expect.anything(),
    );

    expect(result).toEqual({
      message: "Room 101 Renamed updated successfully",
      id: "loc-1",
    });
  });
});
