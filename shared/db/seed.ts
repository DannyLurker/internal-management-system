import "dotenv/config";
import prisma from "./prisma";
import { createUserAccountsSeed } from "./seeds/user-accounts.seed";
import { createLocationsSeed } from "./seeds/locations.seed";
import { categoriesSeed } from "./seeds/categories.seed";
import { createItemsSeed } from "./seeds/items.seed";
import { createStocksSeed } from "./seeds/stocks.seed";
import { createStockMovementsSeed } from "./seeds/stockMovements.seed";
import { createOrdersSeed } from "./seeds/orders.seed";

async function main() {
  console.log("🌱 Starting seed...\n");

  // ============================================
  // 1. USERS - Hotel roles from schema
  // ============================================
  console.log("👤 Creating users...");

  const {
    adminUser,
    hotelManagerUser,
    supervisorUser,
    accountantUser,
    housekeepingUser,
    frontDeskUser,
  } = await createUserAccountsSeed();

  // ============================================
  // 2. CATEGORIES
  // ============================================
  console.log("📂 Creating categories...");

  const categories = await categoriesSeed({
    adminUser,
    hotelManagerUser,
    supervisorUser,
  });

  // ============================================
  // 3. LOCATIONS - Based on LocationType enum
  // ============================================
  console.log("📍 Creating locations...");

  const { locations, locationsTotalData } = await createLocationsSeed();

  // ============================================
  // 4. ITEMS (not Products — matches schema)
  // ============================================
  console.log("📦 Creating items...");

  const { items, itemsTotalData } = await createItemsSeed(categories, adminUser);

  console.log(`   ✓ Created ${itemsTotalData} items\n`);

  // ============================================
  // 5. STOCKS - StockType: READY | DIRTY | DAMAGED | EXPIRED
  // ============================================
  console.log("📊 Creating stocks...");

  const stockCount = await createStocksSeed(
    items,
    locations,
    housekeepingUser,
  );

  console.log(`   ✓ Created ${stockCount} stock entries\n`);

  // ============================================
  // 6. STOCK MOVEMENTS - Sample movement history
  // ============================================
  console.log("🔄 Creating stock movements...");

  const { movementsData, frontOffice, movementCount } =
    await createStockMovementsSeed(
      locations,
      items,
      supervisorUser,
      housekeepingUser,
      accountantUser,
    );

  console.log(`   ✓ Created ${movementCount} stock movements\n`);

  // ============================================
  // 7. ORDERS - Guest room orders (F&B mini-bar style)
  // ============================================
  console.log("🛎  Creating orders...");

  const { orderCount, ordersData } = await createOrdersSeed(
    frontDeskUser,
    items,
    frontOffice,
  );

  console.log(`   ✓ Created ${orderCount} orders\n`);

  // ============================================
  // Summary
  // ============================================
  console.log("✅ Seed completed successfully!");
  console.log("");
  console.log("📊 Summary:");
  console.log(`   • Users:           6 (all roles)`);
  console.log(`   • Categories:      ${Object.keys(categories).length}`);
  console.log(`   • Locations:       ${locationsTotalData}`);
  console.log(`   • Items:           ${itemsTotalData}`);
  console.log(`   • Stocks:          ${stockCount}`);
  console.log(
    `   • Stock movements: ${movementsData.length + ordersData.flatMap((o) => o.items).length}`,
  );
  console.log(`   • Orders:          ${orderCount}`);
  console.log("");
  console.log("🔑 Login Credentials:");
  console.log("   All passwords follow the pattern: <role>123");
  console.log("   Example: admin@hotel.com / admin123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
