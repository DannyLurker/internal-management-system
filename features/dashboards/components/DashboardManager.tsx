"use client";
import { formatPrice } from "@/shared/lib/formatter";

import { useState } from "react";
import { useSession } from "next-auth/react";

import { resolveDateRange } from "./sub-components/DateFilterDropdown";
import { DateFilterOption, DateFilterRange } from "../dashboard.types";
import { useManagerDashboard } from "../dashboard.hooks";
import { dashboardStyles } from "../dashboard.styles";
import DashboardHeader from "./sub-components/DashboardHeader";
import KPICard from "./sub-components/KPICard";
import {
  ClipboardCheck,
  PackageMinus,
  Shirt,
  ShoppingBag,
  TrendingDown,
  Wallet,
} from "lucide-react";
import LowStockTable from "./sub-components/LowStockTable";
import FlaggedExpiredTable from "./sub-components/FlaggedExpiredTable";

// ── Default filter: last 7 days ───────────────────────────────────────────────
const DEFAULT_FILTER: DateFilterOption = "last7";
const DEFAULT_RANGE: DateFilterRange = resolveDateRange(DEFAULT_FILTER);

export default function DashboardManager() {
  const { data: session } = useSession();

  // ── Date filter state ────────────────────────────────────────────────────
  const [filterOption, setFilterOption] =
    useState<DateFilterOption>(DEFAULT_FILTER);
  const [dateRange, setDateRange] = useState<DateFilterRange>(DEFAULT_RANGE);

  const handleFilterChange = (
    option: DateFilterOption,
    range: DateFilterRange,
  ) => {
    setFilterOption(option);
    setDateRange(range);
  };

  // ── Data fetching ────────────────────────────────────────────────────────
  // startDate / endDate are passed as ISO strings; the Zod schema on the API
  // route coerces them back to validated date strings before reaching the service.
  const { data } = useManagerDashboard({
    lowStockAlertPage: 1,
    lowStockAlertDataPerPage: 10,
    flaggedExpiredStockPage: 1,
    flaggedExpiredStockDataPerPage: 10,
    startDate: dateRange.startDate.toISOString(),
    endDate: dateRange.endDate.toISOString(),
  });

  const totalValue = data?.data?.totalInventoryValue ?? 0;
  const totalSpend = data?.data?.totalSpend ?? 0;
  const totalWastage = data?.data?.totalStockWastageValue ?? 0;
  const totalConsume = data?.data?.totalConsume ?? 0;
  const totalSale = data?.data?.totalSale ?? 0;
  const totalLaundryOut = data?.data?.totalLaundryOutStock ?? 0;

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
      <DashboardHeader
        filterOption={filterOption}
        onFilterChange={handleFilterChange}
      />

      <div>
        <div className={dashboardStyles.kpiGrid}>
          <KPICard
            label="Total Inventory Value"
            value={formatPrice(totalValue)}
            description="Monetary value of unexpired, ready-to-use stock"
            icon={<Wallet className="w-5 h-5" />}
          />
          <KPICard
            label="Total Spend"
            value={formatPrice(totalSpend)}
            description="Total procurement expenses from received stock shipments"
            icon={<TrendingDown className="w-5 h-5" />}
          />
          <KPICard
            label="Total Stock Wastage"
            value={formatPrice(totalWastage)}
            description="Combined loss from expired, lost, or damaged items"
            icon={<PackageMinus className="w-5 h-5" />}
          />
          <KPICard
            label="Total Consumed"
            value={formatPrice(totalConsume)}
            description="Items consumed for internal operations and housekeeping"
            icon={<ClipboardCheck className="w-5 h-5" />}
          />
          <KPICard
            label="Total Sales"
            value={formatPrice(totalSale)}
            description="Cost of goods sold (COGS) for direct customer sales"
            icon={<ShoppingBag className="w-5 h-5" />}
          />
          <KPICard
            label="Total Laundry Out Stock"
            value={totalLaundryOut.toString()}
            description="Linens and fabrics sent out to laundry facilities"
            icon={<Shirt className="w-5 h-5" />}
          />
        </div>

        <div className="flex flex-col gap-6">
          <LowStockTable />
          <FlaggedExpiredTable />
        </div>
      </div>
    </div>
  );
}
