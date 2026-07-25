import { api } from "@/shared/lib/api-client";
import { GetDashboardApiResponse } from "./dashboard.types";
import { ManagerDashboardParamSchema } from "@/shared/lib/zods/dashboard.zod";

const dashboardApi = {
  getManagerDashboard: async (params: ManagerDashboardParamSchema) => {
    const result = await api.get<GetDashboardApiResponse>("/dashboards/", {
      params,
    });

    return result.data;
  },
};

export default dashboardApi;
