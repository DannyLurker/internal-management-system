"use client";

import { useState } from "react";
import { ArrowDownUp, ChevronsLeft, ChevronsRight, MapPin, Package, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Input } from "@/shared/components/ui/input";
import type { Stock, StockDelete } from "@/features/stocks/stock.types";
import { cn } from "@/shared/lib/utils";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";
import { StockGetManySchema } from "@/shared/lib/zods/stock.zod";
import {
  SearchLocationPopover,
  SearchItemPopover,
} from "@/shared/components/search-components";
import { LocationOption } from "@/features/locations/location.types";

export type StockTableFilters = {
  search: string;
  type: string;
  locationId: string;
  itemId: string;
};

type StockTableProps = {
  stocks: Stock[];
  totalCount: number;
  isLoading: boolean;
  isError: boolean;
  filters: StockTableFilters;
  onFiltersChange: (patch: Partial<StockTableFilters>) => void;
  sortBy: StockGetManySchema["sortBy"];
  sortOrder: "asc" | "desc";
  onRequestSort: (column: StockGetManySchema["sortBy"]) => void;
  onToggleSort: () => void;
  dataPerPage: number;
  onDataPerPageChange: (size: number) => void;
  page: number;
  onPageChange: (page: number) => void;
  locationOptions: LocationOption[];
  itemOptions: { id: string; name: string }[];
  onEdit: (stock: Stock) => void;
  onDelete: (stock: StockDelete) => void;
  onInfo: (stockId: string) => void;
};

