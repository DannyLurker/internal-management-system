import { PrismaClient, Roles, StockType } from "@prisma/client";
import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seed...\n");

  // ============================================
  // 1. USERS - Create users with different roles
  // ============================================
  console.log("👤 Creating users...");

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@ecashier.com" },
    update: {},
    create: {
      name: "System Admin",
      email: "admin@ecashier.com",
      password: await hash("admin123", 10),
      role: Roles.ADMIN,
    },
  });

  const ownerUser = await prisma.user.upsert({
    where: { email: "owner@ecashier.com" },
    update: {},
    create: {
      name: "Business Owner",
      email: "owner@ecashier.com",
      password: await hash("owner123", 10),
      role: Roles.OWNER,
    },
  });

  const managerUser = await prisma.user.upsert({
    where: { email: "manager@ecashier.com" },
    update: {},
    create: {
      name: "Store Manager",
      email: "manager@ecashier.com",
      password: await hash("manager123", 10),
      role: Roles.MANAGER,
    },
  });

  const inventoryUser = await prisma.user.upsert({
    where: { email: "inventory@ecashier.com" },
    update: {},
    create: {
      name: "Inventory Staff",
      email: "inventory@ecashier.com",
      password: await hash("inventory123", 10),
      role: Roles.INVENTORY,
    },
  });

  const cashierUser1 = await prisma.user.upsert({
    where: { email: "cashier1@ecashier.com" },
    update: {},
    create: {
      name: "John Cashier",
      email: "cashier1@ecashier.com",
      password: await hash("cashier123", 10),
      role: Roles.CASHIER,
    },
  });

  const cashierUser2 = await prisma.user.upsert({
    where: { email: "cashier2@ecashier.com" },
    update: {},
    create: {
      name: "Sarah Cashier",
      email: "cashier2@ecashier.com",
      password: await hash("cashier123", 10),
      role: Roles.CASHIER,
    },
  });

  console.log(`   ✓ Created ${6} users`);
  console.log("     - Admin: admin@ecashier.com / admin123");
  console.log("     - Owner: owner@ecashier.com / owner123");
  console.log("     - Manager: manager@ecashier.com / manager123");
  console.log("     - Inventory: inventory@ecashier.com / inventory123");
  console.log("     - Cashier 1: cashier1@ecashier.com / cashier123");
  console.log("     - Cashier 2: cashier2@ecashier.com / cashier123\n");

  // ============================================
  // 2. CATEGORIES - Create product categories
  // ============================================
  console.log("📂 Creating categories...");

  const categoriesData = [
    { name: "Electronics", createdBy: adminUser.id },
    { name: "Groceries", createdBy: adminUser.id },
    { name: "Beverages", createdBy: adminUser.id },
    { name: "Snacks", createdBy: managerUser.id },
    { name: "Household", createdBy: managerUser.id },
    { name: "Personal Care", createdBy: inventoryUser.id },
    { name: "Stationery", createdBy: inventoryUser.id },
  ];

  const categories: Record<string, { id: string; name: string }> = {};

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

  // ============================================
  // 3. PRODUCTS - Create sample products (needed for stocks)
  // ============================================
  console.log("📦 Creating products...");

  const productsData = [
    // Electronics
    {
      name: "Wireless Mouse",
      sku: "ELEC-001",
      description: "Ergonomic wireless mouse with 2.4GHz connectivity",
      price: 25.99,
      categoryId: categories["Electronics"].id,
    },
    {
      name: "USB-C Cable",
      sku: "ELEC-002",
      description: "Fast charging USB-C to USB-C cable 1m",
      price: 12.5,
      categoryId: categories["Electronics"].id,
    },
    // Groceries
    {
      name: "Organic Rice 5kg",
      sku: "GROC-001",
      description: "Premium organic jasmine rice",
      price: 15.99,
      categoryId: categories["Groceries"].id,
    },
    {
      name: "Cooking Oil 1L",
      sku: "GROC-002",
      description: "Vegetable cooking oil",
      price: 8.99,
      categoryId: categories["Groceries"].id,
    },
    // Beverages
    {
      name: "Mineral Water 500ml",
      sku: "BEV-001",
      description: "Natural mineral water",
      price: 1.5,
      categoryId: categories["Beverages"].id,
    },
    {
      name: "Green Tea 350ml",
      sku: "BEV-002",
      description: "Unsweetened green tea",
      price: 2.25,
      categoryId: categories["Beverages"].id,
    },
    // Snacks
    {
      name: "Potato Chips 100g",
      sku: "SNACK-001",
      description: "Original flavor potato chips",
      price: 3.99,
      categoryId: categories["Snacks"].id,
    },
    {
      name: "Chocolate Bar 50g",
      sku: "SNACK-002",
      description: "Milk chocolate bar",
      price: 2.99,
      categoryId: categories["Snacks"].id,
    },
    // Household
    {
      name: "Dish Soap 500ml",
      sku: "HOUSE-001",
      description: "Lemon scented dish washing liquid",
      price: 4.5,
      categoryId: categories["Household"].id,
    },
    {
      name: "Tissue Box",
      sku: "HOUSE-002",
      description: "3-ply facial tissue 200 sheets",
      price: 3.25,
      categoryId: categories["Household"].id,
    },
    // Personal Care
    {
      name: "Toothpaste 100g",
      sku: "PCARE-001",
      description: "Fluoride toothpaste for cavity protection",
      price: 5.99,
      categoryId: categories["Personal Care"].id,
    },
    {
      name: "Hand Sanitizer 100ml",
      sku: "PCARE-002",
      description: "Alcohol-based hand sanitizer",
      price: 3.5,
      categoryId: categories["Personal Care"].id,
    },
    // Stationery
    {
      name: "Ballpoint Pen (12pcs)",
      sku: "STAT-001",
      description: "Blue ink ballpoint pens pack of 12",
      price: 6.99,
      categoryId: categories["Stationery"].id,
    },
    {
      name: "A4 Copy Paper (500s)",
      sku: "STAT-002",
      description: "Premium quality A4 printing paper",
      price: 9.99,
      categoryId: categories["Stationery"].id,
    },
  ];

  const products: Array<{ id: string; name: string; sku: string | null }> = [];

  for (const prodData of productsData) {
    const product = await prisma.product.upsert({
      where: { name: prodData.name },
      update: {},
      create: {
        name: prodData.name,
        sku: prodData.sku,
        description: prodData.description,
        price: prodData.price,
        categoryId: prodData.categoryId,
        createdBy: adminUser.id,
      },
    });
    products.push(product);
  }

  console.log(`   ✓ Created ${productsData.length} products\n`);

  // ============================================
  // 4. STOCKS - Create stock entries for products
  // ============================================
  console.log("📊 Creating stocks...");

  // Get all products to create stocks
  const allProducts = await prisma.product.findMany();

  const stockData = [
    // Electronics - lower stock, higher value
    { product: "Wireless Mouse", quantity: 25, type: StockType.IN_STOCK },
    { product: "USB-C Cable", quantity: 50, type: StockType.IN_STOCK },

    // Groceries - bulk stock
    { product: "Organic Rice 5kg", quantity: 100, type: StockType.IN_STOCK },
    { product: "Cooking Oil 1L", quantity: 80, type: StockType.IN_STOCK },

    // Beverages - high turnover
    { product: "Mineral Water 500ml", quantity: 200, type: StockType.IN_STOCK },
    { product: "Green Tea 350ml", quantity: 150, type: StockType.IN_STOCK },

    // Snacks
    { product: "Potato Chips 100g", quantity: 120, type: StockType.IN_STOCK },
    { product: "Chocolate Bar 50g", quantity: 90, type: StockType.IN_STOCK },

    // Household
    { product: "Dish Soap 500ml", quantity: 60, type: StockType.IN_STOCK },
    { product: "Tissue Box", quantity: 75, type: StockType.IN_STOCK },

    // Personal Care
    { product: "Toothpaste 100g", quantity: 85, type: StockType.IN_STOCK },
    { product: "Hand Sanitizer 100ml", quantity: 40, type: StockType.IN_STOCK },

    // Stationery
    {
      product: "Ballpoint Pen (12pcs)",
      quantity: 55,
      type: StockType.IN_STOCK,
    },
    { product: "A4 Copy Paper (500s)", quantity: 70, type: StockType.IN_STOCK },

    // Some damaged/expired stock
    { product: "Potato Chips 100g", quantity: 5, type: StockType.DAMAGE },
    { product: "Cooking Oil 1L", quantity: 2, type: StockType.DAMAGE },
    { product: "Chocolate Bar 50g", quantity: 3, type: StockType.EXPIRY },
  ];

  let stockCount = 0;

  for (const stock of stockData) {
    const product = allProducts.find((p) => p.name === stock.product);
    if (product) {
      await prisma.stock.create({
        data: {
          productId: product.id,
          quantity: stock.quantity,
          type: stock.type,
          createdBy: inventoryUser.id,
          ...(stock.type === StockType.EXPIRY && {
            expiredAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          }),
        },
      });
      stockCount++;
    }
  }

  console.log(`   ✓ Created ${stockCount} stock entries\n`);

  // Summary
  console.log("✅ Seed completed successfully!");
  console.log("");
  console.log("📊 Summary:");
  console.log(`   • Users: 6 (all roles)`);
  console.log(`   • Categories: ${categoriesData.length}`);
  console.log(`   • Products: ${productsData.length}`);
  console.log(`   • Stocks: ${stockCount}`);
  console.log("");
  console.log("🔑 Login Credentials:");
  console.log('   All passwords are the same as the username + "123"');
  console.log("   Example: admin@ecashier.com / admin123");
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
