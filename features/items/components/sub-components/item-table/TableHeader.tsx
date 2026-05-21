"use client";

import { cn } from "@/shared/lib/utils";

export default function TableHeader() {
  const columns = [
    "ITEM DETAILS",
    "CATEGORY",
    "STOCK",
    "PRICE",
    "STATUS",
    "UPDATED",
    "ACTIONS",
  ] as const;

  return (
    <thead>
      <tr className="border-b border-[#d9e3f4]">
        {columns.map((label) => (
          <th
            key={label || "actions"}
            scope="col"
            className={cn(
              "px-4 py-3 text-left font-ochre-ui text-[11px] font-semibold uppercase tracking-[0.05em] text-[#524439]/80",
              label === "ACTIONS" && "w-12 text-end",
            )}
          >
            {label}
          </th>
        ))}
      </tr>
    </thead>
  );
}
