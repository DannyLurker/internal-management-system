import { ManagerDashboardParamSchema } from "@/shared/lib/zods/dashboard.zod";
import { Prisma, PrismaClient } from "@prisma/client";
import { Session } from "next-auth";
import stockMovementsRepository, {
  createStockMovementWhereInput,
} from "../stock-movements/stock-movements.repository";

const dashboardService = {
  // Manager Dashboard
  managerGetDashboard: async (
    session: Session["user"],
    params: ManagerDashboardParamSchema,
    prisma: Prisma.TransactionClient | PrismaClient,
  ) => {
    const totalSpendWhereInput = createStockMovementWhereInput({
      type: "RECEIVE",
    });

    const totalWastageValueWhereInput = createStockMovementWhereInput({
      type: {
        in: ["DISCARD", "MARK_AS_DAMAGED", "MARK_AS_EXPIRED", "MARK_AS_LOST"],
      },
    });

    const [totalSpend, totalStockWastageValue] = await Promise.all([
      stockMovementsRepository.calculateInventoryValue(
        totalSpendWhereInput,
        prisma,
      ),
      stockMovementsRepository.calculateInventoryValue(
        totalWastageValueWhereInput,
        prisma,
      ),
    ]);

    const totalInventoryValue =
      (totalSpend ?? 0) - (totalStockWastageValue ?? 0);

    const lowStockAlertPage =
      (params.lowStockAlertPagination - 1) * params.lowStockAlertDataPerPage;

    const lowStockAlertDataPerPage = params.lowStockAlertDataPerPage;

    const lowStocks = prisma.$queryRaw`
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
    LIMIT ${lowStockAlertPage}
    OFFSET ${lowStockAlertDataPerPage};
    `;

    return {
      totalSpend,
      totalInventoryValue,
      totalStockWastageValue,
      lowStocks,
    };
  },
};

export default dashboardService;
