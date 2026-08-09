import { api } from "@/shared/lib/api-client";
import { GetFinancialSummaryApiResponse } from "./dashboard.types";
import { FinancialSummaryParamSchema } from "@/shared/lib/zods/dashboard.zod";

const dashboardApi = {
  financialSummary: async (params: FinancialSummaryParamSchema) => {
    const result = await api.get<GetFinancialSummaryApiResponse>(
      "/dashboards/",
      {
        params,
      },
    );

    return result.data;
  },
};

export default dashboardApi;
