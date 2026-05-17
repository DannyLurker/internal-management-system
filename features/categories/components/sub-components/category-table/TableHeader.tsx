"use client";

import { cn } from "@/shared/lib/utils";
import type { CategoryGetSchema } from "@/shared/lib/zods/category.zod";

export type CategorySortBy = CategoryGetSchema["sortBy"];

type TableHeaderProps = {
  sortBy: CategorySortBy;
  sortOrder: CategoryGetSchema["sortOrder"];
  onRequestSort: (column: CategorySortBy) => void;
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
  sortBy,
  sortOrder,
  onRequestSort,
}: TableHeaderProps) {
  return (
    <thead>
      <tr className="border-b border-[#d9e3f4] text-left">
        <th className="pb-3 pe-4 ps-4 pt-3 font-ochre-ui text-[10px] font-semibold uppercase tracking-wider text-[#524439]/80">
          <button
            type="button"
            onClick={() => onRequestSort("name")}
            className={cn(
              "inline-flex items-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-[#894d0d]/40",
              sortBy === "name" && "text-[#894d0d]",
            )}
          >
            Name
            <SortIndicator active={sortBy === "name"} order={sortOrder} />
          </button>
        </th>
        <th className="pb-3 pe-4 pt-3 font-ochre-ui text-[10px] font-semibold uppercase tracking-wider text-[#524439]/80">
          Item count
        </th>
        <th className="hidden px-4 pb-3 pe-4 pt-3 font-ochre-ui text-[10px] font-semibold uppercase tracking-wider text-[#524439]/80 lg:table-cell">
          <button
            type="button"
            onClick={() => onRequestSort("createdAt")}
            className={cn(
              "inline-flex items-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-[#894d0d]/40",
              sortBy === "createdAt" && "text-[#894d0d]",
            )}
          >
            Last updated
            <SortIndicator active={sortBy === "createdAt"} order={sortOrder} />
          </button>
        </th>
        <th className="w-24 pb-3 pe-4 pt-3 text-end font-ochre-ui text-[10px] font-semibold uppercase tracking-wider text-[#524439]/80">
          Actions
        </th>
      </tr>
    </thead>
  );
}
