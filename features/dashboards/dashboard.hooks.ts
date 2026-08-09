import { useQuery } from "@tanstack/react-query";
import dashboardApi from "./dashboard.api";
import { dashboardKeys } from "./dashboard.keys";
import { FinancialSummaryParamSchema } from "@/shared/lib/zods/dashboard.zod";

export const useFinancialSummary = (params: FinancialSummaryParamSchema) => {
  return useQuery({
    queryKey: dashboardKeys.financialSummary(params),
    queryFn: () => dashboardApi.financialSummary(params),
    staleTime: 5 * 60 * 1000,
  });
};
