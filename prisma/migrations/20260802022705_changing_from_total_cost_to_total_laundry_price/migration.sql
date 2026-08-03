/*
  Warnings:

  - You are about to drop the column `totalCost` on the `Laundry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Laundry" DROP COLUMN "totalCost",
ADD COLUMN     "totalLaundryPrice" INTEGER;
