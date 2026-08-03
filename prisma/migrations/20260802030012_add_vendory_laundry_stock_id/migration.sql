/*
  Warnings:

  - Added the required column `vendorLaundryStockId` to the `Laundry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Laundry" ADD COLUMN     "vendorLaundryStockId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Laundry" ADD CONSTRAINT "Laundry_vendorLaundryStockId_fkey" FOREIGN KEY ("vendorLaundryStockId") REFERENCES "Stock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
