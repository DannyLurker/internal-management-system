import itemRepository from "@/features/items/item.repository";
import { locationRepository } from "@/features/locations/location.repository";
import StockMovementManagement from "@/features/stock-movements/components/StockMovementManagement";
import prisma from "@/shared/db/prisma";
import { MovementType } from "@prisma/client";

export default async function StockMovementsPage() {
  const [items, locations] = await Promise.all([
    itemRepository.getInitialData(prisma),
    locationRepository.getInitialData(prisma),
  ]);

  return (
    <StockMovementManagement
      items={items}
      locations={locations}
      // Removing LAUNDRY_IN from list
      movementTypes={Object.values(MovementType).filter(
        (val) => val !== "LAUNDRY_IN",
      )}
    />
  );
}
