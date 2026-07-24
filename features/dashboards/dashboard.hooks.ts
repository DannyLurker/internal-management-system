import { useQuery } from "@tanstack/react-query";
import dashboardApi from "./dashboard.api";
import { dashboardKeys } from "./dashboard.keys";
import { ManagerDashboardParamSchema } from "@/shared/lib/zods/dashboard.zod";

export const useManagerDashboard = (params: ManagerDashboardParamSchema) => {
  return useQuery({
    queryKey: dashboardKeys.manager(params),
    queryFn: () => dashboardApi.getManagerDashboard(params),
    staleTime: 5 * 60 * 1000,
  });
};
