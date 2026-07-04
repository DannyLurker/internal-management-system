"use client";

import { Eye } from "lucide-react";
import type { StockMovementGetManyApiResponse } from "@/features/stock-movements/stock-movements.types";
import { formatItemDate, formatItemPrice } from "@/shared/lib/formatter";
import { cn } from "@/shared/lib/utils";

type StockMovementRow =
  StockMovementGetManyApiResponse["data"]["movements"][number];

type TableRowProps = {
  movement: StockMovementRow;
  onInfo: (movementId: string) => void;
};

const movementTone: Record<string, string> = {
  RECEIVE: "border-emerald-500/40 bg-emerald-50 text-emerald-800",
  TRANSFER: "border-sky-500/40 bg-sky-50 text-sky-800",
  CONSUME: "border-amber-500/40 bg-amber-50 text-amber-800",
  SALE: "border-violet-500/40 bg-violet-50 text-violet-800",
  DISCARD: "border-rose-500/40 bg-rose-50 text-rose-800",
  LAUNDRY_OUT: "border-indigo-500/40 bg-indigo-50 text-indigo-800",
  LAUNDRY_IN: "border-cyan-500/40 bg-cyan-50 text-cyan-800",
  ADJUSTMENT: "border-[#894d0d]/40 bg-[#894d0d]/10 text-[#894d0d]",
  MARK_AS_DAMAGED: "border-red-500/40 bg-red-50 text-red-800",
  MARK_AS_DIRTY: "border-stone-500/40 bg-stone-50 text-stone-800",
  MARK_AS_LOST: "border-zinc-500/40 bg-zinc-50 text-zinc-800",
  MARK_AS_EXPIRED: "border-orange-500/40 bg-orange-50 text-orange-800",
};

function formatMovementType(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

export default function TableRow({ movement, onInfo }: TableRowProps) {
  const sourceName = movement.sourceLocation?.name ?? "-";
  const destinationName = movement.destinationLocation?.name ?? "-";
  const costLabel =
    movement.totalCost == null
      ? "No cost logged"
      : formatItemPrice(movement.totalCost);

  return (
    <tr className="border-b border-[#eef4ff] last:border-0 hover:bg-[#f8f9ff]/80">
      <td className="px-4 py-3 align-middle">
        <div className="min-w-0">
          <p className="truncate font-ochre-ui text-sm font-semibold text-[#121c28]">
            {movement.item?.name ?? "Unknown item"}
          </p>
        </div>
      </td>
      <td className="px-4 py-3 align-middle">
        <span
          className={cn(
            "inline-flex rounded-full border px-2.5 py-0.5 font-ochre-ui text-[10px] font-semibold uppercase tracking-wider",
            movementTone[movement.type] ??
              "border-[#d9e3f4] bg-[#eef4ff] text-[#565e74]",
          )}
        >
          {formatMovementType(movement.type)}
        </span>
        <p className="mt-1 font-ochre-ui text-xs text-[#524439]/70">
          Qty {movement.quantity}
        </p>
      </td>
      <td className="px-4 py-3 align-middle font-ochre-ui text-sm text-[#524439]">
        {sourceName}
      </td>
      <td className="px-4 py-3 align-middle font-ochre-ui text-sm text-[#524439]">
        {destinationName}
      </td>
      <td className="px-4 py-3 align-middle">
        <p className="font-ochre-ui text-sm text-[#524439]">
          {formatItemDate(movement.createdAt)}
        </p>
        <p className="mt-0.5 font-ochre-ui text-xs text-[#524439]/70">
          {costLabel}
        </p>
      </td>
      <td className="px-4 py-3 text-end align-middle">
        <button
          type="button"
          onClick={() => onInfo(movement.id)}
          className={cn(
            "inline-flex items-center justify-center rounded-md p-2 outline-none transition-all duration-200 ease-out",
            "bg-[#eef4ff] text-[#121c28] hover:-translate-y-0.5 hover:bg-[#e5eeff] hover:text-[#894d0d]",
            "focus-visible:ring-2 focus-visible:ring-[#894d0d] focus-visible:ring-offset-2",
          )}
          aria-label={`View movement for ${movement.item?.name ?? "item"}`}
        >
          <Eye className="size-4" strokeWidth={1.5} />
        </button>
      </td>
    </tr>
  );
}
