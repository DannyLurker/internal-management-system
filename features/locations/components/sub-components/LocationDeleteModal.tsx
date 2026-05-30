"use client";

import { useId } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useDeleteLocation } from "@/features/locations/location.hooks";
import { cn } from "@/shared/lib/utils";

type LocationDeleteModalProps = {
  open: boolean;
  location: { id: string; name: string } | null;
  onClose: () => void;
  onSuccess: () => void;
};

export default function LocationDeleteModal({
  open,
  location,
  onClose,
  onSuccess,
}: LocationDeleteModalProps) {
  const titleId = useId();
  const deleteMutation = useDeleteLocation();

  const handleConfirm = async () => {
    if (!location) return;
    try {
      await deleteMutation.mutateAsync(location.id);
      onSuccess();
      onClose();
    } catch {
      /* errors surfaced by API client */
    }
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
            onClick={onClose}
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
                <AlertTriangle className="size-6" strokeWidth={1.5} aria-hidden />
              </span>
              <h2
                id={titleId}
                className="mt-5 font-ochre-brand text-2xl font-medium text-[#121c28]"
              >
                Delete location?
              </h2>
            </div>

            <div className="mx-6 mb-6 rounded-lg bg-[#eef4ff]/80 px-4 py-4 text-center">
              <p className="font-ochre-ui text-sm leading-relaxed text-[#524439]">
                You are about to delete the{" "}
                <span className="font-semibold text-[#121c28]">
                  {location?.name ?? "this location"}
                </span>{" "}
                location. This action is{" "}
                <span className="font-semibold text-[#ba1a1a]">irreversible</span>{" "}
                and will remove all stock records associated with this location.
              </p>
            </div>

            <div className="flex flex-col gap-2 border-t border-[#eef4ff] px-6 py-5">
              <button
                type="button"
                disabled={deleteMutation.isPending || !location}
                onClick={() => void handleConfirm()}
                className={cn(
                  "w-full rounded-md bg-[#894d0d] py-3 font-ochre-ui text-xs font-semibold uppercase tracking-wider text-white",
                  "hover:bg-[#6d3a00] disabled:cursor-not-allowed disabled:opacity-60",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#894d0d]",
                )}
              >
                Delete location
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={onClose}
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
