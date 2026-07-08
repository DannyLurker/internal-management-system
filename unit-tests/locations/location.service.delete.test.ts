import locationService from "@/features/locations/location.service";
import { locationRepository } from "@/features/locations/location.repository";
import auditLogsRepository from "@/features/audit-logs/audit-log.repository";
import { notFound, badRequest } from "@/shared/lib/error-handlers";
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

const fakeSession = { id: "user-1", role: "ADMIN" } as Session["user"];

describe("locationService.delete", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws notFound and never touches delete/audit-log when the location doesn't exist", async () => {
    mockedLocationRepository.get.mockResolvedValue(null);
    const prisma = makeFakePrisma();

    await expect(
      locationService.delete(fakeSession, "loc-missing", prisma),
    ).rejects.toEqual(notFound("Location not found"));

    expect(mockedLocationRepository.delete).not.toHaveBeenCalled();
    expect(mockedAuditLogsRepository.create).not.toHaveBeenCalled();
  });

  it("throws badRequest and never deletes when the location still has stock", async () => {
    mockedLocationRepository.get.mockResolvedValue({
      id: "loc-1",
      name: "Room 101",
      type: "ROOM",
      description: null,
      stocks: [{ id: "stock-1" }],
    } as any);
    const prisma = makeFakePrisma();

    await expect(
      locationService.delete(fakeSession, "loc-1", prisma),
    ).rejects.toEqual(
      badRequest(
        "Item was found in this location. Migrate all the item before deleting.",
      ),
    );

    expect(mockedLocationRepository.delete).not.toHaveBeenCalled();
    expect(mockedAuditLogsRepository.create).not.toHaveBeenCalled();
  });

  it("deletes and writes an audit log when the location has no stock", async () => {
    mockedLocationRepository.get.mockResolvedValue({
      id: "loc-1",
      name: "Room 101",
      type: "ROOM",
      description: "Deluxe room",
      stocks: [],
    } as any);
    mockedLocationRepository.delete.mockResolvedValue({
      id: "loc-1",
      name: "Room 101",
    } as any);
    const prisma = makeFakePrisma();

    const result = await locationService.delete(fakeSession, "loc-1", prisma);

    expect(mockedLocationRepository.delete).toHaveBeenCalledWith(
      "loc-1",
      expect.anything(),
    );
    expect(mockedAuditLogsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        action: "DELETE",
        entity: "LOCATION",
        entityId: "loc-1",
        metadata: expect.objectContaining({
          id: "loc-1",
          name: "Room 101",
        }),
      }),
      expect.anything(),
    );
    expect(result).toEqual({
      message: "Room 101 deleted successfully",
      id: "loc-1",
    });
  });
});
