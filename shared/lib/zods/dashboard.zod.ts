import z from "zod";
import { dataPerPage, page } from "./general.zod";

export const financialSummaryParamSchema = z.object({
  lowStockAlertPage: page,
  lowStockAlertDataPerPage: dataPerPage,
  flaggedExpiredStockPage: page,
  flaggedExpiredStockDataPerPage: dataPerPage,
  /** ISO 8601 date string – inclusive lower bound for KPI date-range filters */
  startDate: z.string().datetime({ offset: true }).optional(),
  /** ISO 8601 date string – inclusive upper bound for KPI date-range filters */
  endDate: z.string().datetime({ offset: true }).optional(),
});

export type FinancialSummaryParamSchema = z.infer<
  typeof financialSummaryParamSchema
>;
