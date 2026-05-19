/*
  Warnings:

  - You are about to drop the column `price` on the `Item` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Item" DROP COLUMN "price",
ADD COLUMN     "minTreshold" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sellingPrice" DECIMAL(65,30);
