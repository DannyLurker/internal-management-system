"use client";
import { dashboardStyles } from "../dashboard.styles";
import DashboardHeader from "./DashboardHeader";
import KPICard from "./KPICard";
import LowStockTable from "./LowStockTable";
import FlaggedExpiredTable from "./FlaggedExpiredTable";
import { Wallet, PackageMinus, TrendingDown } from "lucide-react";
import { useManagerDashboard } from "../dashboard.hooks";
import { formatPrice } from "@/shared/lib/formatter";

export default function DashboardClient() {
  const { data } = useManagerDashboard({
    lowStockAlertPage: 1,
    lowStockAlertDataPerPage: 10,
    flaggedExpiredStockPage: 1,
    flaggedExpiredStockDataPerPage: 10,
  });

  const totalValue = data?.data?.data?.totalInventoryValue ?? 0;
  const totalSpend = data?.data?.data?.totalSpend ?? 0;
  const totalWastage = data?.data?.data?.totalStockWastageValue ?? 0;

  return (
    <div className={dashboardStyles.pageContainer}>
      <DashboardHeader />

      <div className={dashboardStyles.kpiGrid}>
        <KPICard
          label="Total Inventory Value"
          value={formatPrice(totalValue)}
          icon={<Wallet className="w-5 h-5" />}
        />
        <KPICard
          label="Total Spend"
          value={formatPrice(totalSpend)}
          icon={<TrendingDown className="w-5 h-5" />}
        />
        <KPICard
          label="Total Stock Wastage"
          value={formatPrice(totalWastage)}
          icon={<PackageMinus className="w-5 h-5" />}
        />
      </div>

      <div className="flex flex-col gap-6">
        <LowStockTable />
        <FlaggedExpiredTable />
      </div>
    </div>
  );
}
