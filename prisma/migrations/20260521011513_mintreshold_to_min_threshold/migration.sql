/*
  Warnings:

  - You are about to drop the column `minTreshold` on the `Item` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Item" DROP COLUMN "minTreshold",
ADD COLUMN     "minThreshold" INTEGER NOT NULL DEFAULT 0;
