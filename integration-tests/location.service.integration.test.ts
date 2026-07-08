import locationService from "@/features/locations/location.service";
import prisma from "@/shared/db/prisma";
import { Session } from "next-auth";
import { randomUUID } from "crypto";

/**
 * INTEGRATION TEST — sengaja TIDAK ada jest.mock() di file ini.
 * Hit database test asli (lihat .env.test). Tujuannya membuktikan
 * query semantics beneran jalan sesuai harapan di DB engine:
 * - search case-insensitive
 * - sort order
 * - pagination (skip/take) terhadap jumlah baris yang sebenarnya
 *
 * Yang TIDAK di-test di sini: authorization branching, urutan pemanggilan,
 * error throwing — itu sudah dicover di service test (mocked).
 */

// Prefix unik per run, biar nggak tabrakan sama Location.name yang @unique,
// baik terhadap data dev/seed lain maupun sisa run test sebelumnya yang gagal cleanup.
const runId = randomUUID().slice(0, 8);
const nameA = `${runId}-Alpha Storage`;
const nameB = `${runId}-Bravo Office`;
const nameC = `${runId}-alpha annex`;

let test: Session["user"];
const seededLocationIds: string[] = [];

beforeAll(async () => {
  // Location.createdBy adalah foreign key wajib ke User.id — user-nya
  // harus beneran ada di DB dulu sebelum Location bisa dibuat.
  const testUser = await prisma.user.create({
    data: {
      name: "Integration Test User",
      email: `integration-test-${runId}@example.test`,
      password: "not-used-in-this-test",
      role: "HOTEL_MANAGER",
    },
  });
  test = testUser;

  const created = await prisma.$transaction([
    prisma.location.create({
      data: {
        name: nameA,
        type: "MAIN_WAREHOUSE",
        userCreatedBy: { connect: { id: test.id } },
      },
    }),
    prisma.location.create({
      data: {
        name: nameB,
        type: "FRONT_OFFICE",
        userCreatedBy: { connect: { id: test.id } },
      },
    }),
    prisma.location.create({
      data: {
        name: nameC,
        type: "MAIN_WAREHOUSE",
        userCreatedBy: { connect: { id: test.id } },
      },
    }),
  ]);

  seededLocationIds.push(...created.map((location) => location.id));
});

afterAll(async () => {
  // Urutan penting: hapus Location dulu (yang mereferensikan User via createdBy),
  // baru User-nya — kalau dibalik, foreign key constraint akan menolak.
  await prisma.location.deleteMany({
    where: { id: { in: seededLocationIds } },
  });
  await prisma.user.delete({ where: { id: test.id } });
  await prisma.$disconnect();
});

const mockSession = (): Session["user"] => ({
  id: test.id,
  email: test.email,
  name: test.name,
  image: test.image ?? null,
  role: test.role,
});

describe("locationService.getMany — integration (real DB)", () => {
  it("mencocokkan searchQuery secara case-insensitive", async () => {
    const result = await locationService.getMany(
      mockSession(),
      {
        page: 1,
        dataPerPage: 10,
        sortBy: "name",
        sortOrderEnum: "asc",
        searchQuery: `${runId}-ALPHA`,
      } as any,
      prisma,
    );

    const names = result.data.locations.map((location: any) => location.name);
    expect(names).toEqual(expect.arrayContaining([nameA, nameC]));
    expect(names).not.toContain(nameB);
  });

  it("mengurutkan berdasarkan nama secara ascending sesuai collation DB", async () => {
    const result = await locationService.getMany(
      mockSession(),
      {
        page: 1,
        dataPerPage: 10,
        sortBy: "name",
        sortOrderEnum: "asc",
        searchQuery: runId,
      } as any,
      prisma,
    );

    const names = result.data.locations.map((location: any) => location.name);
    const expectedOrder = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(expectedOrder);
  });

  it("melakukan pagination dengan benar terhadap jumlah baris yang sebenarnya", async () => {
    const pageOne = await locationService.getMany(
      mockSession(),
      {
        page: 1,
        dataPerPage: 1,
        sortBy: "name",
        sortOrderEnum: "asc",
        locationType: "MAIN_WAREHOUSE",
        searchQuery: runId,
      } as any,
      prisma,
    );
    const pageTwo = await locationService.getMany(
      mockSession(),
      {
        page: 2,
        dataPerPage: 1,
        sortBy: "name",
        sortOrderEnum: "asc",
        locationType: "MAIN_WAREHOUSE",
        searchQuery: runId,
      } as any,
      prisma,
    );

    expect(pageOne.data.locations).toHaveLength(1);
    expect(pageTwo.data.locations).toHaveLength(1);
    expect(pageOne.data.locations[0].id).not.toBe(pageTwo.data.locations[0].id);
    expect(pageOne.data.totalCount).toBeGreaterThanOrEqual(2);
  });
});
