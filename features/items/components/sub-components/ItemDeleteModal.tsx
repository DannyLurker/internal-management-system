"use client";

import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import type { Item } from "@/features/items/item.types";
import { useDeleteItem } from "@/features/items/item.hooks";
import { cn } from "@/shared/lib/utils";

type ItemDeleteModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Item | null;
  onSuccess: () => void;
};

export default function ItemDeleteModal({
  open,
  onOpenChange,
  item,
  onSuccess,
}: ItemDeleteModalProps) {
  const deleteMutation = useDeleteItem();

  const handleConfirm = async () => {
    if (!item) return;
    try {
      await deleteMutation.mutateAsync(item.id);
      onOpenChange(false);
      onSuccess();
    } catch {
      /* API client surfaces errors */
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-md gap-0 overflow-hidden rounded-lg p-0 sm:max-w-md"
      >
        <div className="h-1 w-full rounded-t-lg bg-red-600" aria-hidden />
        <div className="flex flex-col items-center px-6 pb-2 pt-8 text-center">
          <span className="flex size-12 items-center justify-center rounded-lg bg-red-50 text-red-600">
            <AlertTriangle className="size-6" strokeWidth={1.5} aria-hidden />
          </span>
          <DialogTitle className="mt-5 font-ochre-brand text-2xl font-medium text-[#121c28]">
            Delete item?
          </DialogTitle>
        </div>

        <p className="mx-6 mb-6 text-center font-ochre-ui text-sm leading-relaxed text-[#524439]">
          You are about to delete the &ldquo;
          <span className="font-semibold text-[#121c28]">
            {item?.name ?? "this item"}
          </span>
          &rdquo; item. This action is irreversible and will remove all
          associated stock and financial history.
        </p>

        <div className="flex flex-col gap-2 px-6 pb-6">
          <Button
            type="button"
            disabled={deleteMutation.isPending || !item}
            onClick={() => void handleConfirm()}
            className={cn(
              "h-11 w-full rounded bg-[#121c28] font-ochre-ui text-xs font-semibold uppercase tracking-[0.05em] text-white",
              "hover:bg-[#27313e] disabled:opacity-60",
            )}
          >
            Delete item
          </Button>
          <button
            type="button"
            disabled={deleteMutation.isPending}
            onClick={() => onOpenChange(false)}
            className="py-2 text-center font-ochre-ui text-xs font-semibold uppercase tracking-[0.05em] text-[#565e74] hover:text-[#121c28]"
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
