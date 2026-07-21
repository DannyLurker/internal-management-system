import { ManagerDashboardParamSchema } from "@/shared/lib/zods/dashboard.zod";
import { Prisma, PrismaClient } from "@prisma/client";
import { Session } from "next-auth";
import stockMovementsRepository from "../stock-movements/stock-movements.repository";

const dashboardService = {
  // Manager Dashboard
  // managerGetDashboard: async (
  //   session: Session["user"],
  //   params: ManagerDashboardParamSchema,
  //   prisma: Prisma.TransactionClient | PrismaClient,
  // ) => {
  //   const [totalInventoryValue, totalSpend, totalStockWastageValue] =  Promise.all([
  //       await stockMovementsRepository.
  //   ])
  // },
};

export default dashboardService;
