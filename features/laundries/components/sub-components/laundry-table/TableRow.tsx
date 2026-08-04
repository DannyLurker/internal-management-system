"use client";

import { Info, RotateCcw, XCircle } from "lucide-react";
import { Laundry } from "@/features/laundries/laundry.types";
import { formatPrice } from "@/shared/lib/formatter";
import { cn, formatTimestamp } from "@/shared/lib/utils";
import { getLaundryStatusBadge } from "@/features/laundries/laundry.utils";

type TableRowProps = {
  laundry: Laundry;
  index: number;
  onInfo: (laundry: Laundry) => void;
  onAction: (laundry: Laundry, actionType: "RETURNED" | "CANCELLED") => void;
};

export default function TableRow({
  laundry,
  index,
  onInfo,
  onAction,
}: TableRowProps) {
  const isEven = index % 2 === 0;
  const statusBadge = getLaundryStatusBadge(laundry.status);
  const isSent = laundry.status === "SENT";

  return (
    <tr
      className={cn(
        "border-b border-[#eef4ff] transition-colors duration-150",
        isEven ? "bg-[#f8f9ff]/50" : "bg-white",
        "hover:bg-[#f5f8ff]",
      )}
    >
      <td className="px-4 py-3.5 align-middle">
        <div className="flex flex-col min-w-0">
          <span className="font-ochre-ui font-semibold text-[#121c28] truncate text-sm">
            {laundry.item?.name ?? "Unknown Item"}
          </span>
        </div>
      </td>

      <td className="px-4 py-3.5 align-middle font-ochre-ui text-sm font-semibold text-[#121c28]">
        {laundry.quantity}
      </td>

      <td className="px-4 py-3.5 align-middle font-ochre-ui text-sm font-medium text-[#894d0d]">
        {laundry.totalLaundryPrice
          ? formatPrice(laundry.totalLaundryPrice)
          : "—"}
      </td>

      <td className="px-4 py-3.5 align-middle font-ochre-ui text-xs text-[#524439] max-w-40 truncate">
        {formatTimestamp(laundry.returnedAt ?? "")}
      </td>

      <td className="px-4 py-3.5 align-middle font-ochre-ui text-xs text-[#524439] whitespace-nowrap">
        {formatTimestamp(laundry.sentAt)}
      </td>

      <td className="px-4 py-3.5 align-middle font-ochre-ui text-xs font-medium text-[#121c28]">
        {laundry.sourceLocation?.name || "—"}
      </td>

      <td className="px-4 py-3.5 align-middle font-ochre-ui text-xs font-medium text-[#121c28]">
        {laundry.destinationLocation?.name || "—"}
      </td>

      <td className="px-4 py-3.5 align-middle font-ochre-ui text-xs text-[#524439]">
        {laundry.vendorLaundryStock?.creator?.name || "System"}
      </td>

      <td className="px-4 py-3.5 align-middle text-right whitespace-nowrap">
        <div className="inline-flex items-center justify-end gap-1.5">
          {isSent ? (
            <>
              <button
                type="button"
                onClick={() => onAction(laundry, "RETURNED")}
                className="inline-flex items-center gap-1 rounded-md bg-[#894d0d] px-2.5 py-1 font-ochre-ui text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#a76526] active:scale-95 focus-visible:outline-2 focus-visible:outline-[#894d0d]"
                title="Mark as Returned"
              >
                <RotateCcw className="size-3.5" />
                Returned
              </button>

              <button
                type="button"
                onClick={() => onAction(laundry, "CANCELLED")}
                className="inline-flex items-center gap-1 rounded-md border border-[#ffdad6] bg-rose-50 px-2.5 py-1 font-ochre-ui text-xs font-semibold text-rose-800 transition-all hover:bg-rose-100 active:scale-95 focus-visible:outline-2 focus-visible:outline-rose-600"
                title="Cancel Laundry Batch"
              >
                <XCircle className="size-3.5" />
                Cancel
              </button>
            </>
          ) : (
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 font-ochre-ui text-[10px] font-bold uppercase tracking-wider",
                statusBadge.className,
              )}
            >
              {statusBadge.label}
            </span>
          )}

          <button
            type="button"
            onClick={() => onInfo(laundry)}
            className="inline-flex size-7 items-center justify-center rounded-md border border-[#e5eeff] bg-[#eef4ff] text-[#894d0d] transition-all hover:bg-[#894d0d] hover:text-white shadow-xs focus-visible:outline-2 focus-visible:outline-[#894d0d]"
            title="View Full Details (I)"
            aria-label={`View details for ${laundry.item?.name}`}
          >
            <Info className="size-4" strokeWidth={2} />
          </button>
        </div>
      </td>
    </tr>
  );
}
