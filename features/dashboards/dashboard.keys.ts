import { ManagerDashboardParamSchema } from "@/shared/lib/zods/dashboard.zod";

export const dashboardKeys = {
    manager: (params: ManagerDashboardParamSchema) => ["dashboard", "manager", params],
}

