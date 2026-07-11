"use client";

import { StockSortBy } from "@/features/stocks/stock.types";
import { cn } from "@/shared/lib/utils";

type TableHeaderProps = {
  showItemName: boolean;
  sortBy: StockSortBy;
  sortOrder: "asc" | "desc";
  onRequestSort: (column: StockSortBy) => void;
};

function SortIndicator({
  active,
  order,
}: {
  active: boolean;
  order: "asc" | "desc";
}) {
  if (!active) {
    return (
      <span className="ms-1 inline-block text-[#121c28]/25" aria-hidden>
        ↕
      </span>
    );
  }
  return (
    <span className="ms-1 inline-block text-[#894d0d]" aria-hidden>
      {order === "asc" ? "↑" : "↓"}
    </span>
  );
}

export default function TableHeader({
  showItemName,
  sortBy,
  sortOrder,
  onRequestSort,
}: TableHeaderProps) {
  return (
    <thead>
      <tr className="border-b border-[#d9e3f4] text-left h-12">
        {showItemName && (
          <th className="px-4 align-middle font-ochre-ui text-[10px] font-semibold uppercase tracking-wider text-[#524439]/80">
            ITEM
          </th>
        )}

        <th className="px-4 align-middle font-ochre-ui text-[10px] font-semibold uppercase tracking-wider text-[#524439]/80">
          LOCATION
        </th>
        <th className="px-4 align-middle font-ochre-ui text-[10px] font-semibold uppercase tracking-wider text-[#524439]/80">
          <button
            type="button"
            onClick={() => onRequestSort("stockType")}
            className={cn(
              "inline-flex items-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-[#894d0d]/40",
              sortBy === "stockType" && "text-[#894d0d]",
            )}
          >
            TYPE
            <SortIndicator active={sortBy === "stockType"} order={sortOrder} />
          </button>
        </th>
        <th className="px-4 align-middle font-ochre-ui text-[10px] font-semibold uppercase tracking-wider text-[#524439]/80">
          <button
            type="button"
            onClick={() => onRequestSort("quantity")}
            className={cn(
              "inline-flex items-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-[#894d0d]/40",
              sortBy === "quantity" && "text-[#894d0d]",
            )}
          >
            QUANTITY
            <SortIndicator active={sortBy === "quantity"} order={sortOrder} />
          </button>
        </th>
        <th className="px-4 align-middle font-ochre-ui text-[10px] font-semibold uppercase tracking-wider text-[#524439]/80">
          <button
            type="button"
            onClick={() => onRequestSort("expiredAt")}
            className={cn(
              "inline-flex items-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-[#894d0d]/40",
              sortBy === "expiredAt" && "text-[#894d0d]",
            )}
          >
            EXPIRES
            <SortIndicator active={sortBy === "expiredAt"} order={sortOrder} />
          </button>
        </th>
        <th className="px-4 align-middle font-ochre-ui text-[10px] font-semibold uppercase tracking-wider text-[#524439]/80">
          <button
            type="button"
            onClick={() => onRequestSort("updatedAt")}
            className={cn(
              "inline-flex items-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-[#894d0d]/40",
              sortBy === "updatedAt" && "text-[#894d0d]",
            )}
          >
            UPDATED
            <SortIndicator active={sortBy === "updatedAt"} order={sortOrder} />
          </button>
        </th>
        <th className="w-24 px-4 align-middle text-end font-ochre-ui text-[10px] font-semibold uppercase tracking-wider text-[#524439]/80">
          ACTIONS
        </th>
      </tr>
    </thead>
  );
}
