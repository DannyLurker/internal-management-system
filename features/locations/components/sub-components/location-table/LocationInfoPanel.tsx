"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useLocation } from "@/features/locations/location.hooks";
import {
  formatLocationTypeBadge,
  formatTimestamp,
} from "@/features/locations/location.utils";
import { locationGetSpesificSchema } from "@/shared/lib/zods/location.zod";
import LocationInfoPanelTable from "./LocationInfoPanelTable";
import { cn } from "@/shared/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

type LocationInfoPanelProps = {
  locationId: string;
  onClose: () => void;
};

export default function LocationInfoPanel({
  locationId,
  onClose,
}: LocationInfoPanelProps) {
  const [itemPage, setItemPage] = useState(1);
  const [itemDataPerPage] = useState(10);
  const [itemSearchInput, setItemSearchInput] = useState("");
  const [debouncedItemSearch, setDebouncedItemSearch] = useState("");
  const [isItemsOpen, setIsItemsOpen] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(
      () => setDebouncedItemSearch(itemSearchInput),
      350,
    );
    return () => window.clearTimeout(id);
  }, [itemSearchInput]);

  useEffect(() => {
    setItemPage(1);
  }, [debouncedItemSearch, locationId]);

  const itemParams = useMemo(
    () =>
      locationGetSpesificSchema.parse({
        itemPage,
        itemDataPerPage,
        ...(debouncedItemSearch.trim().length >= 3
          ? { itemSearchQuery: debouncedItemSearch.trim() }
          : {}),
      }),
    [itemPage, itemDataPerPage, debouncedItemSearch],
  );

  const { data, isLoading, isError } = useLocation(locationId, itemParams);

  const location = data?.data;

  console.log("location:", location);

  const totalStocksCount = 0;

  return (
    <motion.aside
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ type: "spring", damping: 26, stiffness: 280 }}
      className="flex h-full min-h-0 w-full shrink-0 flex-col overflow-hidden rounded-xl border border-[#d9e3f4]/80 bg-white shadow-[0_16px_48px_-20px_rgba(15,23,42,0.08)] lg:w-88 xl:w-104"
    >
      <div className="flex items-start justify-between gap-3 border-b border-[#eef4ff] px-4 py-4">
        <div className="min-w-0">
          <p className="font-ochre-ui text-[10px] font-semibold uppercase tracking-wider text-[#524439]/70">
            Location details
          </p>
          {isLoading ? (
            <div className="mt-2 h-7 w-40 animate-pulse rounded-md bg-[#eef4ff]/80" />
          ) : (
            <h2 className="mt-1 truncate font-ochre-brand text-xl font-medium text-[#121c28]">
              {location?.name ?? "—"}
            </h2>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-[#565e74] hover:bg-[#eef4ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#894d0d]"
          aria-label="Close panel"
        >
          <X className="size-5" strokeWidth={1.5} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {isError ? (
          <p className="font-ochre-ui text-sm text-[#93000a]" role="alert">
            Unable to load location details.
          </p>
        ) : isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-4 animate-pulse rounded-md bg-[#eef4ff]/80"
              />
            ))}
          </div>
        ) : location ? (
          <div className="space-y-5">
            <div className="rounded-lg border border-[#eef4ff] bg-[#f8f9ff]/50 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-md bg-[#121c28] px-2.5 py-1 font-ochre-ui text-[10px] font-semibold uppercase tracking-wide text-white">
                  {formatLocationTypeBadge(location.type)}
                </span>
              </div>
              <p className="mt-3 font-ochre-ui text-sm leading-relaxed text-[#524439]">
                {location.description?.trim() || "No description provided."}
              </p>
              <dl className="mt-4 space-y-2 font-ochre-ui text-xs text-[#524439]">
                <div className="flex justify-between gap-3">
                  <dt className="text-[#524439]/70">Created by</dt>
                  <dd className="font-medium text-[#121c28]">
                    {location.userCreatedBy.name}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#524439]/70">Updated by</dt>
                  <dd className="font-medium text-[#121c28]">
                    {location.userUpdatedBy?.name ?? "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#524439]/70">Created</dt>
                  <dd className="font-medium text-[#121c28]">
                    {formatTimestamp(location.createdAt)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#524439]/70">Updated</dt>
                  <dd className="font-medium text-[#121c28]">
                    {formatTimestamp(location.updatedAt)}
                  </dd>
                </div>
                <div className="flex flex-col gap-1 border-t border-[#eef4ff] pt-2 mt-2">
                  <dt className="text-[#524439]/70">Description</dt>
                  <dd className="font-normal text-[#121c28] whitespace-pre-wrap leading-relaxed text-left">
                    {location.description?.trim() || "No description provided."}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="mb-3 font-ochre-ui text-[10px] font-semibold uppercase tracking-wider text-[#524439]/80">
                Items in this location
              </h3>
              <button
                type="button"
                onClick={() => setIsItemsOpen(true)}
                className={cn(
                  "w-full flex items-center justify-between gap-3 rounded-lg border border-[#d9e3f4] bg-[#f8f9ff]/50 px-4 py-3 font-ochre-ui text-sm text-[#121c28] shadow-xs",
                  "transition-colors hover:bg-[#eef4ff] hover:border-[#894d0d]/30",
                )}
              >
                <span className="font-semibold text-[#894d0d]">
                  View items table
                </span>
                <span className="rounded-full bg-[#894d0d] px-2.5 py-0.5 text-xs font-semibold text-white">
                  {totalStocksCount}
                </span>
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {location ? (
        <Dialog open={isItemsOpen} onOpenChange={setIsItemsOpen}>
          <DialogContent
            showCloseButton
            className="sm:max-w-2xl max-h-[85vh] flex flex-col gap-0 overflow-hidden border-[#eef4ff] p-0"
          >
            <DialogHeader className="border-b border-[#eef4ff] px-6 py-5 text-left">
              <DialogTitle className="font-ochre-brand text-2xl font-medium text-[#894d0d]">
                Items in {location.name}
              </DialogTitle>
              <DialogDescription className="font-ochre-ui text-sm text-[#524439]/80">
                Showing items currently stored at this location.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-6 min-h-0">
              <LocationInfoPanelTable
                stocks={location.stocks}
                totalStocksCount={totalStocksCount}
                itemPage={itemPage}
                itemDataPerPage={itemDataPerPage}
                itemSearchQuery={itemSearchInput}
                onPageChange={setItemPage}
                onSearchChange={setItemSearchInput}
              />
            </div>
          </DialogContent>
        </Dialog>
      ) : null}
    </motion.aside>
  );
}
