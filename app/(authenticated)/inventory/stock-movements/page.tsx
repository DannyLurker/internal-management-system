import StockMovementManagement from "@/features/stock-movements/components/StockMovementManagement";
import prisma from "@/shared/db/prisma";
import { MovementType } from "@prisma/client";

export default async function StockMovementsPage() {
  const [items, locations] = await Promise.all([
    prisma.item.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.location.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
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
