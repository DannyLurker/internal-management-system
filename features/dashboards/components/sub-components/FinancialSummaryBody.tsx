"use client";

import { useSession } from "next-auth/react";
import { formatPrice } from "@/shared/lib/formatter";
import {
  ClipboardCheck,
  PackageMinus,
  Shirt,
  ShoppingBag,
  TrendingDown,
  Wallet,
} from "lucide-react";

import { dashboardStyles } from "../../dashboard.styles";
import KPICard from "./KPICard";
import { useFinancialSummary } from "../../dashboard.hooks";
import { DateFilterRange } from "../../dashboard.types";

type FinancialSummaryProps = {
  dateRange: DateFilterRange;
};

export default function FinancialSummaryBody({
  dateRange,
}: FinancialSummaryProps) {
  const { data: session } = useSession();

  const { data } = useFinancialSummary({
    lowStockAlertPage: 1,
    lowStockAlertDataPerPage: 10,
    flaggedExpiredStockPage: 1,
    flaggedExpiredStockDataPerPage: 10,
    startDate: dateRange.startDate.toISOString(),
    endDate: dateRange.endDate.toISOString(),
  });

  const totalValue = data?.totalInventoryValue ?? 0;
  const totalSpend = data?.totalSpend ?? 0;
  const totalWastage = data?.totalStockWastageValue ?? 0;
  const totalConsume = data?.totalConsume ?? 0;
  const totalSale = data?.totalSale ?? 0;
  const totalLaundryOut = data?.totalLaundryOutStock ?? 0;

  if (session?.user.role !== "HOTEL_MANAGER") {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <h1 className={dashboardStyles.headerTitle}>You can't access this</h1>
      </div>
    );
  }

  return (
    <div className={dashboardStyles.kpiGrid}>
      <KPICard
        label="Total Inventory Value"
        value={formatPrice(totalValue)}
        description="Monetary value of unexpired, ready-to-use stock"
        icon={<Wallet className="h-5 w-5" />}
      />

      <KPICard
        label="Total Spend"
        value={formatPrice(totalSpend)}
        description="Total procurement expenses from received stock shipments"
        icon={<TrendingDown className="h-5 w-5" />}
      />

      <KPICard
        label="Total Stock Wastage"
        value={formatPrice(totalWastage)}
        description="Combined loss from expired, lost, or damaged items"
        icon={<PackageMinus className="h-5 w-5" />}
      />

      <KPICard
        label="Total Consumed"
        value={formatPrice(totalConsume)}
        description="Items consumed for internal operations and housekeeping"
        icon={<ClipboardCheck className="h-5 w-5" />}
      />

      <KPICard
        label="Total Sales"
        value={formatPrice(totalSale)}
        description="Cost of goods sold (COGS) for direct customer sales"
        icon={<ShoppingBag className="h-5 w-5" />}
      />

      <KPICard
        label="Total Laundry Out Stock"
        value={totalLaundryOut.toString()}
        description="Linens and fabrics sent out to laundry facilities"
        icon={<Shirt className="h-5 w-5" />}
      />
    </div>
  );
}
