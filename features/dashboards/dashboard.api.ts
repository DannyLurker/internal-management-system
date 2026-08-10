import { api } from "@/shared/lib/api-client";
import { FinancialSummaryParamSchema } from "@/shared/lib/zods/dashboard.zod";
import { GetDashboardApiResponse } from "./dashboard.types";

const dashboardApi = {
  financialSummary: async (params: FinancialSummaryParamSchema) => {
    const result = await api.get<GetDashboardApiResponse>("/dashboards/", {
      params,
    });

    return result.data.data.financialSummary;
  },
};

export default dashboardApi;
