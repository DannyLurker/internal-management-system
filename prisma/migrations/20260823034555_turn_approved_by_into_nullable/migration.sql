-- DropForeignKey
ALTER TABLE "StockRequest" DROP CONSTRAINT "StockRequest_approvedById_fkey";

-- AlterTable
ALTER TABLE "StockRequest" ALTER COLUMN "approvedById" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "StockRequest" ADD CONSTRAINT "StockRequest_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
