"use client";

import { dashboardStyles } from "../../dashboard.styles";
import DateFilterDropdown from "./DateFilterDropdown";
import { DateFilterOption, DateFilterRange } from "../../dashboard.types";

interface DashboardHeaderProps {
  /** Active filter selection passed down from DashboardManager */
  filterOption: DateFilterOption;
  /** Callback to bubble the chosen option + resolved date range up */
  onFilterChange: (option: DateFilterOption, range: DateFilterRange) => void;
}

export default function DashboardHeader({
  filterOption,
  onFilterChange,
}: DashboardHeaderProps) {
  return (
    <header className={dashboardStyles.headerContainer}>
      <div className="max-w-2xl">
        <h1 className={dashboardStyles.headerTitle}>Dashboard</h1>
        <p className="mt-2 font-ochre-brand text-sm italic leading-relaxed text-[#524439] md:text-base">
          Monitor key performance indicators and critical stock alerts across
          your luxury properties.
        </p>
      </div>

      {/* Date filter control lives in the header actions area */}
      <div className={dashboardStyles.headerActions}>
        <DateFilterDropdown
          value={filterOption}
          onFilterChange={onFilterChange}
        />
      </div>
    </header>
  );
}
