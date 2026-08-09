import { FinancialSummaryParamSchema } from "@/shared/lib/zods/dashboard.zod";

export const dashboardKeys = {
  financialSummary: (params?: FinancialSummaryParamSchema) => [
    "dashboard",
    "financialSummary",
    ...(params ? [{ params }] : []),
  ],
};
