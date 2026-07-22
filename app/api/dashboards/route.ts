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
import { managerDashboardParamSchema } from "@/shared/lib/zods/dashboard.zod";

export async function GET(req: Request) {
  try {
    const session = await sessionValidation();

    if (!canAccessManagerDashboard(session.role)) {
      throw forbidden("You're not allowed to access this feature.");
    }

    const { searchParams } = new URL(req.url);

    const rawParamsSchema = Object.fromEntries(searchParams.entries());
    const params = managerDashboardParamSchema.parse(rawParamsSchema);

    let response: GetDashboardApiResponse;

    switch (session.role) {
      case "HOTEL_MANAGER":
        const result = await dashboardService.managerGetDashboard(
          session,
          params,
          prisma,
        );

        response = {
          message: result.message,
          data: result.data,
          status: 200,
        };
        break;

      default:
        throw forbidden("You're not allowed to access this feature.");
    }

    return Response.json(response, { status: 200 });
  } catch (error) {
    printConsoleError(error, "GET", req.url);
    return handleError(error);
  }
}
