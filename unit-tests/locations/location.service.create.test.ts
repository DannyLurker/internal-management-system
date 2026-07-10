import locationService from "@/features/locations/location.service";
import { locationRepository } from "@/features/locations/location.repository";
import auditLogsRepository from "@/features/audit-logs/audit-log.repository";
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

describe("locationService.create", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates the location and writes a CREATE audit log with the right metadata", async () => {
    mockedLocationRepository.create.mockResolvedValue({
      id: "loc-new-1",
      name: "floor locker 2",
      type: "FLOOR_LOCKER",
      description: "Second floor locker",
    } as any);
    const prisma = makeFakePrisma();

    const result = await locationService.create(
      fakeSession,
      {
        name: "floor locker 2",
        type: "FLOOR_LOCKER",
        description: "Second floor locker",
      } as any,
      prisma,
    );

    // Verify the repository was called with the correct connect relation, not a raw userId field.
    expect(mockedLocationRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "floor locker 2",
        type: "FLOOR_LOCKER",
        description: "Second floor locker",
        userCreatedBy: { connect: { id: "user-1" } },
      }),
      expect.anything(),
    );

    expect(mockedAuditLogsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        action: "CREATE",
        entity: "LOCATION",
        entityId: "loc-new-1",
        metadata: expect.objectContaining({
          name: "floor locker 2",
          type: "FLOOR_LOCKER",
        }),
      }),
      expect.anything(),
    );

    expect(result).toEqual({
      message: "floor locker 2 created successfully",
      id: "loc-new-1",
    });
  });

  it("does not write an audit log if the repository create call fails", async () => {
    mockedLocationRepository.create.mockRejectedValue(new Error("db exploded"));
    const prisma = makeFakePrisma();

    await expect(
      locationService.create(
        fakeSession,
        {
          name: "floor locker 2",
          type: "FLOOR_LOCKER",
          description: null,
        } as any,
        prisma,
      ),
    ).rejects.toThrow("db exploded");

    expect(mockedAuditLogsRepository.create).not.toHaveBeenCalled();
  });
});
