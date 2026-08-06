import ItemManagement from "@/features/items/components/ItemManagement";
import { locationRepository } from "@/features/locations/location.repository";
import prisma from "@/shared/db/prisma";

export default async function ItemsPage() {
  const locations = await locationRepository.getInitialData(prisma);

  return <ItemManagement locations={locations} />;
}
