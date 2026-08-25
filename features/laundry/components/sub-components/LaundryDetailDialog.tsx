"use client";

import { Laundry } from "@/features/laundries/laundry.types";
import { formatPrice } from "@/shared/lib/formatter";
import { formatTimestamp, cn } from "@/shared/lib/utils";
import { getLaundryStatusBadge } from "@/features/laundries/laundry.utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Tag, MapPin, Calendar, Clock, UserCheck, Shirt } from "lucide-react";

type LaundryDetailDialogProps = {
  open: boolean;
  laundry: Laundry | null;
  onClose: () => void;
};

export default function LaundryDetailDialog({
  open,
  laundry,
  onClose,
}: LaundryDetailDialogProps) {
  if (!laundry) return null;

  const statusBadge = getLaundryStatusBadge(laundry.status);

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-xl border-[#d9e3f4] bg-white p-6 shadow-2xl">
        <DialogHeader className="border-b border-[#eef4ff] pb-4 text-left">
          <div className="flex items-center justify-between">
            <DialogTitle className="font-ochre-brand text-2xl font-medium text-[#894d0d] flex items-center gap-2">
              <Shirt className="size-6 text-[#894d0d]" />
              {laundry.item?.name || "Laundry Movement Details"}
            </DialogTitle>
            <span
              className={cn(
                "inline-flex rounded-full border px-3 py-0.5 font-ochre-ui text-xs font-bold uppercase tracking-wider",
                statusBadge.className,
              )}
            >
              {statusBadge.label}
            </span>
          </div>
          <DialogDescription className="font-ochre-ui text-xs text-[#524439]/80 pt-1">
            Complete details and metadata for laundry movement ID: {laundry.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 font-ochre-ui text-xs text-[#524439]">
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-[#f8f9ff] p-4 border border-[#eef4ff]">
            <div>
              <span className="text-[#524439]/70 font-medium">
                Quantity Sent
              </span>
              <p className="font-semibold text-[#121c28] text-base">
                {laundry.quantity} units
              </p>
            </div>
            <div>
              <span className="text-[#524439]/70 font-medium">
                Total Laundry Price
              </span>
              <p className="font-semibold text-[#894d0d] text-base">
                {laundry.totalLaundryPrice
                  ? formatPrice(laundry.totalLaundryPrice)
                  : "—"}
              </p>
            </div>
          </div>

          <dl className="space-y-3">
            <div className="flex justify-between border-b border-[#eef4ff] pb-2">
              <dt className="flex items-center gap-1.5 font-medium text-[#524439]/70">
                <Tag className="size-3.5 text-[#894d0d]" />
                Reason / Note
              </dt>
              <dd className="font-semibold text-[#121c28] text-right">
                {laundry.reason || "—"}
              </dd>
            </div>

            <div className="flex justify-between border-b border-[#eef4ff] pb-2">
              <dt className="flex items-center gap-1.5 font-medium text-[#524439]/70">
                <Clock className="size-3.5 text-[#894d0d]" />
                Sent At
              </dt>
              <dd className="font-semibold text-[#121c28]">
                {formatTimestamp(laundry.sentAt)}
              </dd>
            </div>

            {laundry.returnedAt && (
              <div className="flex justify-between border-b border-[#eef4ff] pb-2">
                <dt className="flex items-center gap-1.5 font-medium text-[#524439]/70">
                  <Clock className="size-3.5 text-[#894d0d]" />
                  Returned / Completed At
                </dt>
                <dd className="font-semibold text-[#121c28]">
                  {formatTimestamp(laundry.returnedAt)}
                </dd>
              </div>
            )}

            <div className="flex justify-between border-b border-[#eef4ff] pb-2">
              <dt className="flex items-center gap-1.5 font-medium text-[#524439]/70">
                <MapPin className="size-3.5 text-[#894d0d]" />
                Source Location
              </dt>
              <dd className="font-semibold text-[#121c28]">
                {laundry.sourceLocation?.name || "—"}
              </dd>
            </div>

            <div className="flex justify-between border-b border-[#eef4ff] pb-2">
              <dt className="flex items-center gap-1.5 font-medium text-[#524439]/70">
                <MapPin className="size-3.5 text-[#894d0d]" />
                Destination Location
              </dt>
              <dd className="font-semibold text-[#121c28]">
                {laundry.destinationLocation?.name || "—"}
              </dd>
            </div>

            <div className="flex justify-between border-b border-[#eef4ff] pb-2">
              <dt className="flex items-center gap-1.5 font-medium text-[#524439]/70">
                <UserCheck className="size-3.5 text-[#894d0d]" />
                Creator
              </dt>
              <dd className="font-semibold text-[#121c28]">
                {laundry.vendorLaundryStock?.creator?.name || "System"}
              </dd>
            </div>

            <div className="flex justify-between border-b border-[#eef4ff] pb-2">
              <dt className="flex items-center gap-1.5 font-medium text-[#524439]/70">
                <Calendar className="size-3.5 text-[#894d0d]" />
                Record Created At
              </dt>
              <dd className="font-semibold text-[#121c28]">
                {formatTimestamp(laundry.createdAt)}
              </dd>
            </div>
          </dl>
        </div>
      </DialogContent>
    </Dialog>
  );
}
