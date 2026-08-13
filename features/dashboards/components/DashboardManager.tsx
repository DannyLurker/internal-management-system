"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

import { dashboardStyles } from "../dashboard.styles";
import LowStockTable from "./sub-components/LowStockTable";
import FlaggedExpiredTable from "./sub-components/FlaggedExpiredTable";
import { DateFilterOption, DateFilterRange } from "../dashboard.types";
import { resolveDateRange } from "./sub-components/DateFilterDropdown";
import FinancialSummaryHeader from "./sub-components/FinancialSummaryHeader";
import FinancialSummaryBody from "./sub-components/FinancialSummaryBody";

const DEFAULT_FILTER: DateFilterOption = "last7";
const DEFAULT_RANGE: DateFilterRange = resolveDateRange(DEFAULT_FILTER);

export default function DashboardManager() {
  const { data: session } = useSession();

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

  if (session?.user.role !== "HOTEL_MANAGER") {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <h1 className={dashboardStyles.headerTitle}>You can't access this</h1>
      </div>
    );
  }

  return (
    <div className={dashboardStyles.pageContainer}>
      <FinancialSummaryHeader
        dateRange={dateRange}
        filterOption={filterOption}
        onFilterChange={handleFilterChange}
      />

      <FinancialSummaryBody dateRange={dateRange} />

      <LowStockTable />

      <FlaggedExpiredTable />
    </div>
  );
}
