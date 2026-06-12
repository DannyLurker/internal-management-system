/*
  Warnings:

  - A unique constraint covering the columns `[itemId,locationId,type,expiredAt]` on the table `Stock` will be added. If there are existing duplicate values, this will fail.
  - Made the column `locationId` on table `Stock` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_locationId_fkey";

-- DropIndex
DROP INDEX "Stock_itemId_locationId_type_key";

-- AlterTable
ALTER TABLE "Stock" ALTER COLUMN "locationId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Stock_itemId_locationId_type_expiredAt_key" ON "Stock"("itemId", "locationId", "type", "expiredAt");

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
