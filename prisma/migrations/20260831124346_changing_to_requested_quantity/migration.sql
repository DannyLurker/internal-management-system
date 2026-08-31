/*
  Warnings:

  - You are about to drop the column `quantity` on the `StockRequest` table. All the data in the column will be lost.
  - You are about to drop the column `rejectionReason` on the `StockRequest` table. All the data in the column will be lost.
  - Added the required column `requestedQuantity` to the `StockRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "StockRequestStatus" ADD VALUE 'PARTIALLY_APPROVED';

-- AlterTable
ALTER TABLE "StockRequest" DROP COLUMN "quantity",
DROP COLUMN "rejectionReason",
ADD COLUMN     "approvedQuantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "decisionNotes" TEXT,
ADD COLUMN     "requestedQuantity" INTEGER NOT NULL;
