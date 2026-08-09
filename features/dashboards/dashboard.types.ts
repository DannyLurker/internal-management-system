import { ApiResponse } from "@/shared/lib/api-client";
import dashboardService from "./dashboard.service";

export type GetFinancialSummaryServiceResult = Awaited<
  ReturnType<typeof dashboardService.getFinancialSummary>
>;

export type GetDashboardApiResponse = ApiResponse<
  GetFinancialSummaryServiceResult["data"]
>;

/**
 * Identifies a specific preset timeframe or a particular calendar month.
 * Values prefixed with "month-" use the format "month-<0-indexed-month>"
 * (e.g. "month-0" = January, "month-11" = December).
 */
export type DateFilterOption =
  | "last7"
  | "last14"
  | "last30"
  | "last90"
  | "last180"
  | "last365"
  | `month-${number}`;

/** Resolved absolute Date boundaries for a chosen DateFilterOption. */
export type DateFilterRange = {
  startDate: Date;
  endDate: Date;
};
