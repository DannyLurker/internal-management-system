-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_locationId_fkey";

-- AlterTable
ALTER TABLE "Stock" ALTER COLUMN "locationId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
