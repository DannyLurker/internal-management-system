"use client";

import { FileDown } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

import { dashboardStyles } from "../../dashboard.styles";
import DateFilterDropdown from "./DateFilterDropdown";
import { DateFilterOption, DateFilterRange } from "../../dashboard.types";
import { useCreatePdfReport } from "@/features/reports/report.hooks";

type DashboardHeaderProps = {
  dateRange: DateFilterRange;
  filterOption: DateFilterOption;
  onFilterChange: (option: DateFilterOption, range: DateFilterRange) => void;
};

export default function DashboardHeader({
  dateRange,
  filterOption,
  onFilterChange,
}: DashboardHeaderProps) {
  const generateReportMutation = useCreatePdfReport();

  const generateReport = () => {
    generateReportMutation.mutateAsync({
      dateFrom: dateRange.startDate.toISOString(),
      dateTo: dateRange.endDate.toISOString(),
    });
  };

  return (
    <header className={dashboardStyles.headerContainer}>
      <div className={dashboardStyles.headerContent}>
        <div className={dashboardStyles.headerText}>
          <h1 className={dashboardStyles.headerTitle}>Dashboard</h1>

          <p className={dashboardStyles.headerDescription}>
            Monitor key performance indicators and critical stock alerts across
            your luxury properties.
          </p>
        </div>

        <div className={dashboardStyles.headerActions}>
          <DateFilterDropdown
            value={filterOption}
            onFilterChange={onFilterChange}
          />

          <Button
            variant="outline"
            className={dashboardStyles.exportButton}
            onClick={generateReport}
          >
            <FileDown className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>
    </header>
  );
}
