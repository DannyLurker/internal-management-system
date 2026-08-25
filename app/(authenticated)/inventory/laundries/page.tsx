import LaundryManagement from "@/features/laundry/components/LaundryManagement";
import { locationRepository } from "@/features/locations/location.repository";
import prisma from "@/shared/db/prisma";

export default async function LaundriesPage() {
  const locations = await locationRepository.getInitialData(prisma);

  return <LaundryManagement locations={locations} />;
}
