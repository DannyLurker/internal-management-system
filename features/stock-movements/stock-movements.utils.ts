import { Prisma } from "@prisma/client";
import {
  MOVEMENT_TYPE_BY_TARGET,
  Session,
  StockRecord,
  TargetStockType,
} from "./stock-movements.types";
import { badRequest } from "@/shared/lib/error-handlers";
import { stockRepository } from "../stocks/stock.repository";
import stockMovementsRepository from "./stock-movements.repository";

/**
 * Shared implementation for MARK_AS_DAMAGED / MARK_AS_DIRTY / MARK_AS_LOST /
 * MARK_AS_EXPIRED. All four follow the same shape:
 *   1. Validate there's enough quantity on the source stock.
 *   2. Decrement the source stock.
 *   3. Find-or-create the destination stock row of `targetType` at the same
 *      location/expiry, and increment it.
 *   4. Record a stock movement pointing at the destination stock, with the
 *      source/destination location both forced to the current stock's
 *      location (this is an in-place reclassification, not a physical move).
 */
export async function markStockAs(
  currentStock: StockRecord,
  targetType: TargetStockType,
  quantity: number,
  session: Session,
  createdStockMovement: Prisma.StockMovementUncheckedCreateInput,
  tx: Prisma.TransactionClient,
) {
  const remaining = currentStock.quantity - quantity;
  if (remaining < 0) throw badRequest("Insufficient stock quantity.");

  await stockRepository.update(
    currentStock.id,
    { quantity: { decrement: quantity } },
    tx,
  );

  const targetStock = await stockRepository.findOrUpdateOrCreate(
    // Find
    {
      itemId: currentStock.itemId,
      locationId: currentStock.locationId,
      type: targetType,
      expiredAt: currentStock.expiredAt,
    },
    // Update
    { quantity: { increment: quantity } },
    // Create
    {
      item: { connect: { id: currentStock.itemId } },
      location: { connect: { id: currentStock.locationId } },
      creator: { connect: { id: session.id } },
      quantity,
      type: targetType,
      expiredAt: currentStock.expiredAt,
    },
    tx,
  );

  return stockMovementsRepository.create(
    {
      ...createdStockMovement,
      stockId: targetStock.id,
      type: MOVEMENT_TYPE_BY_TARGET[targetType],
      sourceLocationId: currentStock.locationId,
      destinationLocationId: currentStock.locationId,
    },
    tx,
  );
}

export function formatMovementLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}


