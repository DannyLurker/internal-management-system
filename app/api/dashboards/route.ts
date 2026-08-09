import dashboardService from "@/features/dashboards/dashboard.service";
import { GetDashboardApiResponse } from "@/features/dashboards/dashboard.types";
import prisma from "@/shared/db/prisma";
import { forbidden } from "@/shared/lib/error-handlers";
import {
  handleError,
  printConsoleError,
} from "@/shared/lib/error-handlers/handleError";
import { canAccessManagerDashboard } from "@/shared/lib/validations/user-access-validation";
import sessionValidation from "@/shared/lib/validations/user-session-validation";
import { financialSummaryParamSchema } from "@/shared/lib/zods/dashboard.zod";

export async function GET(req: Request) {
  try {
    const session = await sessionValidation();

    if (!canAccessManagerDashboard(session.role)) {
      throw forbidden("You're not allowed to access this feature.");
    }

    const { searchParams } = new URL(req.url);

    const rawParamsSchema = Object.fromEntries(searchParams.entries());
    const params = financialSummaryParamSchema.parse(rawParamsSchema);

    let response: GetDashboardApiResponse;

    switch (session.role) {
      case "HOTEL_MANAGER":
        const managerDashboardData = await dashboardService.getFinancialSummary(
          session,
          params,
          prisma,
        );

        response = {
          message: managerDashboardData.message,
          data: managerDashboardData.data,
          status: 200,
        };
        break;

      case "ACCOUNTANT":
        const accountantDashboardData =
          await dashboardService.getFinancialSummary(session, params, prisma);

        response = {
          message: accountantDashboardData.message,
          data: accountantDashboardData.data,
          status: 200,
        };
        break;

      default:
        throw forbidden("You're not allowed to access this feature.");
    }

    return Response.json(response, { status: response.status });
  } catch (error) {
    printConsoleError(error, "GET", req.url);
    return handleError(error);
  }
}
