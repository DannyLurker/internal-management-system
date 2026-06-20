-- DropIndex
DROP INDEX "Stock_itemId_locationId_type_expiredAt_key";

-- CreateIndex
CREATE INDEX "Stock_itemId_locationId_type_expiredAt_idx" ON "Stock"("itemId", "locationId", "type", "expiredAt");
