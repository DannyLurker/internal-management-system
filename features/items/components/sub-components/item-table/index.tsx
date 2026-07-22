"use client";

import { ArrowDownUp, ChevronsLeft, ChevronsRight, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Input } from "@/shared/components/ui/input";
import type { Item } from "@/features/items/item.types";
import { cn } from "@/shared/lib/utils";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";
import { ItemGetManySchema } from "@/shared/lib/zods/item.zod";

export type ItemTableFilters = {
  search: string;
  categoryId: string;
  activeStatus: true | false | undefined;
};

type ItemTableProps = {
  items: Item[];
  totalItems: number;
  isLoading: boolean;
  isError: boolean;
  filters: ItemTableFilters;
  onFiltersChange: (patch: Partial<ItemTableFilters>) => void;
  sortBy: ItemGetManySchema["sortBy"];
  sortOrder: "asc" | "desc";
  onRequestSort: (column: ItemGetManySchema["sortBy"]) => void;
  onToggleSort: () => void;
  dataPerPage: number;
  onDataPerPageChange: (page: number) => void;
  page: number;
  onPageChange: (page: number) => void;
  categoryOptions: { id: string; name: string }[];
  onInfo: (item: { id: string; name: string }) => void;
  onEdit: (item: Item) => void;
  onStatusChange: (item: Item, status: "ACTIVE" | "INACTIVE") => void;
  onDelete: (item: Item) => void;
};

export default function ItemTable({
  items,
  totalItems,
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
  categoryOptions,
  onInfo,
  onEdit,
  onStatusChange,
  onDelete,
}: ItemTableProps) {
  const totalPages = Math.ceil(totalItems / dataPerPage);
  const hasNextPage = page * dataPerPage < totalItems;
  const hasPrevPage = page > 1;
  const rangeStart = items.length === 0 ? 0 : (page - 1) * dataPerPage + 1;
  const rangeEnd = (page - 1) * dataPerPage + items.length;
  const totalShown = totalItems;

  if (isError) {
    return (
      <div
        className="rounded-lg border border-[#ffdad6] bg-white px-6 py-10 text-center font-ochre-ui text-sm text-[#93000a] shadow-[0_12px_40px_-18px_rgba(18,28,40,0.08)]"
        role="alert"
      >
        Something went wrong while loading items. Please try again.
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
            placeholder="Search inventory..."
            className="h-10 rounded-lg border-[#e5eeff] bg-[#f8f9ff]/80 pl-10 font-ochre-ui text-sm focus-visible:border-[#894d0d]/35 focus-visible:ring-2 focus-visible:ring-[#894d0d]/15"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filters.categoryId}
            onValueChange={(value) =>
              onFiltersChange({ categoryId: value ?? "ALL" })
            }
          >
            <SelectTrigger className="h-10 min-w-36 rounded-lg border-[#e5eeff] bg-[#f8f9ff]/80 font-ochre-ui text-sm focus:border-[#894d0d]/35 focus:ring-2 focus:ring-[#894d0d]/15">
              <SelectValue>
                {filters.categoryId === "ALL"
                  ? "Category: All"
                  : `Category: ${categoryOptions.find((c) => c.id === filters.categoryId)?.name ?? "…"}`}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Category: All</SelectItem>
              {categoryOptions.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={
              filters.activeStatus === true
                ? "Active"
                : filters.activeStatus === false
                  ? "Inactive"
                  : "All"
            }
            onValueChange={(value) =>
              onFiltersChange({
                activeStatus:
                  value === "undefined" ? undefined : value === "Active",
              })
            }
          >
            <SelectTrigger className="h-10 min-w-36 rounded-lg border-[#e5eeff] bg-[#f8f9ff]/80 font-ochre-ui text-sm focus:border-[#894d0d]/35 focus:ring-2 focus:ring-[#894d0d]/15">
              <SelectValue placeholder="Active / Inactive">
                {filters.activeStatus === true
                  ? "Status: Active"
                  : filters.activeStatus === false
                    ? "Status: Inactive"
                    : "Status: All"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="undefined">All</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

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
      </div>{" "}
      {/* Corrected: Filter bar ends here */}
      {/* 2. Table card container (Now sitting beautifully below the filters) */}
      <div className="overflow-hidden rounded-xl border border-[#d9e3f4]/80 bg-white shadow-[0_16px_48px_-20px_rgba(15,23,42,0.08)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-225 border-collapse">
            <TableHeader
              sortBy={sortBy}
              sortOrder={sortOrder}
              onRequestSort={onRequestSort}
            />
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#eef4ff]">
                    <td className="px-4 py-3" colSpan={8}>
                      <div className="h-10 animate-pulse rounded-md bg-[#eef4ff]/80" />
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center font-ochre-ui text-sm text-[#524439]"
                  >
                    No items match your filters.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <TableRow
                    key={item.id}
                    item={item}
                    onInfo={onInfo}
                    onEdit={onEdit}
                    onStatusChange={onStatusChange}
                    onDelete={onDelete}
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
              items
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
