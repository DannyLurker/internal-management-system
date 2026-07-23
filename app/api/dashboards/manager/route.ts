import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dashboardService from "@/features/dashboards/dashboard.service";
import prisma from "@/shared/db/prisma";
import { managerDashboardParamSchema } from "@/shared/lib/zods/dashboard.zod";
import { handleServiceError } from "@/shared/lib/utils";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const parsedParams = managerDashboardParamSchema.parse({
            lowStockAlertPage: searchParams.get("lowStockAlertPage") || "1",
            lowStockAlertDataPerPage: searchParams.get("lowStockAlertDataPerPage") || "10",
            flaggedExpiredStockPage: searchParams.get("flaggedExpiredStockPage") || "1",
            flaggedExpiredStockDataPerPage: searchParams.get("flaggedExpiredStockDataPerPage") || "10",
        });

        const result = await dashboardService.managerGetDashboard(
            session.user,
            parsedParams,
            prisma,
        );

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return handleServiceError(error);
    }
}
