"use client";

import { useId } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { Stock } from "@/features/stocks/stock.types";
import { useDeleteItem } from "@/features/stocks/stock.hooks";

type StockDeleteModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stock: Stock | null;
  onSuccess: () => void;
};

export default function StockDeleteModal({
  open,
  onOpenChange,
  stock,
  onSuccess,
}: StockDeleteModalProps) {
  const titleId = useId();
  const deleteMutation = useDeleteItem();

  const handleClose = () => onOpenChange(false);

  const handleConfirm = async () => {
    if (!stock) return;

    try {
      await deleteMutation.mutateAsync(stock.id);
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
              <span className="flex size-12 items-center justify-center rounded-xl bg-[#ffdad6]/90 text-[#ba1a1a]">
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
                Delete stock?
              </h2>
            </div>

            <div className="mx-6 mb-6 rounded-lg bg-[#eef4ff]/80 px-4 py-4 text-center">
              <p className="font-ochre-ui text-sm leading-relaxed text-[#524439]">
                You are about to delete the stock record for{" "}
                <span className="font-semibold text-[#121c28]">
                  {stock?.item.name ?? "this item"}
                </span>{" "}
                at{" "}
                <span className="font-semibold text-[#121c28]">
                  {stock?.location?.name ?? "unknown location"}
                </span>
                . This action is{" "}
                <span className="font-semibold text-[#ba1a1a]">
                  irreversible
                </span>{" "}
                and cannot be undone.
              </p>
            </div>

            <div className="flex flex-col gap-2 border-t border-[#eef4ff] px-6 py-5">
              <button
                type="button"
                disabled={deleteMutation.isPending || !stock}
                onClick={() => void handleConfirm()}
                className={cn(
                  "w-full rounded-md bg-[#894d0d] py-3 font-ochre-ui text-xs font-semibold uppercase tracking-wider text-white",
                  "hover:bg-[#6d3a00] disabled:cursor-not-allowed disabled:opacity-60",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#894d0d]",
                )}
              >
                Delete stock
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
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
