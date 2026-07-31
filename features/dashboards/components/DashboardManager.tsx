"use client";
import { useSession } from "next-auth/react";
import { dashboardStyles } from "../dashboard.styles";
import DashboardHeader from "./sub-components/DashboardHeader";
import LowStockTable from "./sub-components/LowStockTable";
import FlaggedExpiredTable from "./sub-components/FlaggedExpiredTable";
import FinancialSummary from "./sub-components/FinancialSummary";

export default function DashboardManager() {
  const { data: session } = useSession();

  if (session?.user.role !== "HOTEL_MANAGER") {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <h1 className={dashboardStyles.headerTitle}>You can't access this</h1>
      </div>
    );
  }

  return (
    <div className={dashboardStyles.pageContainer}>
      {/* DashboardHeader now owns the date-filter dropdown */}
      <DashboardHeader />

      <FinancialSummary />

      <LowStockTable />

      <FlaggedExpiredTable />
    </div>
  );
}
