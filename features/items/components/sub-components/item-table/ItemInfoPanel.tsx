"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Plus } from "lucide-react";
import { useItem } from "@/features/items/item.hooks";
import { formatItemPrice } from "@/shared/lib/formatter";
import { itemGetDetailSchema } from "@/shared/lib/zods/item.zod";
import ItemInfoPanelTable from "./ItemInfoPanelTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from "@/shared/components/ui/dialog";
import { cn, formatTimestamp } from "@/shared/lib/utils";
import {
  Stock,
  StockDelete,
  StockSortBy,
  StockSortOrder,
} from "@/features/stocks/stock.types";

type ItemInfoPanelProps = {
  open: boolean;
  itemId: string;
  onClose: () => void;
  openStockEdit: (stock: Stock) => void;
  openStockDelete: (stock: StockDelete) => void;
  openStockCreate: () => void;
};

export default function ItemInfoPanel({
  open,
  itemId,
  onClose,
  openStockDelete,
  openStockEdit,
  openStockCreate,
}: ItemInfoPanelProps) {
  const [itemStockPage, setItemStockPage] = useState(1);
  const [itemStocksPerpage, setItemStocksPerpage] = useState(10);
  const [sortBy, setSortBy] = useState<StockSortBy>("quantity");
  const [orderBy, setOrderBy] = useState<"asc" | "desc">("asc");
  const [sortOrder, setSortOrder] = useState<StockSortOrder>("desc");
  const [status, setStatus] = useState("ALL");
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    setItemStockPage(1);
  }, [itemId, itemStocksPerpage, sortBy, orderBy, status]);

  const itemParams = useMemo(() => {
    return itemGetDetailSchema.parse({
      itemStockPage,
      itemStocksPerpage,
      sortBy,
      orderBy,
      status: status === "ALL" ? undefined : status, // Clean up "ALL" string if backend expects undefined
    });
  }, [itemStockPage, itemStocksPerpage, sortBy, orderBy, status, setStatus]);

  const handleRequestSort = useCallback((column: StockSortBy) => {
    setSortBy((prevColumn) => {
      if (prevColumn === column) {
        setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
        return prevColumn;
      }
      setSortOrder("asc");
      return column;
    });
  }, []);

  const { data, isLoading, isError } = useItem(itemId, itemParams, {});

  const itemData = data?.data?.item;

  const totalLocatedItemQuantity = data?.data.totalLocatedItemQuantity ?? 0;
  const totalUnlocatedItemQuantity = data?.data.totalUnlocatedItemQuantity ?? 0;
  const totalReadyStock = data?.data.totalReadyStock ?? 0;
  const totalExpiredStock = data?.data.totalExpiredStock ?? 0;
  const totalDamagedStock = data?.data.totalDamagedStock ?? 0;
  const totalDirtyStock = data?.data.totalDirtyStock ?? 0;
  const totalLostStock = data?.data.totalLostStock ?? 0;
  const itemStockCount = data?.data.itemStockCount ?? 0;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogOverlay className="bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogContent
        showCloseButton
        className="flex h-[85vh] max-h-[85vh] w-full max-w-lg flex-col gap-0 overflow-hidden rounded-lg border-[#eef4ff] p-0 sm:max-w-4xl md:max-w-6xl data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-4 data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-bottom-4 duration-300 ease-out"
      >
        <DialogHeader className="border-b border-[#eef4ff] px-6 py-5 text-left">
          <DialogTitle className="font-ochre-brand text-2xl font-medium text-[#894d0d]">
            {isLoading ? "Item Details" : (itemData?.name ?? "Item Details")}
          </DialogTitle>
          <DialogDescription className="font-ochre-ui text-sm text-[#524439]/80">
            View luxury inventory item metadata and stock distribution.
          </DialogDescription>
        </DialogHeader>

        <button
          type="button"
          onClick={() => setShowDetails((prev) => !prev)}
          aria-expanded={showDetails}
          aria-controls="item-info-collapsible"
          className={cn(
            "mx-6 mt-3 inline-flex w-fit items-center gap-1.5 self-start rounded-md border border-[#e5eeff] bg-[#f8f9ff]/80 px-3 py-1.5 font-ochre-ui text-xs font-semibold uppercase tracking-wide text-[#565e74] shadow-[0_2px_8px_-2px_rgba(15,23,42,0.08)] outline-none transition-all duration-300",
            "hover:-translate-y-px hover:border-[#894d0d]/35 hover:text-[#894d0d] hover:shadow-[0_4px_12px_-2px_rgba(15,23,42,0.12)]",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#894d0d]",
          )}
        >
          <span>{showDetails ? "Hide details" : "Show details"}</span>
          <ChevronDown
            className={cn(
              "size-3.5 transition-transform duration-300 ease-in-out",
              showDetails ? "rotate-180" : "rotate-0",
            )}
            strokeWidth={2}
            aria-hidden
          />
        </button>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-2">
          {isError ? (
            <p className="font-ochre-ui text-sm text-[#93000a]" role="alert">
              Unable to load item details.
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
          ) : itemData ? (
            <div className="space-y-6">
              {/* Collapsible: Item Image + Description */}
              <div
                id="item-info-collapsible"
                className={cn(
                  "grid overflow-hidden transition-[grid-template-rows] duration-500 ease-in-out",
                  showDetails ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                <div
                  className={cn(
                    "grid min-h-0 grid-cols-2 gap-6 items-start transition-opacity duration-300 ease-in-out",
                    showDetails ? "opacity-100 delay-150" : "opacity-0",
                  )}
                >
                  {/* Item Image */}
                  <div className="h-full max-h-120">
                    <div className="h-full rounded-lg border border-[#eef4ff] bg-[#f8f9ff]/50 p-4">
                      {itemData.image ? (
                        <div className="relative h-full min-h-125 overflow-hidden">
                          <img
                            src={itemData.image}
                            alt={itemData.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-full min-h-125 items-center justify-center font-ochre-ui text-sm font-semibold uppercase text-[#565e74]">
                          No Image Available
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Item Description */}
                  <div className="h-full max-h-120 overflow-y-auto">
                    <div className="h-full rounded-lg border border-[#eef4ff] bg-[#f8f9ff]/50 p-4">
                      <div className="rounded-lg">
                        <dl className="space-y-3 font-ochre-ui text-xs text-[#524439]">
                          <div className="flex justify-between gap-3 border-b border-[#eef4ff] pb-2">
                            <dt className="text-[#524439]/70 font-medium">
                              Category
                            </dt>
                            <dd className="font-semibold text-[#121c28]">
                              {itemData.category?.name ?? "General"}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-3 border-b border-[#eef4ff] pb-2">
                            <dt className="text-[#524439]/70 font-medium">
                              Selling Price
                            </dt>
                            <dd className="font-semibold text-[#121c28]">
                              {itemData.sellingPrice
                                ? formatItemPrice(itemData.sellingPrice)
                                : "—"}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-3 border-b border-[#eef4ff] pb-2">
                            <dt className="text-[#524439]/70 font-medium">
                              Stock Status
                            </dt>
                            <dd
                              className={cn(
                                "font-semibold",
                                itemData.isStockLow === "Low in stock"
                                  ? "text-[#ba1a1a]"
                                  : "text-emerald-700",
                              )}
                            >
                              {itemData.isStockLow === "Low in stock"
                                ? "Low in stock"
                                : "Normal"}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-3 border-b border-[#eef4ff] pb-2">
                            <dt className="text-[#524439]/70 font-medium">
                              Min Threshold
                            </dt>
                            <dd className="font-semibold text-[#121c28]">
                              {itemData.minThreshold}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-3 border-b border-[#eef4ff] pb-2">
                            <dt className="text-[#524439]/70 font-medium">
                              Ready stocks
                            </dt>
                            <dd className="font-semibold text-[#121c28]">
                              {totalReadyStock}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-3 border-b border-[#eef4ff] pb-2">
                            <dt className="text-[#524439]/70 font-medium">
                              Expired stocks
                            </dt>
                            <dd className="font-semibold text-[#121c28]">
                              {totalExpiredStock}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-3 border-b border-[#eef4ff] pb-2">
                            <dt className="text-[#524439]/70 font-medium">
                              Damaged stocks
                            </dt>
                            <dd className="font-semibold text-[#121c28]">
                              {totalDamagedStock}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-3 border-b border-[#eef4ff] pb-2">
                            <dt className="text-[#524439]/70 font-medium">
                              Dirty stocks
                            </dt>
                            <dd className="font-semibold text-[#121c28]">
                              {totalDirtyStock}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-3 border-b border-[#eef4ff] pb-2">
                            <dt className="text-[#524439]/70 font-medium">
                              Lost stocks
                            </dt>
                            <dd className="font-semibold text-[#121c28]">
                              {totalLostStock}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-3 border-b border-[#eef4ff] pb-2">
                            <dt className="text-[#524439]/70 font-medium">
                              Discarded stocks
                            </dt>
                            <dd className="font-semibold text-[#121c28]">
                              {totalUnlocatedItemQuantity}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-3 border-b border-[#eef4ff] pb-2">
                            <dt className="text-[#524439]/70 font-medium">
                              Located stocks
                            </dt>
                            <dd className="font-semibold text-[#121c28]">
                              {totalLocatedItemQuantity}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-3 border-b border-[#eef4ff] pb-2">
                            <dt className="text-[#524439]/70 font-medium">
                              Unlocated stocks
                            </dt>
                            <dd className="font-semibold text-[#121c28]">
                              {totalUnlocatedItemQuantity}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-3 border-b border-[#eef4ff] pb-2">
                            <dt className="text-[#524439]/70 font-medium">
                              Active Status
                            </dt>
                            <dd className="font-semibold">
                              <span
                                className={cn(
                                  "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                                  itemData.isActive
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-rose-100 text-rose-800",
                                )}
                              >
                                {itemData.isActive ? "Active" : "Inactive"}
                              </span>
                            </dd>
                          </div>
                          <div className="flex justify-between gap-3 border-b border-[#eef4ff] pb-2">
                            <dt className="text-[#524439]/70 font-medium">
                              Created by
                            </dt>
                            <dd className="font-semibold text-[#121c28]">
                              {itemData.userCreatedBy?.name ?? "—"}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-3 border-b border-[#eef4ff] pb-2">
                            <dt className="text-[#524439]/70 font-medium">
                              Updated by
                            </dt>
                            <dd className="font-semibold text-[#121c28]">
                              {itemData.userUpdatedBy?.name ?? "—"}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-3 border-b border-[#eef4ff] pb-2">
                            <dt className="text-[#524439]/70 font-medium">
                              Created
                            </dt>
                            <dd className="font-semibold text-[#121c28]">
                              {itemData.createdAt
                                ? formatTimestamp(itemData.createdAt)
                                : "-"}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-3 border-b border-[#eef4ff] pb-2">
                            <dt className="text-[#524439]/70 font-medium">
                              Updated
                            </dt>
                            <dd className="font-semibold text-[#121c28]">
                              {itemData.updatedAt
                                ? formatTimestamp(itemData.updatedAt)
                                : "-"}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1 pt-1">
                            <dt className="text-[#524439]/70 font-medium">
                              Description
                            </dt>
                            <dd className="font-normal text-[#121c28] whitespace-pre-wrap leading-relaxed text-left text-sm bg-white/70 border border-[#eef4ff] rounded-md p-2.5 mt-1">
                              {itemData.description?.trim() ||
                                "No description provided."}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stock Distribution */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#eef4ff] pb-2">
                  <h3 className="font-ochre-brand text-lg font-medium text-[#894d0d]">
                    Stock Distributions (Located)
                  </h3>

                  {/* Create New Stock Button */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={openStockCreate}
                      className={cn(
                        "inline-flex shrink-0 items-center gap-2 self-start rounded bg-[#894d0d] px-5 py-1 font-ochre-ui text-sm font-semibold uppercase tracking-wide text-white shadow-[0_8px_24px_-8px_rgba(137,77,13,0.45)]",
                        "transition-[transform,box-shadow] hover:-translate-y-px",
                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#894d0d]",
                      )}
                    >
                      <Plus className="size-4" strokeWidth={2} aria-hidden />
                      New stock
                    </button>
                  </div>
                </div>

                {/* Controls: show count + sort + filter */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-ochre-ui text-xs font-medium uppercase tracking-wide text-[#524439]/70">
                      Show:
                    </span>
                    <select
                      value={String(itemStocksPerpage)}
                      onChange={(e) => {
                        setItemStocksPerpage(Number(e.target.value));
                      }}
                      className="min-w-24 appearance-none rounded-lg border border-[#e5eeff] bg-[#f8f9ff]/80 px-2 py-1.5 font-ochre-ui text-sm text-[#121c28] outline-none transition-colors duration-200 hover:border-[#b0c8f8] focus:border-[#894d0d]/35 focus:ring-2 focus:ring-[#894d0d]/15 focus:outline-none"
                    >
                      {[10, 20, 50, 100].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>

                  {
                    <div className="flex items-center gap-2">
                      <span className="font-ochre-ui text-xs font-medium uppercase tracking-wide text-[#524439]/70">
                        Status:
                      </span>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="min-w-28 appearance-none rounded-lg border border-[#e5eeff] bg-[#f8f9ff]/80 px-2 py-1.5 font-ochre-ui text-sm text-[#121c28] outline-none transition-colors duration-200 hover:border-[#b0c8f8] focus:border-[#894d0d]/35 focus:ring-2 focus:ring-[#894d0d]/15 focus:outline-none"
                      >
                        <option value="ALL">Type: All</option>
                        <option value="READY">Ready</option>
                        <option value="DIRTY">Dirty</option>
                        <option value="DAMAGED">Damaged</option>
                        <option value="EXPIRED">Expired</option>
                        <option value="EXPIRING_SOON">Expiring Soon</option>
                      </select>
                    </div>
                  }

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setOrderBy("asc")}
                      className={`rounded-lg border border-[#e5eeff] bg-[#f8f9ff]/80 p-1.5 text-[#565e74] outline-none transition-colors hover:border-[#894d0d]/35 hover:text-[#894d0d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#894d0d]${
                        orderBy === "asc"
                          ? " border-[#894d0d]/35 text-[#894d0d] ring-2 ring-[#894d0d]/15"
                          : ""
                      }`}
                      aria-label="Sort ascending"
                    >
                      <ArrowUp className="size-4" strokeWidth={1.5} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderBy("desc")}
                      className={`rounded-lg border border-[#e5eeff] bg-[#f8f9ff]/80 p-1.5 text-[#565e74] outline-none transition-colors hover:border-[#894d0d]/35 hover:text-[#894d0d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#894d0d]${
                        orderBy === "desc"
                          ? " border-[#894d0d]/35 text-[#894d0d] ring-2 ring-[#894d0d]/15"
                          : ""
                      }`}
                      aria-label="Sort descending"
                    >
                      <ArrowDown className="size-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>

                <ItemInfoPanelTable
                  stocks={itemData.stocks ?? []}
                  totalStockRows={itemStockCount}
                  itemStockPage={itemStockPage}
                  itemStocksPerpage={itemStocksPerpage}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onRequestSort={handleRequestSort}
                  onPageChange={setItemStockPage}
                  openStockDelete={openStockDelete}
                  openStockEdit={openStockEdit}
                />
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
