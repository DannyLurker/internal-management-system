import { StockType } from "@prisma/client";
import prisma from "../prisma";
import type { SeedEntityMap } from "./types";

export async function createStocksSeed(
  items: SeedEntityMap,
  locations: SeedEntityMap,
  housekeepingUser: { id: string },
) {
  const stocksData: Array<{
    itemName: string;
    locationName: string;
    quantity: number;
    type: StockType;
    expiredAt?: Date;
  }> = [
    // Main Warehouse — bulk READY stock
    {
      itemName: "King Bed Sheet Set",
      locationName: "Main Warehouse",
      quantity: 80,
      type: StockType.READY,
    },
    {
      itemName: "Pillow Case (Pair)",
      locationName: "Main Warehouse",
      quantity: 120,
      type: StockType.READY,
    },
    {
      itemName: "Bath Towel",
      locationName: "Main Warehouse",
      quantity: 150,
      type: StockType.READY,
    },
    {
      itemName: "Hand Towel",
      locationName: "Main Warehouse",
      quantity: 150,
      type: StockType.READY,
    },
    {
      itemName: "Shampoo Sachet 30ml",
      locationName: "Main Warehouse",
      quantity: 500,
      type: StockType.READY,
    },
    {
      itemName: "Conditioner Sachet 30ml",
      locationName: "Main Warehouse",
      quantity: 500,
      type: StockType.READY,
    },
    {
      itemName: "Bath Soap 40g",
      locationName: "Main Warehouse",
      quantity: 800,
      type: StockType.READY,
    },
    {
      itemName: "Toothbrush Kit",
      locationName: "Main Warehouse",
      quantity: 300,
      type: StockType.READY,
    },
    {
      itemName: "All-Purpose Cleaner 1L",
      locationName: "Main Warehouse",
      quantity: 60,
      type: StockType.READY,
    },
    {
      itemName: "Toilet Bowl Cleaner 500ml",
      locationName: "Main Warehouse",
      quantity: 40,
      type: StockType.READY,
    },
    {
      itemName: "Mineral Water 600ml",
      locationName: "Main Warehouse",
      quantity: 400,
      type: StockType.READY,
    },
    {
      itemName: "Coffee Sachet",
      locationName: "Main Warehouse",
      quantity: 600,
      type: StockType.READY,
    },
    {
      itemName: "Tea Bag",
      locationName: "Main Warehouse",
      quantity: 600,
      type: StockType.READY,
    },
    {
      itemName: "Sewing Kit",
      locationName: "Main Warehouse",
      quantity: 150,
      type: StockType.READY,
    },
    {
      itemName: "Shoe Shine Cloth",
      locationName: "Main Warehouse",
      quantity: 200,
      type: StockType.READY,
    },
    {
      itemName: "Notepad A6",
      locationName: "Main Warehouse",
      quantity: 250,
      type: StockType.READY,
    },
    {
      itemName: "Ballpoint Pen",
      locationName: "Main Warehouse",
      quantity: 250,
      type: StockType.READY,
    },

    // Floor Lockers — distributed READY stock
    {
      itemName: "Bath Towel",
      locationName: "Floor 1 Locker",
      quantity: 40,
      type: StockType.READY,
    },
    {
      itemName: "Hand Towel",
      locationName: "Floor 1 Locker",
      quantity: 40,
      type: StockType.READY,
    },
    {
      itemName: "Shampoo Sachet 30ml",
      locationName: "Floor 1 Locker",
      quantity: 100,
      type: StockType.READY,
    },
    {
      itemName: "Bath Soap 40g",
      locationName: "Floor 1 Locker",
      quantity: 100,
      type: StockType.READY,
    },
    {
      itemName: "Bath Towel",
      locationName: "Floor 2 Locker",
      quantity: 40,
      type: StockType.READY,
    },
    {
      itemName: "Hand Towel",
      locationName: "Floor 2 Locker",
      quantity: 40,
      type: StockType.READY,
    },
    {
      itemName: "Shampoo Sachet 30ml",
      locationName: "Floor 2 Locker",
      quantity: 100,
      type: StockType.READY,
    },
    {
      itemName: "Bath Soap 40g",
      locationName: "Floor 2 Locker",
      quantity: 100,
      type: StockType.READY,
    },

    // Front Office
    {
      itemName: "Notepad A6",
      locationName: "Front Office",
      quantity: 50,
      type: StockType.READY,
    },
    {
      itemName: "Ballpoint Pen",
      locationName: "Front Office",
      quantity: 50,
      type: StockType.READY,
    },
    {
      itemName: "Mineral Water 600ml",
      locationName: "Front Office",
      quantity: 30,
      type: StockType.READY,
    },

    // Operational
    {
      itemName: "All-Purpose Cleaner 1L",
      locationName: "Operational Store",
      quantity: 10,
      type: StockType.READY,
    },
    {
      itemName: "Coffee Sachet",
      locationName: "Operational Store",
      quantity: 50,
      type: StockType.READY,
    },

    // DIRTY linens awaiting laundry
    {
      itemName: "Bath Towel",
      locationName: "Main Warehouse",
      quantity: 18,
      type: StockType.DIRTY,
    },
    {
      itemName: "Hand Towel",
      locationName: "Main Warehouse",
      quantity: 22,
      type: StockType.DIRTY,
    },
    {
      itemName: "King Bed Sheet Set",
      locationName: "Main Warehouse",
      quantity: 10,
      type: StockType.DIRTY,
    },
    {
      itemName: "Pillow Case (Pair)",
      locationName: "Main Warehouse",
      quantity: 15,
      type: StockType.DIRTY,
    },

    // DAMAGED items
    {
      itemName: "Bath Towel",
      locationName: "Main Warehouse",
      quantity: 5,
      type: StockType.DAMAGED,
    },
    {
      itemName: "King Bed Sheet Set",
      locationName: "Main Warehouse",
      quantity: 3,
      type: StockType.DAMAGED,
    },
    {
      itemName: "All-Purpose Cleaner 1L",
      locationName: "Main Warehouse",
      quantity: 2,
      type: StockType.DAMAGED,
    },

    // EXPIRED consumables
    {
      itemName: "Shampoo Sachet 30ml",
      locationName: "Main Warehouse",
      quantity: 20,
      type: StockType.EXPIRED,
      expiredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // expired 7 days ago
    },
    {
      itemName: "Coffee Sachet",
      locationName: "Main Warehouse",
      quantity: 15,
      type: StockType.EXPIRED,
      expiredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // expired 3 days ago
    },
  ];

  let stockCount = 0;

  for (const stockEntry of stocksData) {
    const item = items[stockEntry.itemName];
    const location = locations[stockEntry.locationName];

    if (!item || !location) {
      console.warn(
        `   ⚠ Skipping stock: item "${stockEntry.itemName}" or location "${stockEntry.locationName}" not found`,
      );
      continue;
    }

    const existingStock = await prisma.stock.findFirst({
      where: {
        itemId: item.id,
        locationId: location.id,
        type: stockEntry.type,
        expiredAt: stockEntry.expiredAt ? new Date(stockEntry.expiredAt) : null,
      },
    });

    if (existingStock) {
      // 2. If it exists, update the record using its unique ID
      await prisma.stock.update({
        where: { id: existingStock.id },
        data: {
          quantity: existingStock.quantity + stockEntry.quantity,
          totalCost:  
            existingStock.totalCost +
            stockEntry.quantity * Math.floor(Math.random() * 10001) +
            100000,
        },
      });
    } else {
      // 3. If it doesn't exist, build a brand new record
      await prisma.stock.create({
        data: {
          itemId: item.id,
          locationId: location.id,
          type: stockEntry.type,
          quantity: stockEntry.quantity,
          totalCost:
            stockEntry.quantity * Math.floor(Math.random() * 10001) + 100000,
          expiredAt: stockEntry.expiredAt
            ? new Date(stockEntry.expiredAt)
            : null,
          createdBy: housekeepingUser.id, // Ensure you map your required creator relation field here
        },
      });
    }
    stockCount++;
  }

  return stockCount;
}
