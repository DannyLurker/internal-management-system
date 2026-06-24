"use client";

import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { formatItemDate } from "@/shared/lib/formatter";

type ItemStockItem = {
  quantity: number;
  type: string;
  updatedAt: Date | string;
  expiredAt?: Date | string | null;
  location?: {
    name: string;
  } | null;
};

type ItemInfoPanelTableProps = {
  stocks: ItemStockItem[];
  totalStockRows: number;
  itemStockPage: number;
  itemStocksPerpage: number;
  onPageChange: (page: number) => void;
};

function formatTimestamp(value: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function ItemInfoPanelTable({
  stocks,
  totalStockRows,
  itemStockPage,
  itemStocksPerpage,
  onPageChange,
}: ItemInfoPanelTableProps) {
  const totalPages = Math.ceil(totalStockRows / itemStocksPerpage);
  const hasNextPage = itemStockPage < totalPages;
  const hasPrevPage = itemStockPage > 1;

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-lg border border-[#d9e3f4]/80">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#d9e3f4] bg-[#f8f9ff]/60 text-left">
              <th className="px-3 py-2.5 font-ochre-ui text-[10px] font-semibold uppercase tracking-wider text-[#524439]/80">
                Location
              </th>
              <th className="px-3 py-2.5 font-ochre-ui text-[10px] font-semibold uppercase tracking-wider text-[#524439]/80">
                Stock qty
              </th>
              <th className="px-3 py-2.5 font-ochre-ui text-[10px] font-semibold uppercase tracking-wider text-[#524439]/80">
                Type
              </th>
              <th className="px-3 py-2.5 font-ochre-ui text-[10px] font-semibold uppercase tracking-wider text-[#524439]/80">
                Expiration
              </th>
              <th className="px-3 py-2.5 font-ochre-ui text-[10px] font-semibold uppercase tracking-wider text-[#524439]/80">
                Last updated
              </th>
            </tr>
          </thead>
          <tbody>
            {stocks.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-8 text-center font-ochre-ui text-sm text-[#524439]"
                >
                  No stock entries matching your filter criteria.
                </td>
              </tr>
            ) : (
              stocks.map((stock, index) => (
                <tr
                  key={`${stock.location?.name ?? "unknown"}-${stock.type}-${index}`}
                  className="border-b border-[#eef4ff] last:border-0 hover:bg-[#f8f9ff]/40"
                >
                  <td className="px-3 py-2.5 font-ochre-ui text-sm text-[#121c28] font-medium">
                    {stock.location?.name ?? "—"}
                  </td>
                  <td className="px-3 py-2.5 font-ochre-ui text-sm text-[#121c28]">
                    {stock.quantity}
                  </td>
                  <td className="px-3 py-2.5 font-ochre-ui text-xs">
                    <span
                      className={cn(
                        "inline-flex rounded px-1.5 py-0.5 font-semibold text-[10px] uppercase tracking-wide",
                        stock.type === "READY" &&
                          "bg-emerald-100 text-emerald-800",
                        stock.type === "DIRTY" && "bg-amber-100 text-amber-800",
                        stock.type === "DAMAGED" && "bg-rose-100 text-rose-800",
                        stock.type === "EXPIRED" &&
                          "bg-gray-150 text-gray-800 border border-gray-300",
                      )}
                    >
                      {stock.type}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-ochre-ui text-xs text-[#524439]">
                    {stock.expiredAt ? formatItemDate(stock.expiredAt) : "—"}
                  </td>
                  <td className="px-3 py-2.5 font-ochre-ui text-xs text-[#524439]">
                    {formatTimestamp(stock.updatedAt)}
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
            onClick={() => onPageChange(itemStockPage - 1)}
            className={cn(
              "rounded-md border border-[#d9e3f4] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#565e74]",
              !hasPrevPage && "cursor-not-allowed opacity-40",
              hasPrevPage && "hover:border-[#894d0d]/40 hover:text-[#894d0d]",
            )}
          >
            Prev
          </button>
          <span className="rounded-md bg-[#894d0d] px-3 py-1.5 text-xs font-semibold text-white">
            {itemStockPage}
          </span>
          <button
            type="button"
            disabled={!hasNextPage}
            onClick={() => onPageChange(itemStockPage + 1)}
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
