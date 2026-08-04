"use client";

import { LaundryGetManySchema } from "@/shared/lib/zods/laundry.zod";
import { ArrowUpDown } from "lucide-react";

type TableHeaderProps = {
  sortBy: LaundryGetManySchema["sortBy"];
  sortOrder: LaundryGetManySchema["sortOrder"];
  onRequestSort: (column: LaundryGetManySchema["sortBy"]) => void;
};

export default function TableHeader({
  sortBy,
  sortOrder,
  onRequestSort,
}: TableHeaderProps) {
  return (
    <thead className="border-b border-[#d9e3f4] bg-[#eef4ff]/70 text-left font-ochre-ui text-xs font-semibold uppercase tracking-wider text-[#524439]">
      <tr>
        <th scope="col" className="px-4 py-3.5 align-middle">
          Item Name
        </th>
        <th scope="col" className="px-4 py-3.5 align-middle">
          <button
            type="button"
            onClick={() => onRequestSort("quantity")}
            className="inline-flex items-center gap-1 hover:text-[#894d0d] focus:outline-none"
          >
            Quantity
            <ArrowUpDown className="size-3.5" />
          </button>
        </th>
        <th scope="col" className="px-4 py-3.5 align-middle">
          <button
            type="button"
            onClick={() => onRequestSort("totalLaundryPrice")}
            className="inline-flex items-center gap-1 hover:text-[#894d0d] focus:outline-none"
          >
            Total Laundry Price
            <ArrowUpDown className="size-3.5" />
          </button>
        </th>
        <th scope="col" className="px-4 py-3.5 align-middle">
          <button
            type="button"
            onClick={() => onRequestSort("returnedAt")}
            className="inline-flex items-center gap-1 hover:text-[#894d0d] focus:outline-none"
          >
            Return At
            <ArrowUpDown className="size-3.5" />
          </button>
        </th>
        <th scope="col" className="px-4 py-3.5 align-middle">
          <button
            type="button"
            onClick={() => onRequestSort("sentAt")}
            className="inline-flex items-center gap-1 hover:text-[#894d0d] focus:outline-none"
          >
            Sent At
            <ArrowUpDown className="size-3.5" />
          </button>
        </th>
        <th scope="col" className="px-4 py-3.5 align-middle">
          Source Location
        </th>
        <th scope="col" className="px-4 py-3.5 align-middle">
          Destination Location
        </th>
        <th scope="col" className="px-4 py-3.5 align-middle">
          Creator
        </th>
        <th scope="col" className="px-4 py-3.5 text-right align-middle">
          Actions
        </th>
      </tr>
    </thead>
  );
}
