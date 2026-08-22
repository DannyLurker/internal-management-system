"use client";

import { useState } from "react";
import { ArrowDownUp, ChevronsLeft, ChevronsRight, MapPin, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import type { StockMovementGetManyApiResponse } from "@/features/stock-movements/stock-movements.types";
import type { StockMovementGetManySchema } from "@/shared/lib/zods/stock-movements.zod";
import { stockMovementPanelClass } from "@/features/stock-movements/stock-movements.style";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";
import { LocationOption } from "@/features/locations/location.types";
import { SearchLocationPopover } from "@/shared/components/search-components";

type StockMovementRow =
  StockMovementGetManyApiResponse["data"]["movements"][number];

export type StockMovementTableFilters = {
  searchQuery: string;
  type: string;
  sourceLocation: string;
  destinationLocation: string;
};

type StockMovementTableProps = {
  locations: LocationOption[];
  movements: StockMovementRow[];
  totalCount: number;
  isLoading: boolean;
  isError: boolean;
  filters: StockMovementTableFilters;
  onFiltersChange: (patch: Partial<StockMovementTableFilters>) => void;
  sortBy: StockMovementGetManySchema["sortBy"];
  sortOrder: "asc" | "desc";
  onRequestSort: (column: StockMovementGetManySchema["sortBy"]) => void;
  onToggleSort: () => void;
  dataPerPage: number;
  onDataPerPageChange: (page: number) => void;
  page: number;
  onPageChange: (page: number) => void;
  movementTypes: string[];
  onInfo: (movementId: string) => void;
};

export default function StockMovementTable({
  locations,
  movements,
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
  movementTypes,
  onInfo,
}: StockMovementTableProps) {
  const [sourceLocationSearchOpen, setSourceLocationSearchOpen] = useState(false);
  const [destLocationSearchOpen, setDestLocationSearchOpen] = useState(false);
  const [selectedSourceName, setSelectedSourceName] = useState("");
  const [selectedDestName, setSelectedDestName] = useState("");

  const totalPages = Math.max(1, Math.ceil(totalCount / dataPerPage));
  const hasNextPage = page * dataPerPage < totalCount;
  const hasPrevPage = page > 1;
  const rangeStart = movements.length === 0 ? 0 : (page - 1) * dataPerPage + 1;
  const rangeEnd = (page - 1) * dataPerPage + movements.length;

  const currentSourceLabel =
    filters.sourceLocation === "ALL"
      ? "Source Location: All"
      : selectedSourceName
        ? `Source: ${selectedSourceName}`
        : `Source: ${locations.find((l) => l.id === filters.sourceLocation)?.name || "…"}`;

  const currentDestLabel =
    filters.destinationLocation === "ALL"
      ? "Destination Location: All"
      : selectedDestName
        ? `Destination: ${selectedDestName}`
        : `Destination: ${locations.find((l) => l.id === filters.destinationLocation)?.name || "…"}`;

  if (isError) {
    return (
      <div
        className="rounded-lg border border-[#ffdad6] bg-white px-6 py-10 text-center font-ochre-ui text-sm text-[#93000a] shadow-[0_12px_40px_-18px_rgba(18,28,40,0.08)]"
        role="alert"
      >
        Something went wrong while loading stock movements. Please try again.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        className={cn(
          stockMovementPanelClass,
          "flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between",
        )}
      >
        <div className="w-full">
          <div className="relative min-w-0 flex-1 mb-2">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#565e74]/60"
              strokeWidth={1.5}
              aria-hidden
            />
            <Input
              type="search"
              value={filters.searchQuery}
              onChange={(event) =>
                onFiltersChange({ searchQuery: event.target.value })
              }
              placeholder="Search item..."
              className="h-10 rounded-lg border-[#e5eeff] bg-[#f8f9ff]/80 pl-10 font-ochre-ui text-sm focus-visible:border-[#894d0d]/35 focus-visible:ring-2 focus-visible:ring-[#894d0d]/15"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Type Sorting */}
            <Select
              value={filters.type}
              onValueChange={(value) =>
                onFiltersChange({ type: value ?? "ALL" })
              }
            >
              <SelectTrigger className="h-10 min-w-44 rounded-lg border-[#e5eeff] bg-[#f8f9ff]/80 font-ochre-ui text-sm focus:border-[#894d0d]/35 focus:ring-2 focus:ring-[#894d0d]/15">
                <SelectValue>
                  {filters.type === "ALL"
                    ? "Type: All"
                    : `Type: ${filters.type}`}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Type: All</SelectItem>
                {movementTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Source location filter */}
            <SearchLocationPopover
              open={sourceLocationSearchOpen}
              onOpenChange={setSourceLocationSearchOpen}
              selectedId={filters.sourceLocation === "ALL" ? undefined : filters.sourceLocation}
              showAllOption
              onSelect={(loc) => {
                setSelectedSourceName(loc.name);
                onFiltersChange({ sourceLocation: loc.id });
              }}
              onSelectAll={() => {
                setSelectedSourceName("");
                onFiltersChange({ sourceLocation: "ALL" });
              }}
            >
              <button
                type="button"
                className="inline-flex h-10 min-w-44 items-center justify-between gap-2 rounded-lg border border-[#e5eeff] bg-[#f8f9ff]/80 px-3 font-ochre-ui text-sm text-[#121c28] transition-colors hover:border-[#894d0d]/35 focus-visible:border-[#894d0d]/35 focus-visible:ring-2 focus-visible:ring-[#894d0d]/15"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <MapPin className="size-3.5 text-[#565e74] shrink-0" />
                  <span className="truncate">{currentSourceLabel}</span>
                </span>
              </button>
            </SearchLocationPopover>

            {/* Destination Location filter */}
            <SearchLocationPopover
              open={destLocationSearchOpen}
              onOpenChange={setDestLocationSearchOpen}
              selectedId={filters.destinationLocation === "ALL" ? undefined : filters.destinationLocation}
              showAllOption
              onSelect={(loc) => {
                setSelectedDestName(loc.name);
                onFiltersChange({ destinationLocation: loc.id });
              }}
              onSelectAll={() => {
                setSelectedDestName("");
                onFiltersChange({ destinationLocation: "ALL" });
              }}
            >
              <button
                type="button"
                className="inline-flex h-10 min-w-44 items-center justify-between gap-2 rounded-lg border border-[#e5eeff] bg-[#f8f9ff]/80 px-3 font-ochre-ui text-sm text-[#121c28] transition-colors hover:border-[#894d0d]/35 focus-visible:border-[#894d0d]/35 focus-visible:ring-2 focus-visible:ring-[#894d0d]/15"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <MapPin className="size-3.5 text-[#565e74] shrink-0" />
                  <span className="truncate">{currentDestLabel}</span>
                </span>
              </button>
            </SearchLocationPopover>

            <div className="flex items-center gap-2">
              <span className="font-ochre-ui text-xs font-medium uppercase tracking-wide text-[#524439]/70">
                Show:
              </span>
              <select
                value={String(dataPerPage)}
                onChange={(event) =>
                  onDataPerPageChange(Number(event.target.value))
                }
                className="min-w-24 appearance-none rounded-lg border border-[#e5eeff] bg-[#f8f9ff]/80 px-2 py-1.5 font-ochre-ui text-sm text-[#121c28] outline-none transition-colors duration-200 hover:border-[#b0c8f8] focus:border-[#894d0d]/35 focus:ring-2 focus:ring-[#894d0d]/15"
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

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

      <div className={cn(stockMovementPanelClass, "overflow-hidden")}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-240 border-collapse">
            <TableHeader
              sortBy={sortBy}
              sortOrder={sortOrder}
              onRequestSort={onRequestSort}
            />
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="border-b border-[#eef4ff]">
                    <td className="px-4 py-3" colSpan={6}>
                      <div className="h-10 animate-pulse rounded-md bg-[#eef4ff]/80" />
                    </td>
                  </tr>
                ))
              ) : movements.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center font-ochre-ui text-sm text-[#524439]"
                  >
                    No stock movements match your filters.
                  </td>
                </tr>
              ) : (
                movements.map((movement) => (
                  <TableRow
                    key={movement.id}
                    movement={movement}
                    onInfo={onInfo}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && totalCount > 0 ? (
          <div className="flex flex-col gap-3 border-t border-[#eef4ff] px-4 py-3 font-ochre-ui text-sm text-[#524439] sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing{" "}
              <span className="font-semibold text-[#121c28]">{rangeStart}</span>{" "}
              to{" "}
              <span className="font-semibold text-[#121c28]">{rangeEnd}</span>{" "}
              of{" "}
              <span className="font-semibold text-[#121c28]">{totalCount}</span>{" "}
              movements
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
