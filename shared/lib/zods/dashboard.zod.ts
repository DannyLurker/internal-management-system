import z from "zod";
import { dataPerPage, page } from "./general.zod";

export const financialSummaryParamSchema = z.object({
  lowStockAlertPage: page,
  lowStockAlertDataPerPage: dataPerPage,
  flaggedExpiredStockPage: page,
  flaggedExpiredStockDataPerPage: dataPerPage,
  startDate: z.iso.datetime(),
  endDate: z.iso.datetime(),
});

export type FinancialSummaryParamSchema = z.infer<
  typeof financialSummaryParamSchema
>;
