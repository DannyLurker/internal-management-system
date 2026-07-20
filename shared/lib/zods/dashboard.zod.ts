import z from "zod";
import { dataPerPage, page } from "./general.zod";

export const managerDashboardParamSchema = z.object({
  lowStockAlertPagination: page,
  lowStockAlertDataPerPage: dataPerPage,
});

export type ManagerDashboardParamSchema = z.infer<
  typeof managerDashboardParamSchema
>;
