/*
  Warnings:

  - Added the required column `destinationLocationId` to the `StockRequest` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `role` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'HOTEL_MANAGER', 'SUPERVISOR', 'ACCOUNTANT', 'HOUSEKEEPING', 'FRONT_DESK');

-- CreateEnum
CREATE TYPE "StockRequestType" AS ENUM ('ISSUE', 'RESTOCK', 'TRANSFER');

-- AlterEnum
ALTER TYPE "LocationType" ADD VALUE 'GUEST_ROOM';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "StockRequestStatus" ADD VALUE 'FULFILLED';
ALTER TYPE "StockRequestStatus" ADD VALUE 'CANCELLED';

-- AlterTable
ALTER TABLE "StockRequest" ADD COLUMN     "destinationLocationId" TEXT NOT NULL,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "sourceLocationId" TEXT,
ADD COLUMN     "type" "StockRequestType" NOT NULL DEFAULT 'ISSUE';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL;

-- DropEnum
DROP TYPE "Roles";

-- AddForeignKey
ALTER TABLE "StockRequest" ADD CONSTRAINT "StockRequest_sourceLocationId_fkey" FOREIGN KEY ("sourceLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockRequest" ADD CONSTRAINT "StockRequest_destinationLocationId_fkey" FOREIGN KEY ("destinationLocationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
