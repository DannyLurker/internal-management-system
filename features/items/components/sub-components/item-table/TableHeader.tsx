"use client";
import { cn } from "@/shared/lib/utils";
import { ItemGetManySchema } from "@/shared/lib/zods/item.zod";
type SortBy = ItemGetManySchema["sortBy"];
type TableHeaderProps = {
  sortBy: SortBy;
  sortOrder: "asc" | "desc";
  onRequestSort: (column: SortBy) => void;
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
      <tr className="border-b border-[#d9e3f4] text-left h-12">
        <th className="px-4 align-middle font-ochre-ui text-[10px] font-semibold uppercase tracking-wider text-[#524439]/80">
          <button
            type="button"
            onClick={() => onRequestSort("name")}
            className={cn(
              "inline-flex items-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-[#894d0d]/40",
              sortBy === "name" && "text-[#894d0d]",
            )}
          >
            ITEM DETAILS
            <SortIndicator active={sortBy === "name"} order={sortOrder} />
          </button>
        </th>
        <th className="px-4 align-middle font-ochre-ui text-[10px] font-semibold uppercase tracking-wider text-[#524439]/80">
          STATUS
        </th>
        <th className="px-4 align-middle font-ochre-ui text-[10px] font-semibold uppercase tracking-wider text-[#524439]/80">
          CATEGORY
        </th>
        <th className="px-4 align-middle font-ochre-ui text-[10px] font-semibold uppercase tracking-wider text-[#524439]/80">
          PRICE
        </th>
        <th className="px-4 align-middle font-ochre-ui text-[10px] font-semibold uppercase tracking-wider text-[#524439]/80">
          <button
            type="button"
            onClick={() => onRequestSort("createdAt")}
            className={cn(
              "inline-flex items-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-[#894d0d]/40",
              sortBy === "createdAt" && "text-[#894d0d]",
            )}
          >
            UPDATED
            <SortIndicator active={sortBy === "createdAt"} order={sortOrder} />
          </button>
        </th>
        <th className="w-24 px-4 align-middle text-end font-ochre-ui text-[10px] font-semibold uppercase tracking-wider text-[#524439]/80">
          ACTIONS
        </th>
      </tr>
    </thead>
  );
}
