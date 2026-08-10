import z from "zod";
import { dataPerPage, page } from "./general.zod";

/**
 * Ensures "2026-1-1" is transformed into "2026-01-01"
 */
const padIsoDateString = (val?: string) => {
  if (!val) return undefined;
  const parts = val.split("-");
  if (parts.length !== 3) return val;
  const [year, month, day] = parts;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

export const financialSummaryParamSchema = z.object({
  lowStockAlertPage: page,
  lowStockAlertDataPerPage: dataPerPage,
  flaggedExpiredStockPage: page,
  flaggedExpiredStockDataPerPage: dataPerPage,

  /** YYYY-MM-DD date string – inclusive lower bound */
  startDate: z
    .string()
    .transform(padIsoDateString)
    .pipe(z.iso.date())
    .optional(),

  /** YYYY-MM-DD date string – inclusive upper bound */
  endDate: z.string().transform(padIsoDateString).pipe(z.iso.date()).optional(),
});

export type FinancialSummaryParamSchema = z.infer<
  typeof financialSummaryParamSchema
>;
