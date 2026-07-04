"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { StockMovementGetManySchema } from "@/shared/lib/zods/stock-movements.zod";

type SortBy = StockMovementGetManySchema["sortBy"];

type TableHeaderProps = {
  sortBy: SortBy;
  sortOrder: "asc" | "desc";
  onRequestSort: (column: SortBy) => void;
};

const columns: { label: string; value: SortBy; className?: string }[] = [
  { label: "Movement", value: "name" },
  { label: "Type", value: "type" },
  { label: "Source", value: "sourceLocation" },
  { label: "Destination", value: "destinationLocation" },
  { label: "Created", value: "createdAt" },
];

function SortIcon({
  active,
  order,
}: {
  active: boolean;
  order: "asc" | "desc";
}) {
  if (!active) {
    return <ArrowUpDown className="size-3.5 text-[#121c28]/25" aria-hidden />;
  }

  return order === "asc" ? (
    <ArrowUp className="size-3.5 text-[#894d0d]" aria-hidden />
  ) : (
    <ArrowDown className="size-3.5 text-[#894d0d]" aria-hidden />
  );
}

export default function TableHeader({
  sortBy,
  sortOrder,
  onRequestSort,
}: TableHeaderProps) {
  return (
    <thead>
      <tr className="h-12 border-b border-[#d9e3f4] text-left">
        {columns.map((column) => (
          <th
            key={column.value}
            className={cn(
              "px-4 align-middle font-ochre-ui text-[10px] font-semibold uppercase tracking-wider text-[#524439]/80",
              column.className,
            )}
          >
            <button
              type="button"
              onClick={() => onRequestSort(column.value)}
              className={cn(
                "inline-flex items-center gap-1 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-[#894d0d]/40",
                sortBy === column.value && "text-[#894d0d]",
              )}
            >
              {column.label}
              <SortIcon active={sortBy === column.value} order={sortOrder} />
            </button>
          </th>
        ))}
        <th className="w-24 px-4 text-end align-middle font-ochre-ui text-[10px] font-semibold uppercase tracking-wider text-[#524439]/80">
          Actions
        </th>
      </tr>
    </thead>
  );
}
