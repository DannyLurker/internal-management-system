import { GetFinancialSummaryServiceResult } from "@/features/dashboards/dashboard.types";
import z from "zod";

export const reportGenerateSchema = z.object({
  recipientEmail: z.email(),
  dateFrom: z.string(),
  dateTo: z.string(),
});

export type ReportGenerateSchema = z.infer<typeof reportGenerateSchema> & {
  data: GetFinancialSummaryServiceResult;
};