export default function StockTable({
  stocks,
  totalCount,
  isLoading,
  isError,
  filters,
  onFiltersChange,
  sortBy,
  sortOrder,
  onRequestSort,
  onToggleSort,
  dataPerPage,
  onDataPerPageChange,
  page,
  onPageChange,
  locationOptions,
  itemOptions,
  onEdit,
  onDelete,
  onInfo,
}: StockTableProps) {
  const [locationSearchOpen, setLocationSearchOpen] = useState(false);
  const [itemSearchOpen, setItemSearchOpen] = useState(false);
  const [selectedLocationName, setSelectedLocationName] = useState("");
  const [selectedItemName, setSelectedItemName] = useState("");

  const totalPages = Math.ceil(totalCount / dataPerPage);
  const hasNextPage = page * dataPerPage < totalCount;
  const hasPrevPage = page > 1;
  const rangeStart = stocks.length === 0 ? 0 : (page - 1) * dataPerPage + 1;
  const rangeEnd = (page - 1) * dataPerPage + stocks.length;
  const totalShown = totalCount;

  const currentLocationLabel =
    filters.locationId === "ALL"
      ? "Location: All"
      : selectedLocationName
        ? `Location: ${selectedLocationName}`
        : `Location: ${locationOptions.find((l) => l.id === filters.locationId)?.name ?? "…"}`;

  const currentItemLabel =
    filters.itemId === "ALL"
      ? "Item: All"
      : selectedItemName
        ? `Item: ${selectedItemName}`
        : `Item: ${itemOptions.find((i) => i.id === filters.itemId)?.name ?? "…"}`;

  if (isError) {
    return (
      <div
        className="rounded-lg border border-[#ffdad6] bg-white px-6 py-10 text-center font-ochre-ui text-sm text-[#93000a] shadow-[0_12px_40px_-18px_rgba(18,28,40,0.08)]"
        role="alert"
      >
        Something went wrong while loading stocks. Please try again.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Filter bar card container */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#d9e3f4]/80 bg-white px-4 py-3 shadow-[0_16px_48px_-20px_rgba(15,23,42,0.08)] md:flex-row md:items-center md:justify-between">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#565e74]/60"
            strokeWidth={1.5}
            aria-hidden
          />
          <Input
            type="search"
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            placeholder="Search by item or location…"
            className="h-10 rounded-lg border-[#e5eeff] bg-[#f8f9ff]/80 pl-10 font-ochre-ui text-sm focus-visible:border-[#894d0d]/35 focus-visible:ring-2 focus-visible:ring-[#894d0d]/15"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Stock Type filter */}
          {sortBy === "stockType" && (
            <Select
              value={filters.type}
              onValueChange={(value) =>
                onFiltersChange({ type: value ?? "ALL" })
              }
            >
              <SelectTrigger className="h-10 min-w-36 rounded-lg border-[#e5eeff] bg-[#f8f9ff]/80 font-ochre-ui text-sm focus:border-[#894d0d]/35 focus:ring-2 focus:ring-[#894d0d]/15">
                <SelectValue>
                  {filters.type === "ALL"
                    ? "Type: All"
                    : `Type: ${filters.type}`}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Type: All</SelectItem>
                <SelectItem value="READY">Ready</SelectItem>
                <SelectItem value="DIRTY">Dirty</SelectItem>
                <SelectItem value="DAMAGED">Damaged</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Location filter */}
          <SearchLocationPopover
            open={locationSearchOpen}
            onOpenChange={setLocationSearchOpen}
            selectedId={filters.locationId === "ALL" ? undefined : filters.locationId}
            showAllOption
            onSelect={(loc) => {
              setSelectedLocationName(loc.name);
              onFiltersChange({ locationId: loc.id });
            }}
            onSelectAll={() => {
              setSelectedLocationName("");
              onFiltersChange({ locationId: "ALL" });
            }}
          >
            <button
              type="button"
              className="inline-flex h-10 min-w-36 items-center justify-between gap-2 rounded-lg border border-[#e5eeff] bg-[#f8f9ff]/80 px-3 font-ochre-ui text-sm text-[#121c28] transition-colors hover:border-[#894d0d]/35 focus-visible:border-[#894d0d]/35 focus-visible:ring-2 focus-visible:ring-[#894d0d]/15"
            >
              <span className="flex items-center gap-1.5 truncate">
                <MapPin className="size-3.5 text-[#565e74] shrink-0" />
                <span className="truncate">{currentLocationLabel}</span>
              </span>
            </button>
          </SearchLocationPopover>

          {/* Item filter */}
          <SearchItemPopover
            open={itemSearchOpen}
            onOpenChange={setItemSearchOpen}
            selectedId={filters.itemId === "ALL" ? undefined : filters.itemId}
            showAllOption
            onSelect={(item) => {
              setSelectedItemName(item.name);
              onFiltersChange({ itemId: item.id });
            }}
            onSelectAll={() => {
              setSelectedItemName("");
              onFiltersChange({ itemId: "ALL" });
            }}
          >
            <button
              type="button"
              className="inline-flex h-10 min-w-36 items-center justify-between gap-2 rounded-lg border border-[#e5eeff] bg-[#f8f9ff]/80 px-3 font-ochre-ui text-sm text-[#121c28] transition-colors hover:border-[#894d0d]/35 focus-visible:border-[#894d0d]/35 focus-visible:ring-2 focus-visible:ring-[#894d0d]/15"
            >
              <span className="flex items-center gap-1.5 truncate">
                <Package className="size-3.5 text-[#565e74] shrink-0" />
                <span className="truncate">{currentItemLabel}</span>
              </span>
            </button>
          </SearchItemPopover>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-ochre-ui text-xs font-medium uppercase tracking-wide text-[#524439]/70">
                Show:
              </span>
              <select
                value={String(dataPerPage)}
                onChange={(e) => {
                  onDataPerPageChange(Number(e.target.value));
                }}
                className="min-w-28 appearance-none rounded-lg border border-[#e5eeff] bg-[#f8f9ff]/80 px-2 py-1.5 font-ochre-ui text-sm text-[#121c28] outline-none transition-colors duration-200 hover:border-[#b0c8f8] focus:border-[#894d0d]/35 focus:ring-2 focus:ring-[#894d0d]/15 focus:outline-none"
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div />

            <button
              type="button"
              onClick={onToggleSort}
              className={cn(
                "flex size-10 items-center justify-center rounded-lg border border-[#e5eeff] bg-[#f8f9ff]/80 text-[#565e74]",
                "hover:border-[#894d0d]/40 hover:bg-white hover:text-[#894d0d]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#894d0d]/15",
              )}
              aria-label={`Sort ${sortOrder === "asc" ? "ascending" : "descending"}`}
            >
              <ArrowDownUp className="size-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Table card container */}
      <div className="overflow-hidden rounded-xl border border-[#d9e3f4]/80 bg-white shadow-[0_16px_48px_-20px_rgba(15,23,42,0.08)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-225 border-collapse">
            <TableHeader
              showItemName={true}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onRequestSort={onRequestSort}
            />
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#eef4ff]">
                    <td className="px-4 py-3" colSpan={7}>
                      <div className="h-10 animate-pulse rounded-md bg-[#eef4ff]/80" />
                    </td>
                  </tr>
                ))
              ) : stocks.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center font-ochre-ui text-sm text-[#524439]"
                  >
                    No stocks match your filters.
                  </td>
                </tr>
              ) : (
                stocks.map((stock) => (
                  <TableRow
                    key={stock.id}
                    showItemName={true}
                    stock={stock}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onInfo={onInfo}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && totalShown > 0 ? (
          <div className="flex flex-col gap-3 border-t border-[#eef4ff] px-4 py-3 font-ochre-ui text-sm text-[#524439] sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing{" "}
              <span className="font-semibold text-[#121c28]">{rangeStart}</span>{" "}
              to{" "}
              <span className="font-semibold text-[#121c28]">{rangeEnd}</span>{" "}
              of{" "}
              <span className="font-semibold text-[#121c28]">{totalShown}</span>{" "}
              stocks
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!hasPrevPage}
                onClick={() => onPageChange(1)}
                className={cn(
                  "rounded-md border border-[#d9e3f4] p-1.5 text-[#565e74]",
                  !hasPrevPage && "cursor-not-allowed opacity-40",
                  hasPrevPage &&
                    "hover:border-[#894d0d]/40 hover:text-[#894d0d]",
                )}
                aria-label="First page"
              >
                <ChevronsLeft className="size-4" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                disabled={!hasPrevPage}
                onClick={() => onPageChange(page - 1)}
                className={cn(
                  "rounded-md border border-[#d9e3f4] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#565e74]",
                  !hasPrevPage && "cursor-not-allowed opacity-40",
                  hasPrevPage &&
                    "hover:border-[#894d0d]/40 hover:text-[#894d0d]",
                )}
              >
                Prev
              </button>
              <span className="rounded-md bg-[#894d0d] px-3 py-1.5 text-xs font-semibold text-white">
                {page}
              </span>
              <button
                type="button"
                disabled={!hasNextPage}
                onClick={() => onPageChange(page + 1)}
                className={cn(
                  "rounded-md border border-[#d9e3f4] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#565e74]",
                  !hasNextPage && "cursor-not-allowed opacity-40",
                  hasNextPage &&
                    "hover:border-[#894d0d]/40 hover:text-[#894d0d]",
                )}
              >
                Next
              </button>
              <button
                type="button"
                disabled={!hasNextPage}
                onClick={() => onPageChange(totalPages)}
                className={cn(
                  "rounded-md border border-[#d9e3f4] p-1.5 text-[#565e74]",
                  !hasNextPage && "cursor-not-allowed opacity-40",
                  hasNextPage &&
                    "hover:border-[#894d0d]/40 hover:text-[#894d0d]",
                )}
                aria-label="Last page"
              >
                <ChevronsRight className="size-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
