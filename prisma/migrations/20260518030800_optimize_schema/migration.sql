/*
  Warnings:

  - The values [PRODUCT] on the enum `Entity` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `totalCost` to the `StockMovement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Entity_new" AS ENUM ('USER', 'ACCOUNT', 'SESSION', 'VERIFICATION_TOKEN', 'CATEGORY', 'ITEM', 'STOCK', 'STOCK_MOVEMENT', 'ORDER', 'ORDER_ITEM');
ALTER TABLE "AuditLog" ALTER COLUMN "entity" TYPE "Entity_new" USING ("entity"::text::"Entity_new");
ALTER TYPE "Entity" RENAME TO "Entity_old";
ALTER TYPE "Entity_new" RENAME TO "Entity";
DROP TYPE "public"."Entity_old";
COMMIT;

-- AlterEnum
ALTER TYPE "MovementType" ADD VALUE 'SALE';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Roles" ADD VALUE 'SUPERVISOR';
ALTER TYPE "Roles" ADD VALUE 'ACCOUNTANT';

-- AlterTable
ALTER TABLE "StockMovement" ADD COLUMN     "totalCost" DECIMAL(65,30) NOT NULL;
