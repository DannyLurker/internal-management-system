import z from "zod";
import { dataPerPage, page } from "./general.zod";

export const managerDashboardParamSchema = z.object({
  lowStockAlertPage: page,
  lowStockAlertDataPerPage: dataPerPage,
  flaggedExpiredStockPage: page,
  flaggedExpiredStockDataPerPage: dataPerPage,
});

export type ManagerDashboardParamSchema = z.infer<
  typeof managerDashboardParamSchema
>;
