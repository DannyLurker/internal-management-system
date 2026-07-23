import { api } from "@/shared/lib/api-client";
import { GetDashboardApiResponse } from "./dashboard.types";
import { ManagerDashboardParamSchema } from "@/shared/lib/zods/dashboard.zod";

const dashboardApi = {
    getManagerDashboard: async (params: ManagerDashboardParamSchema) => {
        return api.get<GetDashboardApiResponse>("/api/dashboards/manager", {
            params,
        });
    },
};

export default dashboardApi;
