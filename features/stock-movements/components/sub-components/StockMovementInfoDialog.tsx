"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { useStockMovement } from "../..//stock-movements.hooks";
import { formatItemDate, formatPrice } from "@/shared/lib/formatter";
import { formatMovementLabel } from "../../stock-movements.utils";

type StockMovementInfoDialogProps = {
  movementId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function DetailLine({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div>
      <p className="font-ochre-ui text-[10px] font-semibold uppercase tracking-wider text-[#524439]/70">
        {label}
      </p>
      <p className="mt-1 font-ochre-ui text-sm font-semibold text-[#121c28]">
        {value ?? "-"}
      </p>
    </div>
  );
}

export default function StockMovementInfoDialog({
  movementId,
  open,
  onOpenChange,
}: StockMovementInfoDialogProps) {
  const { data, isLoading, isError } = useStockMovement(movementId ?? "", {
    enabled: open && movementId != null,
  });

  const movement = data?.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl overflow-hidden rounded-lg p-0 sm:max-w-2xl"
        showCloseButton
      >
        <DialogHeader className="border-b border-[#eef4ff] px-6 py-5">
          <DialogTitle className="font-ochre-brand text-2xl font-medium text-[#894d0d]">
            Stock movement detail
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-12 animate-pulse rounded-md bg-[#eef4ff]/80"
                />
              ))}
            </div>
          ) : isError || !movement ? (
            <div
              className="rounded-lg border border-[#ffdad6] bg-[#fff8f7] px-4 py-3 font-ochre-ui text-sm text-[#93000a]"
              role="alert"
            >
              Unable to load this stock movement.
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <p className="font-ochre-ui text-sm font-semibold text-[#121c28]">
                  {movement.item?.name ?? "Unknown item"}
                </p>
              </div>

              <div className="grid gap-4 rounded-lg border border-[#eef4ff] bg-[#f8f9ff]/60 p-4 sm:grid-cols-2">
                <DetailLine
                  label="Type"
                  value={formatMovementLabel(movement.type)}
                />
                <DetailLine label="Quantity" value={movement.quantity} />
                <DetailLine
                  label="Total cost"
                  value={
                    movement.totalCost == null
                      ? "-"
                      : formatPrice(movement.totalCost)
                  }
                />
                <DetailLine
                  label="Created"
                  value={formatItemDate(movement.createdAt)}
                />
                <DetailLine
                  label="Destination"
                  value={movement.destinationLocation?.name}
                />
                <DetailLine label="Stock type" value={movement.stock?.type} />
                <DetailLine
                  label="Recorded by"
                  value={movement.user?.name ?? "System"}
                />
                <div className="col-span-2">
                  <DetailLine label="Reason" value={movement.reason} />
                </div>
              </div>

              {movement.order ? (
                <div className="rounded-lg border border-[#eef4ff] bg-white p-4">
                  <p className="font-ochre-ui text-[10px] font-semibold uppercase tracking-wider text-[#524439]/70">
                    Linked order
                  </p>
                  <p className="mt-1 font-ochre-ui text-sm font-semibold text-[#121c28]">
                    Room {movement.order.roomNumber} -{" "}
                    {movement.order.guestName}
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
