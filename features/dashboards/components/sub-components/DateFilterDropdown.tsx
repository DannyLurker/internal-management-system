"use client";

import { useMemo } from "react";
import { CalendarDays } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { dashboardStyles } from "../../dashboard.styles";
import { DateFilterOption, DateFilterRange } from "../../dashboard.types";

// ── Static option metadata ───────────────────────────────────────────────────

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

interface PresetOption {
  value: DateFilterOption;
  label: string;
}

const PRESET_OPTIONS: PresetOption[] = [
  { value: "last7", label: "Last 7 Days" },
  { value: "last14", label: "Last 14 Days" },
  { value: "last30", label: "Last 30 Days (1 Month)" },
  { value: "last90", label: "Last 90 Days (3 Months)" },
  { value: "last180", label: "Last 180 Days (6 Months)" },
  { value: "last365", label: "Last 365 Days (1 Year)" },
];

// ── Date computation helper ──────────────────────────────────────────────────
export function resolveDateRange(option: DateFilterOption): DateFilterRange {
  const now = new Date();

  if (option.startsWith("month-")) {
    const monthIndex = parseInt(option.replace("month-", ""), 10) - 1;

    const year = now.getFullYear();

    const startDate = new Date(year, monthIndex, 1, 0, 0, 0, 0);

    const endDate = new Date(year, monthIndex + 1, 1, 0, 0, 0, 0);

    return { startDate, endDate };
  }

  const daysMap: Record<string, number> = {
    last7: 7,
    last14: 14,
    last30: 30,
    last90: 90,
    last180: 180,
    last365: 365,
  };

  const days = daysMap[option] ?? 7;

  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - (days - 1));
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + 1);
  endDate.setHours(0, 0, 0, 0);

  return { startDate, endDate };
}

// ── Label helper ─────────────────────────────────────────────────────────────

function getOptionLabel(option: DateFilterOption, currentYear: number): string {
  if (option.startsWith("month-")) {
    // 💡 PERBAIKAN 2: Dikurangi 1 agar mengambil nama bulan yang pas
    const monthIndex = parseInt(option.replace("month-", ""), 10) - 1;
    const monthName = MONTH_NAMES[monthIndex];
    return monthName ? `${monthName} ${currentYear}` : option;
  }
  return PRESET_OPTIONS.find((o) => o.value === option)?.label ?? option;
}

// ── Component ────────────────────────────────────────────────────────────────

interface DateFilterDropdownProps {
  /** Currently selected filter option */
  value: DateFilterOption;
  /** Called whenever the user picks a different option */
  onFilterChange: (option: DateFilterOption, range: DateFilterRange) => void;
}

export default function DateFilterDropdown({
  value,
  onFilterChange,
}: DateFilterDropdownProps) {
  const currentYear = new Date().getFullYear();

  const monthOptions: PresetOption[] = useMemo(
    () =>
      MONTH_NAMES.map((name, i) => ({
        value: `month-${i + 1}` as DateFilterOption,
        label: `${name} ${currentYear}`,
      })),
    [currentYear],
  );

  const handleChange = (next: string | null) => {
    if (!next) return;

    const option = next as DateFilterOption;
    const range = resolveDateRange(option);
    onFilterChange(option, range);
  };

  const isMonthActive = value.startsWith("month-");

  const selectedLabel = getOptionLabel(value, currentYear);

  return (
    <div className={dashboardStyles.dateFilterContainer}>
      <span className={dashboardStyles.dateFilterLabel}>Period</span>

      <Select value={value} onValueChange={handleChange}>
        <SelectTrigger
          className={dashboardStyles.dateFilterTrigger}
          aria-label="Select dashboard date filter"
          id="dashboard-date-filter"
        >
          <CalendarDays className="w-4 h-4 shrink-0 text-[#894d0d]" />
          {/* Tampilkan label terpilih agar di trigger tampil rapi (contoh: "Last 7 Days" bukan "last7") */}
          <SelectValue placeholder="Select period">{selectedLabel}</SelectValue>
          {isMonthActive && (
            <span className={dashboardStyles.dateFilterActiveBadge}>Month</span>
          )}
        </SelectTrigger>

        <SelectContent align="end" alignItemWithTrigger={false}>
          {/* ── Preset rolling windows ────────────────────────────────── */}
          <SelectGroup>
            <SelectLabel>Rolling Windows</SelectLabel>
            {PRESET_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectGroup>

          <SelectSeparator />

          {/* ── Specific calendar months (current year) ───────────────── */}
          <SelectGroup>
            <SelectLabel>Specific Month ({currentYear})</SelectLabel>
            {monthOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
