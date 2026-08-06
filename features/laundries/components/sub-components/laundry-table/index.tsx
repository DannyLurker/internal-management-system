"use client";

import { Search, ChevronsLeft, ChevronsRight } from "lucide-react";
import {
  Laundry,
  LaundryFilterStatus,
} from "@/features/laundries/laundry.types";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";
import { LaundryGetManySchema } from "@/shared/lib/zods/laundry.zod";

export type LaundryTableFilters = {
  searchQuery: string;
  status: LaundryFilterStatus;
  sourceLocationId: string;
};

type LaundryTableProps = {
  laundries: Laundry[];
  totalLaundries: number;
  isLoading: boolean;
  isError: boolean;
  filters: LaundryTableFilters;
  onFiltersChange: (patch: Partial<LaundryTableFilters>) => void;
  sortBy: LaundryGetManySchema["sortBy"];
  sortOrder: "asc" | "desc";
  onRequestSort: (column: LaundryGetManySchema["sortBy"]) => void;
  dataPerPage: number;
  onDataPerPageChange: (num: number) => void;
  page: number;
  onPageChange: (num: number) => void;
  locations: { id: string; name: string }[];
  onInfo: (laundry: Laundry) => void;
  onAction: (laundry: Laundry, actionType: "RETURNED" | "CANCELLED") => void;
};

export default function LaundryTable({
  laundries,
  totalLaundries,
  isLoading,
  isError,
  filters,
  onFiltersChange,
  sortBy,
  sortOrder,
  onRequestSort,
  dataPerPage,
  onDataPerPageChange,
  page,
  onPageChange,
  locations,
  onInfo,
  onAction,
}: LaundryTableProps) {
  const totalPages = Math.max(1, Math.ceil(totalLaundries / dataPerPage));
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  const rangeStart = laundries.length === 0 ? 0 : (page - 1) * dataPerPage + 1;
  const rangeEnd = Math.min(page * dataPerPage, totalLaundries);

  return (
    <div className="flex flex-col gap-4">
      {/* Search & Filter Bar Container */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#d9e3f4]/80 bg-white px-4 py-3 shadow-[0_16px_48px_-20px_rgba(15,23,42,0.08)] md:flex-row md:items-center md:justify-between">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#565e74]/60"
            strokeWidth={1.5}
            aria-hidden
          />
          <Input
            type="search"
            value={filters.searchQuery}
            onChange={(e) => onFiltersChange({ searchQuery: e.target.value })}
            placeholder="Search by item name or reason..."
            className="h-10 rounded-lg border-[#e5eeff] bg-[#f8f9ff]/80 pl-10 font-ochre-ui text-sm focus-visible:border-[#894d0d]/35 focus-visible:ring-2 focus-visible:ring-[#894d0d]/15"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <Select
            value={filters.status}
            onValueChange={(val) =>
              onFiltersChange({
                status: val as LaundryTableFilters["status"],
              })
            }
          >
            <SelectTrigger className="h-10 min-w-40 rounded-lg border-[#e5eeff] bg-[#f8f9ff]/80 font-ochre-ui text-sm focus:border-[#894d0d]/35 focus:ring-2 focus:ring-[#894d0d]/15">
              <SelectValue placeholder="Status: All">
                {filters.status === "ALL"
                  ? "Status: All"
                  : `Status: ${filters.status}`}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Status: All</SelectItem>
              <SelectItem value="SENT">Status: Sent (Pending)</SelectItem>
              <SelectItem value="RETURNED">Status: Returned</SelectItem>
              <SelectItem value="CANCELLED">Status: Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Location Filter */}
          <Select
            value={filters.sourceLocationId}
            onValueChange={(val) =>
              onFiltersChange({ sourceLocationId: val ?? "ALL" })
            }
          >
            <SelectTrigger className="h-10 min-w-44 rounded-lg border-[#e5eeff] bg-[#f8f9ff]/80 font-ochre-ui text-sm focus:border-[#894d0d]/35 focus:ring-2 focus:ring-[#894d0d]/15">
              <SelectValue placeholder="Source Location: All">
                {filters.sourceLocationId === "ALL"
                  ? "Source: All Locations"
                  : `Source: ${locations.find((l) => l.id === filters.sourceLocationId)?.name || "…"}`}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Source: All Locations</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc.id} value={loc.id}>
                  {loc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="overflow-x-auto rounded-xl border border-[#d9e3f4] bg-white shadow-[0_16px_48px_-20px_rgba(15,23,42,0.08)]">
        <table className="w-full border-collapse text-left">
          <TableHeader
            sortBy={sortBy}
            sortOrder={sortOrder}
            onRequestSort={onRequestSort}
          />
          <tbody className="divide-y divide-[#eef4ff]">
            {isError ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-6 py-12 text-center font-ochre-ui text-sm font-medium text-rose-700"
                >
                  Unable to load laundry records. Please try refreshing.
                </td>
              </tr>
            ) : isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={9} className="px-4 py-4">
                    <div className="h-5 rounded bg-[#eef4ff]/80" />
                  </td>
                </tr>
              ))
            ) : laundries.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-6 py-12 text-center font-ochre-ui text-sm text-[#524439]/70"
                >
                  No laundry records found matching the criteria.
                </td>
              </tr>
            ) : (
              laundries.map((laundry, idx) => (
                <TableRow
                  key={laundry.id}
                  laundry={laundry}
                  index={idx}
                  onInfo={onInfo}
                  onAction={onAction}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom-right Pagination Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-1 py-2 font-ochre-ui text-xs text-[#524439]">
        <div>
          Showing{" "}
          <span className="font-semibold text-[#121c28]">
            {rangeStart}–{rangeEnd}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-[#121c28]">{totalLaundries}</span>{" "}
          laundry records
        </div>

        <div className="flex items-center justify-end gap-4">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <Select
              value={String(dataPerPage)}
              onValueChange={(val) => onDataPerPageChange(Number(val))}
            >
              <SelectTrigger className="h-8 w-18 rounded-md border-[#e5eeff] bg-[#f8f9ff]/80 font-ochre-ui text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={!hasPrevPage}
              onClick={() => onPageChange(page - 1)}
              className="inline-flex size-8 items-center justify-center rounded-md border border-[#e5eeff] bg-white text-[#121c28] disabled:opacity-40 hover:bg-[#f8f9ff] transition-colors"
              aria-label="Previous Page"
            >
              <ChevronsLeft className="size-4" />
            </button>
            <span className="px-2 font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={!hasNextPage}
              onClick={() => onPageChange(page + 1)}
              className="inline-flex size-8 items-center justify-center rounded-md border border-[#e5eeff] bg-white text-[#121c28] disabled:opacity-40 hover:bg-[#f8f9ff] transition-colors"
              aria-label="Next Page"
            >
              <ChevronsRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
