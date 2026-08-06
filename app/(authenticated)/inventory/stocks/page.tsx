import itemRepository from "@/features/items/item.repository";
import { locationRepository } from "@/features/locations/location.repository";
import StockManagement from "@/features/stocks/components/StockManagement";
import stockService from "@/features/stocks/stock.service";
import prisma from "@/shared/db/prisma";
import sessionValidation from "@/shared/lib/validations/user-session-validation";

export default async function StocksPage() {
  const session = await sessionValidation();

  const locations = await locationRepository.getInitialData(prisma);

  const items = await itemRepository.getInitialData(prisma);

  const initialStocksResult = await stockService.getMany(
    session,
    {
      page: 1,
      dataPerPage: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
    },
    prisma,
  );

  return (
    <StockManagement
      initialStocks={initialStocksResult.data}
      locations={locations}
      items={items}
    />
  );
}
