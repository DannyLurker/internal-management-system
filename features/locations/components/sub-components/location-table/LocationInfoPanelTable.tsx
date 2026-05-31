"use client";

import { Search, ChevronsLeft, ChevronsRight } from "lucide-react";
import type { LocationStockItem } from "@/features/locations/location.types";
import { cn } from "@/shared/lib/utils";

type LocationInfoPanelTableProps = {
  stocks: LocationStockItem[];
  totalStocksCount: number;
  itemPage: number;
  itemDataPerPage: number;
  itemSearchQuery: string;
  onPageChange: (page: number) => void;
  onSearchChange: (query: string) => void;
};

export default function LocationInfoPanelTable({
  stocks,
  totalStocksCount,
  itemPage,
  itemDataPerPage,
  itemSearchQuery,
  onPageChange,
  onSearchChange,
}: LocationInfoPanelTableProps) {
  const totalPages = Math.ceil(totalStocksCount / itemDataPerPage);
  const hasNextPage = itemPage < totalPages;
  const hasPrevPage = itemPage > 1;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#565e74]/60"
          strokeWidth={1.5}
          aria-hidden
        />
        <input
          type="search"
          value={itemSearchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search items in this location..."
          className={cn(
            "w-full rounded-lg border border-[#e5eeff] bg-[#f8f9ff]/80 py-2.5 pe-3 ps-10 font-ochre-ui text-sm text-[#121c28] outline-none transition-[border-color,box-shadow]",
            "placeholder:text-[#524439]/45 focus:border-[#894d0d]/35 focus:ring-2 focus:ring-[#894d0d]/15",
          )}
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-[#d9e3f4]/80">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#d9e3f4] bg-[#f8f9ff]/60 text-left">
              <th className="px-3 py-2.5 font-ochre-ui text-[10px] font-semibold uppercase tracking-wider text-[#524439]/80">
                Item name
              </th>
              <th className="px-3 py-2.5 font-ochre-ui text-[10px] font-semibold uppercase tracking-wider text-[#524439]/80">
                Stock qty
              </th>
              <th className="px-3 py-2.5 font-ochre-ui text-[10px] font-semibold uppercase tracking-wider text-[#524439]/80">
                Type
              </th>
            </tr>
          </thead>
          <tbody>
            {stocks.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-3 py-8 text-center font-ochre-ui text-sm text-[#524439]"
                >
                  No items in this location.
                </td>
              </tr>
            ) : (
              stocks.map((stock, index) => (
                <tr
                  key={`${stock.item.name}-${stock.type}-${index}`}
                  className="border-b border-[#eef4ff] last:border-0"
                >
                  <td className="px-3 py-2.5 font-ochre-ui text-sm text-[#121c28]">
                    {stock.item.name}
                  </td>
                  <td className="px-3 py-2.5 font-ochre-ui text-sm text-[#121c28]">
                    {stock.quantity}
                  </td>
                  <td className="px-3 py-2.5 font-ochre-ui text-xs uppercase tracking-wide text-[#524439]">
                    {stock.type}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {stocks.length > 0 ? (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={!hasPrevPage}
            onClick={() => onPageChange(1)}
            className={cn(
              "rounded-md border border-[#d9e3f4] p-1.5 text-[#565e74]",
              !hasPrevPage && "cursor-not-allowed opacity-40",
              hasPrevPage && "hover:border-[#894d0d]/40 hover:text-[#894d0d]",
            )}
            aria-label="First page"
          >
            <ChevronsLeft className="size-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            disabled={!hasPrevPage}
            onClick={() => onPageChange(itemPage - 1)}
            className={cn(
              "rounded-md border border-[#d9e3f4] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#565e74]",
              !hasPrevPage && "cursor-not-allowed opacity-40",
              hasPrevPage && "hover:border-[#894d0d]/40 hover:text-[#894d0d]",
            )}
          >
            Prev
          </button>
          <span className="rounded-md bg-[#894d0d] px-3 py-1.5 text-xs font-semibold text-white">
            {itemPage}
          </span>
          <button
            type="button"
            disabled={!hasNextPage}
            onClick={() => onPageChange(itemPage + 1)}
            className={cn(
              "rounded-md border border-[#d9e3f4] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#565e74]",
              !hasNextPage && "cursor-not-allowed opacity-40",
              hasNextPage && "hover:border-[#894d0d]/40 hover:text-[#894d0d]",
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
              hasNextPage && "hover:border-[#894d0d]/40 hover:text-[#894d0d]",
            )}
            aria-label="Last page"
          >
            <ChevronsRight className="size-4" strokeWidth={1.5} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
