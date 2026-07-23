import { ManagerDashboardParamSchema } from "@/shared/lib/zods/dashboard.zod";
import { Prisma, PrismaClient } from "@prisma/client";
import { Session } from "next-auth";
import stockMovementsRepository, {
  createStockMovementWhereInput,
} from "../stock-movements/stock-movements.repository";
import itemRepository, {
  createItemWhereInput,
  createSelectItemData,
} from "../items/item.repository";
import { stockWhereInput } from "../stocks/stock.repository";

const dashboardService = {
  managerGetDashboard: async (
    session: Session["user"],
    params: ManagerDashboardParamSchema,
    prisma: Prisma.TransactionClient | PrismaClient,
  ) => {
    const totalSpendWhereInput = createStockMovementWhereInput({
      type: "RECEIVE",
    });

    const totalWastageValueWhereInput = createStockMovementWhereInput({
      OR: [
        {
          type: {
            in: [
              "DISCARD",
              "MARK_AS_DAMAGED",
              "MARK_AS_EXPIRED",
              "MARK_AS_LOST",
            ],
          },
        },
        {
          stock: {
            expiredAt: {
              lte: new Date(),
            },
          },
        },
      ],
    });

    const expiredStockWhere = stockWhereInput({
      type: "READY",
      expiredAt: {
        lte: new Date(),
      },
      quantity: {
        not: 0,
      },
    });

    const [
      totalSpend,
      totalStockWastageValue,
      groupedFlaggedExpiredStocks,
      totalExpiredCountGroup,
    ] = await Promise.all([
      stockMovementsRepository.calculateInventoryValue(
        totalSpendWhereInput,
        prisma,
      ),
      stockMovementsRepository.calculateInventoryValue(
        totalWastageValueWhereInput,
        prisma,
      ),
      prisma.stock.groupBy({
        by: ["itemId"],
        where: expiredStockWhere,
        orderBy: {
          _max: {
            updatedAt: "asc",
          },
        },
        skip:
          (params.flaggedExpiredStockPage - 1) *
          params.flaggedExpiredStockDataPerPage,
        take: params.flaggedExpiredStockDataPerPage,
      }),
      prisma.stock.groupBy({
        by: ["itemId"],
        where: expiredStockWhere,
      }),
    ]);

    const totalFlaggedExpiredItems = totalExpiredCountGroup.length;
    const totalFlaggedExpiredPages = Math.ceil(
      totalFlaggedExpiredItems / params.flaggedExpiredStockDataPerPage,
    );

    const itemIds = groupedFlaggedExpiredStocks.map((data) => data.itemId);

    let flaggedExpiredStocks: Array<{ id: string; name: string }> = [];

    if (itemIds.length > 0) {
      const itemFlaggedExpiredWhereInput = createItemWhereInput({
        id: { in: itemIds },
      });

      const itemFlaggedExpiredSelectData = createSelectItemData({
        id: true,
        name: true,
      });

      const rawItems = await itemRepository.findMany(
        itemFlaggedExpiredWhereInput,
        itemFlaggedExpiredSelectData,
        {},
        prisma,
      );

      // Re-map items to maintain the exact pagination order from groupBy
      const itemMap = new Map(rawItems.map((item) => [item.id, item]));
      flaggedExpiredStocks = itemIds.flatMap((id) => {
        const item = itemMap.get(id);
        return item ? [{ id: item.id, name: item.name }] : [];
      });
    }

    const totalInventoryValue =
      (totalSpend ?? 0) - (totalStockWastageValue ?? 0);

    const lowStockAlertOffset =
      (params.lowStockAlertPage - 1) * params.lowStockAlertDataPerPage;
    const lowStockAlertLimit = params.lowStockAlertDataPerPage;

    const lowStocks = await prisma.$queryRaw<{
      id: string;
      name: string;
      minThreshold: number;
      isActive: boolean;
      currentStock: number;
    }>`
      SELECT
        i."id",
        i."name",
        i."minThreshold",
        i."isActive",
        COALESCE(SUM(s."quantity"), 0) AS "currentStock"
      FROM "Item" i
      LEFT JOIN "Stock" s
        ON s."itemId" = i."id"
        AND s."type" = 'READY'
      WHERE i."isActive" = true
      GROUP BY
        i."id",
        i."name",
        i."minThreshold",
        i."isActive"
      HAVING COALESCE(SUM(s."quantity"), 0) <= i."minThreshold"
      LIMIT ${lowStockAlertLimit}
      OFFSET ${lowStockAlertOffset};
    `;

    return {
      message: "Manager dashboard data retrieved successfully",
      data: {
        totalSpend,
        totalInventoryValue,
        totalStockWastageValue,
        lowStocks,
        flaggedExpiredStocks: {
          items: flaggedExpiredStocks,
          pagination: {
            page: params.flaggedExpiredStockPage,
            dataPerPage: params.flaggedExpiredStockDataPerPage,
            totalItems: totalFlaggedExpiredItems,
            totalPages: totalFlaggedExpiredPages,
          },
        },
      },
    };
  },
};

export default dashboardService;
