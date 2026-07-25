import { ManagerDashboardParamSchema } from "@/shared/lib/zods/dashboard.zod";
import { Prisma, PrismaClient } from "@prisma/client";
import { Session } from "next-auth";
import stockMovementsRepository, {
  createStockMovementWhereInput,
} from "../stock-movements/stock-movements.repository";
import {
  stockRepository,
  stockSelectData,
  stockWhereInput,
} from "../stocks/stock.repository";

const dashboardService = {
  getFinancialSummary: async (
    session: Session["user"],
    params: ManagerDashboardParamSchema,
    prisma: Prisma.TransactionClient | PrismaClient,
  ) => {
    const totalSpendWhereInput = createStockMovementWhereInput({
      OR: [{ type: "RECEIVE" }, { type: "ADJUSTMENT", totalCost: { gt: 0 } }],
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
        { type: "ADJUSTMENT", totalCost: { lt: 0 } },
      ],
    });

    const totalInventoryValueWhereInput = stockWhereInput({
      type: "READY",
      OR: [
        {
          expiredAt: {
            gte: new Date(),
          },
        },
        {
          expiredAt: {
            equals: null,
          },
        },
      ],

      quantity: {
        gte: 0,
      },
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

    const expiredStockSelectData = stockSelectData({
      id: true,
      item: {
        select: {
          name: true,
        },
      },
      location: {
        select: {
          name: true,
        },
      },
      expiredAt: true,
      quantity: true,
    }) satisfies Prisma.StockSelect;

    const [
      totalSpend,
      totalStockWastageValue,
      totalInventoryValue,
      flaggedExpiredStocks,
      totalExpiredCount,
    ] = await Promise.all([
      stockMovementsRepository.calculateInventoryValue(
        totalSpendWhereInput,
        prisma,
      ),
      stockMovementsRepository.calculateInventoryValue(
        totalWastageValueWhereInput,
        prisma,
      ),
      stockRepository.totalInventoryValue(
        totalInventoryValueWhereInput,
        prisma,
      ),
      stockRepository.findMany(
        expiredStockWhere,
        expiredStockSelectData,
        {
          orderBy: {
            expiredAt: "asc",
          },
          skip: (params.flaggedExpiredStockPage - 1) * 10,
          take: params.flaggedExpiredStockDataPerPage,
        },
        prisma,
      ),
      stockRepository.countRows(expiredStockWhere, prisma),
    ]);

    const lowStockAlertOffset =
      (params.lowStockAlertPage - 1) * params.lowStockAlertDataPerPage;
    const lowStockAlertLimit = params.lowStockAlertDataPerPage;

    const lowStocks = await stockRepository.getLowStocks(
      lowStockAlertLimit,
      lowStockAlertOffset,
      prisma,
    );

    const [{ count }] = await stockRepository.getTotalLowStocks(prisma);

    const totalLowStockItems = Number(count);
    return {
      message: "Manager dashboard data retrieved successfully",
      data: {
        totalSpend,
        totalInventoryValue,
        totalStockWastageValue,
        lowStockData: lowStocks,
        totalLowStockCount: totalLowStockItems,
        flaggedExpiredStocks: {
          flaggedExpiredStockData: flaggedExpiredStocks,
          totalExpiredCount,
        },
      },
    };
  },
};

export default dashboardService;
