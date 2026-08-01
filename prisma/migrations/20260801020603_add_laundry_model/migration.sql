-- CreateEnum
CREATE TYPE "LaundryStatus" AS ENUM ('SENT', 'RETURNED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "Entity" ADD VALUE 'LAUNDRY';

-- CreateTable
CREATE TABLE "Laundry" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "totalCost" INTEGER,
    "status" "LaundryStatus" NOT NULL DEFAULT 'SENT',
    "reason" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnedAt" TIMESTAMP(3),
    "itemId" TEXT NOT NULL,
    "sourceLocationId" TEXT,
    "destinationLocationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Laundry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Laundry_itemId_idx" ON "Laundry"("itemId");

-- CreateIndex
CREATE INDEX "Laundry_status_idx" ON "Laundry"("status");

-- AddForeignKey
ALTER TABLE "Laundry" ADD CONSTRAINT "Laundry_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Laundry" ADD CONSTRAINT "Laundry_sourceLocationId_fkey" FOREIGN KEY ("sourceLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Laundry" ADD CONSTRAINT "Laundry_destinationLocationId_fkey" FOREIGN KEY ("destinationLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
