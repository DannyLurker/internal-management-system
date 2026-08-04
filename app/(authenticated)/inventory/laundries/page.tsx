import LaundryManagement from "@/features/laundries/components/LaundryManagement";
import prisma from "@/shared/db/prisma";

export default async function LaundriesPage() {
  const locations = await prisma.location.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return <LaundryManagement locations={locations} />;
}
