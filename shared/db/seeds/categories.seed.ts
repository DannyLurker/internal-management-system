import prisma from "../prisma";
import type { SeedEntityMap } from "./types";

export async function categoriesSeed(user: {
  adminUser: { id: string };
  hotelManagerUser: { id: string };
  supervisorUser: { id: string };
}): Promise<SeedEntityMap> {
  const categoriesData = [
    { name: "Linens & Bedding", createdBy: user.adminUser.id },
    { name: "Toiletries", createdBy: user.adminUser.id },
    { name: "Cleaning Supplies", createdBy: user.hotelManagerUser.id },
    { name: "Food & Beverage", createdBy: user.hotelManagerUser.id },
    { name: "Guest Amenities", createdBy: user.supervisorUser.id },
    { name: "Stationery", createdBy: user.supervisorUser.id },
    { name: "Maintenance", createdBy: user.adminUser.id },
  ];

  const categories: SeedEntityMap = {};

  for (const catData of categoriesData) {
    const category = await prisma.category.upsert({
      where: { name: catData.name },
      update: {},
      create: {
        name: catData.name,
        createdBy: catData.createdBy,
      },
    });
    categories[catData.name] = category;
  }

  console.log(`   ✓ Created ${categoriesData.length} categories\n`);

  return categories;
}
