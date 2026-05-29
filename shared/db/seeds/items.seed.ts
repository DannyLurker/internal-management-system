import prisma from "../prisma";
import type { SeedEntityMap } from "./types";

export async function createItemsSeed(
  categories: SeedEntityMap,
  adminUser: { id: string },
) {
  const itemsData = [
    // Linens & Bedding
    {
      name: "King Bed Sheet Set",
      description: "300 thread count king-size cotton bed sheet set",
      sellingPrice: null,
      minThreshold: 20,
      categoryName: "Linens & Bedding",
    },
    {
      name: "Pillow Case (Pair)",
      description: "Standard white pillow cases, pack of 2",
      sellingPrice: null,
      minThreshold: 30,
      categoryName: "Linens & Bedding",
    },
    {
      name: "Bath Towel",
      description: "Large white cotton bath towel 70x140cm",
      sellingPrice: null,
      minThreshold: 50,
      categoryName: "Linens & Bedding",
    },
    {
      name: "Hand Towel",
      description: "White cotton hand towel 40x70cm",
      sellingPrice: null,
      minThreshold: 50,
      categoryName: "Linens & Bedding",
    },
    // Toiletries
    {
      name: "Shampoo Sachet 30ml",
      description: "Single-use guest shampoo sachet",
      sellingPrice: null,
      minThreshold: 100,
      categoryName: "Toiletries",
    },
    {
      name: "Conditioner Sachet 30ml",
      description: "Single-use guest conditioner sachet",
      sellingPrice: null,
      minThreshold: 100,
      categoryName: "Toiletries",
    },
    {
      name: "Bath Soap 40g",
      description: "Individually wrapped guest bath soap",
      sellingPrice: null,
      minThreshold: 200,
      categoryName: "Toiletries",
    },
    {
      name: "Toothbrush Kit",
      description: "Disposable toothbrush with toothpaste",
      sellingPrice: null,
      minThreshold: 100,
      categoryName: "Toiletries",
    },
    // Cleaning Supplies
    {
      name: "All-Purpose Cleaner 1L",
      description: "Multi-surface cleaning spray concentrate",
      sellingPrice: null,
      minThreshold: 20,
      categoryName: "Cleaning Supplies",
    },
    {
      name: "Toilet Bowl Cleaner 500ml",
      description: "Disinfectant toilet bowl cleaner",
      sellingPrice: null,
      minThreshold: 15,
      categoryName: "Cleaning Supplies",
    },
    // Food & Beverage
    {
      name: "Mineral Water 600ml",
      description: "Bottled natural mineral water",
      sellingPrice: 3.5,
      minThreshold: 100,
      categoryName: "Food & Beverage",
    },
    {
      name: "Coffee Sachet",
      description: "Instant coffee sachet 2g",
      sellingPrice: 2.0,
      minThreshold: 200,
      categoryName: "Food & Beverage",
    },
    {
      name: "Tea Bag",
      description: "Assorted tea bags",
      sellingPrice: 1.5,
      minThreshold: 200,
      categoryName: "Food & Beverage",
    },
    // Guest Amenities
    {
      name: "Sewing Kit",
      description: "Compact guest sewing kit",
      sellingPrice: null,
      minThreshold: 50,
      categoryName: "Guest Amenities",
    },
    {
      name: "Shoe Shine Cloth",
      description: "Disposable shoe shine cloth",
      sellingPrice: null,
      minThreshold: 50,
      categoryName: "Guest Amenities",
    },
    // Stationery
    {
      name: "Notepad A6",
      description: "Hotel branded A6 notepad 50 sheets",
      sellingPrice: null,
      minThreshold: 80,
      categoryName: "Stationery",
    },
    {
      name: "Ballpoint Pen",
      description: "Hotel branded ballpoint pen blue ink",
      sellingPrice: null,
      minThreshold: 80,
      categoryName: "Stationery",
    },
  ];

  const items: SeedEntityMap = {};

  for (const itemData of itemsData) {
    const item = await prisma.item.upsert({
      where: { name: itemData.name },
      update: {},
      create: {
        name: itemData.name,
        description: itemData.description,
        sellingPrice: itemData.sellingPrice,
        minThreshold: itemData.minThreshold,
        categoryId: categories[itemData.categoryName].id,
        createdBy: adminUser.id,
        isActive: true,
      },
    });
    items[itemData.name] = item;
  }

  return {
    items,
    itemsTotalData: itemsData.length,
  };
}
