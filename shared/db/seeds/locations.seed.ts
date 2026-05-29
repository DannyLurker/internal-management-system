import { LocationType } from "@prisma/client";
import prisma from "../prisma";
import type { SeedEntityMap } from "./types";

export async function createLocationsSeed(createdBy: { id: string }) {
  const locationsData = [
    {
      name: "Main Warehouse",
      type: LocationType.MAIN_WAREHOUSE,
      description: "Central storage for all hotel supplies",
    },
    {
      name: "Floor 1 Locker",
      type: LocationType.FLOOR_LOCKER,
      description: "Housekeeping locker for floors 1–3",
    },
    {
      name: "Floor 2 Locker",
      type: LocationType.FLOOR_LOCKER,
      description: "Housekeeping locker for floors 4–6",
    },
    {
      name: "Front Office",
      type: LocationType.FRONT_OFFICE,
      description: "Front desk and reception storage",
    },
    {
      name: "Operational Store",
      type: LocationType.OPERATIONAL,
      description: "Day-to-day operational supplies",
    },
  ];

  const locations: SeedEntityMap = {};

  for (const locData of locationsData) {
    const location = await prisma.location.upsert({
      where: { name: locData.name },
      update: {},
      create: {
        ...locData,
        createdBy: createdBy.id,
      },
    });
    locations[locData.name] = location;
  }

  console.log(`   ✓ Created ${locationsData.length} locations\n`);

  return { locations, locationsTotalData: locationsData.length };
}
