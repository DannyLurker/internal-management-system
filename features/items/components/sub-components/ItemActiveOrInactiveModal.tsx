"use client";

import { useId } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { Item } from "@/features/items/item.types";
import { useUpdateItem } from "@/features/items/item.hooks";
import { ItemUpdateSchema } from "@/shared/lib/zods/item.zod";
import { attributesToRecord, parseAttributes } from "../../item.utils";

type ItemActiveOrInactiveModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Item | null;
  onSuccess: () => void;
  status: "ACTIVE" | "INACTIVE";
};

export default function ItemActiveOrInactiveModal({
  open,
  onOpenChange,
  item,
  onSuccess,
  status,
}: ItemActiveOrInactiveModalProps) {
  const titleId = useId();
  const updateMutation = useUpdateItem();

  const handleClose = () => onOpenChange(false);

  const handleConfirm = async () => {
    if (!item) return;

    const parseAttributesToKeyValue = parseAttributes(item.attributes);

    const payload: ItemUpdateSchema = {
      name: item.name,
      categoryId: item.categoryId ? item.categoryId : undefined,
      attributes: attributesToRecord(parseAttributesToKeyValue),
      description: item.description,
      image: item.image ? item.image : undefined,
      minThreshold: item.minThreshold,
      sellingPrice: item.sellingPrice ? item.sellingPrice : undefined,
      isActive: status === "ACTIVE",
    };

    try {
      await updateMutation.mutateAsync({ itemId: item.id, payload });
      onOpenChange(false);
      onSuccess();
    } catch {}
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button
            type="button"
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            aria-label="Close dialog"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-xl bg-white shadow-[0_24px_64px_-24px_rgba(15,23,42,0.28)]"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", damping: 24, stiffness: 320 }}
          >
            <div className="flex flex-col items-center px-6 pb-2 pt-8 text-center">
              <span
                className={cn(
                  "flex size-12 items-center justify-center rounded-xl",
                  status === "ACTIVE"
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-amber-100 text-amber-600",
                )}
              >
                <AlertTriangle
                  className="size-6"
                  strokeWidth={1.5}
                  aria-hidden
                />
              </span>
              <h2
                id={titleId}
                className="mt-5 font-ochre-brand text-2xl font-medium text-[#121c28]"
              >
                {status === "ACTIVE" ? "Activate" : "Deactivate"} item?
              </h2>
            </div>

            {status === "ACTIVE" ? (
              <div className="mx-6 mb-6 rounded-lg bg-emerald-50/50 px-4 py-4 text-center border border-emerald-100">
                <p className="font-ochre-ui text-sm leading-relaxed text-[#524439]">
                  You are about to activate the{" "}
                  <span className="font-semibold text-[#121c28]">
                    {item?.name ?? "this item"}
                  </span>{" "}
                  item. Item will be accessible again.
                </p>
              </div>
            ) : (
              <div className="mx-6 mb-6 rounded-lg bg-[#eef4ff]/80 px-4 py-4 text-center">
                <p className="font-ochre-ui text-sm leading-relaxed text-[#524439]">
                  You are about to deactivate the{" "}
                  <span className="font-semibold text-[#121c28]">
                    {item?.name ?? "this item"}
                  </span>{" "}
                  item. Item can't be accessed until it gets activated again.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2 border-t border-[#eef4ff] px-6 py-5">
              <button
                type="button"
                disabled={updateMutation.isPending || !item}
                onClick={() => void handleConfirm()}
                className={cn(
                  "w-full rounded-md py-3 font-ochre-ui text-xs font-semibold uppercase tracking-wider text-white",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                  status === "ACTIVE"
                    ? "bg-emerald-600 hover:bg-emerald-700 focus-visible:outline-emerald-600"
                    : "bg-amber-600 hover:bg-amber-700 focus-visible:outline-amber-600",
                  "focus-visible:outline-2 focus-visible:outline-offset-2",
                )}
              >
                {status === "ACTIVE" ? "Activate" : "Deactivate"} item
              </button>
              <button
                type="button"
                disabled={updateMutation.isPending}
                onClick={handleClose}
                className="py-2 font-ochre-ui text-xs font-semibold uppercase tracking-wider text-[#565e74] hover:text-[#121c28] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#894d0d]"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
