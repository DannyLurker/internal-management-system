import dashboardService from "@/features/dashboards/dashboard.service";
import prisma from "@/shared/db/prisma";
import { forbidden } from "@/shared/lib/error-handlers";
import {
  handleError,
  printConsoleError,
} from "@/shared/lib/error-handlers/handleError";
import { inngest } from "@/shared/lib/inngest";
import { canPrintReport } from "@/shared/lib/validations/user-access-validation";
import sessionValidation from "@/shared/lib/validations/user-session-validation";
import { reportGenerateSchema } from "@/shared/lib/zods/report.zod";

export async function POST(req: Request) {
  try {
    const session = await sessionValidation();

    if (!canPrintReport(session.role)) {
      throw forbidden("You're not allowed to access this feature.");
    }

    const body = await req.json();
    const data = reportGenerateSchema.parse(body);

    const financialSummary = await dashboardService.getFinancialSummary(
      session,
      {
        flaggedExpiredStockDataPerPage: 100,
        flaggedExpiredStockPage: 1,
        lowStockAlertDataPerPage: 100,
        lowStockAlertPage: 1,
        startDate: data.dateFrom,
        endDate: data.dateTo,
      },
      prisma,
    );

    await inngest.send({
      name: "report/generate",
      data: {
        data: financialSummary,
        requestedById: session.id,
        recipientEmail: data.recipientEmail,
        dateFrom: data.dateFrom,
        dateTo: data.dateTo,
      },
    });

    return Response.json(
      {
        message:
          "Report generation initiated. We're going to send you an email with the report attached.",
      },
      { status: 202 },
    );
  } catch (error) {
    printConsoleError(error, "POST", req.url);
    return handleError(error);
  }
}
