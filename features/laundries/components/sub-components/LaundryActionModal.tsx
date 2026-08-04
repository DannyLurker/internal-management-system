"use client";

import { useState } from "react";
import {
  LaundryGetByIdService,
  LocationOption,
} from "@/features/laundries/laundry.types";
import { useLaundryAction } from "@/features/laundries/laundry.hooks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { RotateCcw, XCircle, Loader2 } from "lucide-react";

type LaundryActionModalProps = {
  open: boolean;
  laundry: LaundryGetByIdService["laundry"] | null;
  actionType: "RETURNED" | "CANCELLED" | null;
  locations: LocationOption[];
  onClose: () => void;
};

export default function LaundryActionModal({
  open,
  laundry,
  actionType,
  locations,
  onClose,
}: LaundryActionModalProps) {
  const [destinationLocationId, setDestinationLocationId] =
    useState<string>("");

  const laundryActionMutation = useLaundryAction();

  if (!laundry || !actionType) return null;

  const isReturned = actionType === "RETURNED";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destinationLocationId) return;

    laundryActionMutation.mutate(
      {
        laundryId: laundry.id,
        actionType,
        destinationLocationId,
      },
      {
        onSuccess: () => {
          setDestinationLocationId("");
          onClose();
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-md rounded-xl border-[#d9e3f4] bg-white p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="font-ochre-brand text-xl font-semibold text-[#894d0d] flex items-center gap-2">
            {isReturned ? (
              <>
                <RotateCcw className="size-5 text-emerald-700" />
                Return Laundry Items
              </>
            ) : (
              <>
                <XCircle className="size-5 text-rose-700" />
                Cancel Laundry Movement
              </>
            )}
          </DialogTitle>
          <DialogDescription className="font-ochre-ui text-sm text-[#524439]/80 pt-1">
            {isReturned
              ? `Processing return of ${laundry.quantity} ${laundry.item?.name} back into inventory.`
              : `Cancelling laundry movement for ${laundry.quantity} ${laundry.item?.name} (marked as dirty stock).`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5 font-ochre-ui">
            <label className="text-xs font-semibold text-[#121c28]">
              Target Destination Location{" "}
              <span className="text-rose-600">*</span>
            </label>
            <Select
              value={destinationLocationId}
              onValueChange={(val) => setDestinationLocationId(val ?? "")}
              required
            >
              <SelectTrigger className="h-10 w-full rounded-lg border-[#e5eeff] bg-[#f8f9ff]/80 text-sm focus:ring-2 focus:ring-[#894d0d]/20">
                <SelectValue placeholder="Select location for stock..." />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={laundryActionMutation.isPending}
              className="rounded-lg font-ochre-ui border-[#d9e3f4]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !destinationLocationId || laundryActionMutation.isPending
              }
              className={
                isReturned
                  ? "bg-[#894d0d] hover:bg-[#a76526] text-white rounded-lg font-ochre-ui"
                  : "bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-ochre-ui"
              }
            >
              {laundryActionMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-1.5" />
                  Processing...
                </>
              ) : isReturned ? (
                "Confirm Return"
              ) : (
                "Confirm Cancel"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
