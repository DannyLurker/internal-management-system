"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useLocation } from "@/features/locations/location.hooks";
import {
  formatLocationTypeBadge,
  formatTimestamp,
} from "@/features/locations/location.utils";
import { locationGetSpesificSchema } from "@/shared/lib/zods/location.zod";
import LocationInfoPanelTable from "./LocationInfoPanelTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  SortItemByAtLocation,
  StockTypeStatus,
} from "@/shared/lib/types/zod.type";

type LocationInfoPanelProps = {
  open: boolean;
  locationId: string;
  onClose: () => void;
};

export default function LocationInfoPanel({
  open,
  locationId,
  onClose,
}: LocationInfoPanelProps) {
  const [itemPage, setItemPage] = useState(1);
  const [itemDataPerPage, setItemDataPerPage] = useState(10);
  const [itemSortBy, setItemSortBy] = useState<SortItemByAtLocation>("name");
  const [itemSortOrder, setItemSortOrder] = useState<"asc" | "desc">("asc");
  const [statusStockType, setStatusStockType] =
    useState<StockTypeStatus>("READY");
  const [itemSearchInput, setItemSearchInput] = useState("");
  const [debouncedItemSearch, setDebouncedItemSearch] = useState("");

  useEffect(() => {
    const id = window.setTimeout(
      () => setDebouncedItemSearch(itemSearchInput),
      350,
    );
    return () => window.clearTimeout(id);
  }, [itemSearchInput]);

  useEffect(() => {
    setItemPage(1);
  }, [
    debouncedItemSearch,
    locationId,
    itemDataPerPage,
    itemSortBy,
    itemSortOrder,
  ]);

  const itemParams = useMemo(
    () =>
      locationGetSpesificSchema.parse({
        itemPage,
        itemDataPerPage,
        sortOrder: itemSortOrder,
        sortBy: itemSortBy,
        ...(debouncedItemSearch.trim().length >= 3
          ? { itemSearchQuery: debouncedItemSearch.trim() }
          : {}),
        stockStatusType: statusStockType,
      }),
    [
      itemPage,
      itemDataPerPage,
      itemSortOrder,
      itemSortBy,
      debouncedItemSearch,
      statusStockType,
    ],
  );

  const { data, isLoading, isError } = useLocation(locationId, itemParams);

  const locationData = data?.data.location;

  const totalStocksCount = data?.data.totalStocks ?? 0;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton
        className="flex h-[80vh] max-h-[80vh] w-full max-w-lg flex-col gap-0 overflow-hidden rounded-lg border-[#eef4ff] p-0 sm:max-w-4xl md:max-w-6xl"
      >
        <DialogHeader className="border-b border-[#eef4ff] px-6 py-5 text-left">
          <DialogTitle className="font-ochre-brand text-2xl font-medium text-[#894d0d]">
            {isLoading
              ? "Location Details"
              : (locationData?.name ?? "Location Details")}
          </DialogTitle>
          <DialogDescription className="font-ochre-ui text-sm text-[#524439]/80">
            View storage location metadata and current items inventory.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
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
          ) : locationData ? (
            <div className="grid grid-cols-1 gap-6 items-start lg:grid-cols-12">
              {/* Left Column: Metadata */}
              <div className="lg:col-span-5 space-y-4">
                <div className="rounded-lg border border-[#eef4ff] bg-[#f8f9ff]/50 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-md bg-[#121c28] px-2.5 py-1 font-ochre-ui text-[10px] font-semibold uppercase tracking-wide text-white">
                      {formatLocationTypeBadge(locationData.type)}
                    </span>
                  </div>
                  <dl className="mt-4 space-y-3 font-ochre-ui text-xs text-[#524439]">
                    <div className="flex justify-between gap-3 border-b border-[#eef4ff] pb-2">
                      <dt className="text-[#524439]/70 font-medium">
                        Created by
                      </dt>
                      <dd className="font-semibold text-[#121c28]">
                        {locationData.userCreatedBy.name}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3 border-b border-[#eef4ff] pb-2">
                      <dt className="text-[#524439]/70 font-medium">
                        Updated by
                      </dt>
                      <dd className="font-semibold text-[#121c28]">
                        {locationData.userUpdatedBy?.name ?? "—"}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3 border-b border-[#eef4ff] pb-2">
                      <dt className="text-[#524439]/70 font-medium">Created</dt>
                      <dd className="font-semibold text-[#121c28]">
                        {formatTimestamp(locationData.createdAt)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3 border-b border-[#eef4ff] pb-2">
                      <dt className="text-[#524439]/70 font-medium">Updated</dt>
                      <dd className="font-semibold text-[#121c28]">
                        {formatTimestamp(locationData.updatedAt)}
                      </dd>
                    </div>
                    <div className="flex flex-col gap-1 pt-1">
                      <dt className="text-[#524439]/70 font-medium">
                        Description
                      </dt>
                      <dd className="font-normal text-[#121c28] whitespace-pre-wrap leading-relaxed text-left text-sm bg-white/70 border border-[#eef4ff] rounded-md p-2.5 mt-1">
                        {locationData.description?.trim() ||
                          "No description provided."}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Right Column: Items Table */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between border-b border-[#eef4ff] pb-2">
                  <h3 className="font-ochre-brand text-lg font-medium text-[#894d0d]">
                    Items in this location
                  </h3>
                  <span className="rounded-full bg-[#894d0d] px-2.5 py-0.5 text-xs font-semibold text-white">
                    {totalStocksCount} items
                  </span>
                </div>

                {/* Controls: show count + sort */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-ochre-ui text-xs font-medium uppercase tracking-wide text-[#524439]/70">
                      Show:
                    </span>
                    <select
                      value={String(itemDataPerPage)}
                      onChange={(e) => {
                        setItemDataPerPage(Number(e.target.value));
                      }}
                      className="min-w-28 appearance-none rounded-lg border border-[#e5eeff] bg-[#f8f9ff]/80 px-2 py-1.5 font-ochre-ui text-sm text-[#121c28] outline-none transition-colors duration-200 hover:border-[#b0c8f8] focus:border-[#894d0d]/35 focus:ring-2 focus:ring-[#894d0d]/15 focus:outline-none"
                    >
                      {[10, 20, 50, 100].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-ochre-ui text-xs font-medium uppercase tracking-wide text-[#524439]/70">
                      Sort:
                    </span>
                    <select
                      value={itemSortBy}
                      onChange={(e) =>
                        setItemSortBy(e.target.value as SortItemByAtLocation)
                      }
                      className="min-w-28 appearance-none rounded-lg border border-[#e5eeff] bg-[#f8f9ff]/80 px-2 py-1.5 font-ochre-ui text-sm text-[#121c28] outline-none transition-colors duration-200 hover:border-[#b0c8f8] focus:border-[#894d0d]/35 focus:ring-2 focus:ring-[#894d0d]/15 focus:outline-none"
                    >
                      <option value="name">Name</option>
                      <option value="stockType">Stock Type</option>
                    </select>
                  </div>

                  {itemSortBy == "stockType" && (
                    <div className="flex items-center gap-2">
                      <span className="font-ochre-ui text-xs font-medium uppercase tracking-wide text-[#524439]/70 focus:outline-0">
                        Status:
                      </span>
                      <select
                        value={statusStockType}
                        onChange={(e) =>
                          setStatusStockType(e.target.value as StockTypeStatus)
                        }
                        className="min-w-28 appearance-none rounded-lg border border-[#e5eeff] bg-[#f8f9ff]/80 px-2 py-1.5 font-ochre-ui text-sm text-[#121c28] outline-none transition-colors duration-200 hover:border-[#b0c8f8] focus:border-[#894d0d]/35 focus:ring-2 focus:ring-[#894d0d]/15 focus:outline-none"
                      >
                        <option value="READY">Ready</option>
                        <option value="DAMAGED">Damaged</option>
                        <option value="DIRTY">Dirty</option>
                        <option value="EXPIRED">Expired</option>
                      </select>
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setItemSortOrder("asc")}
                      className={`rounded-lg border border-[#e5eeff] bg-[#f8f9ff]/80 p-1.5 text-[#565e74] outline-none transition-colors hover:border-[#894d0d]/35 hover:text-[#894d0d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#894d0d]${
                        itemSortOrder === "asc"
                          ? " border-[#894d0d]/35 text-[#894d0d] ring-2 ring-[#894d0d]/15"
                          : ""
                      }`}
                      aria-label="Sort ascending"
                    >
                      <ArrowUp className="size-4" strokeWidth={1.5} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setItemSortOrder("desc")}
                      className={`rounded-lg border border-[#e5eeff] bg-[#f8f9ff]/80 p-1.5 text-[#565e74] outline-none transition-colors hover:border-[#894d0d]/35 hover:text-[#894d0d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#894d0d]${
                        itemSortOrder === "desc"
                          ? " border-[#894d0d]/35 text-[#894d0d] ring-2 ring-[#894d0d]/15"
                          : ""
                      }`}
                      aria-label="Sort descending"
                    >
                      <ArrowDown className="size-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>

                <LocationInfoPanelTable
                  stocks={locationData.stocks}
                  totalStocksCount={totalStocksCount}
                  itemPage={itemPage}
                  itemDataPerPage={itemDataPerPage}
                  itemSearchQuery={itemSearchInput}
                  onPageChange={setItemPage}
                  onSearchChange={setItemSearchInput}
                />
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
