import ItemManagement from "@/features/items/components/ItemManagement";
import prisma from "@/shared/db/prisma";

export default async function ItemsPage() {
  const locations = await prisma.location.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return <ItemManagement locations={locations} />;
}
