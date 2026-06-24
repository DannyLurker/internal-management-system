-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_updatedBy_fkey";

-- AlterTable
ALTER TABLE "Stock" ALTER COLUMN "updatedBy" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
