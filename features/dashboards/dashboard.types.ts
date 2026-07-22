import { ApiResponse } from "@/shared/lib/api-client";
import dashboardService from "./dashboard.service";

type GetManagerDashboardServiceResult = Awaited<
  ReturnType<typeof dashboardService.managerGetDashboard>
>;

export type GetDashboardApiResponse = ApiResponse<
  GetManagerDashboardServiceResult["data"]
>;
