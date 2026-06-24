"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
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
} from "@/shared/components/ui/dialog";
import { cn, formatTimestamp } from "@/shared/lib/utils";

type ItemInfoPanelProps = {
  open: boolean;
  itemId: string;
  onClose: () => void;
};

export default function ItemInfoPanel({
  open,
  itemId,
  onClose,
}: ItemInfoPanelProps) {
  const [itemStockPage, setItemStockPage] = useState(1);
  const [itemStocksPerpage, setItemStocksPerpage] = useState(10);
  const [sortBy, setSortBy] = useState<"quantity" | "updatedAt" | "status">(
    "quantity",
  );
  const [orderBy, setOrderBy] = useState<"asc" | "desc">("asc");
  const [status, setStatus] = useState<string>("ALL");

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
  }, [itemStockPage, itemStocksPerpage, sortBy, orderBy, status]);

  const { data, isLoading, isError } = useItem(itemId, itemParams, {});

  const itemData = data?.data?.item;

  const totalItemStocks = data?.data.totalItemStockQuantity ?? 0;
  const totalStockRows = data?.data.itemStockRows ?? 0;

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
            {isLoading ? "Item Details" : (itemData?.name ?? "Item Details")}
          </DialogTitle>
          <DialogDescription className="font-ochre-ui text-sm text-[#524439]/80">
            View luxury inventory item metadata and stock distribution.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
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
            <div className="grid grid-cols-1 gap-6 items-start lg:grid-cols-12">
              {/* Left Column: Metadata */}
              <div className="lg:col-span-5 space-y-4">
                <div className="rounded-lg border border-[#eef4ff] bg-[#f8f9ff]/50 p-4">
                  {itemData.image ? (
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-[#eef4ff] bg-[#e5eeff] mb-4">
                      <img
                        src={itemData.image}
                        alt={itemData.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-[#eef4ff] bg-[#f8f9ff] mb-4 font-ochre-ui text-sm font-semibold uppercase text-[#565e74]">
                      No Image Available
                    </div>
                  )}

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
                      <dt className="text-[#524439]/70 font-medium">Created</dt>
                      <dd className="font-semibold text-[#121c28]">
                        {itemData.createdAt
                          ? formatTimestamp(itemData.createdAt)
                          : "-"}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3 border-b border-[#eef4ff] pb-2">
                      <dt className="text-[#524439]/70 font-medium">Updated</dt>
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

              {/* Right Column: Stocks Table */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between border-b border-[#eef4ff] pb-2">
                  <h3 className="font-ochre-brand text-lg font-medium text-[#894d0d]">
                    Stock Distributions
                  </h3>
                  <span className="rounded-full bg-[#894d0d] px-2.5 py-0.5 text-xs font-semibold text-white">
                    {totalItemStocks} entries
                  </span>
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

                  <div className="flex items-center gap-2">
                    <span className="font-ochre-ui text-xs font-medium uppercase tracking-wide text-[#524439]/70">
                      Sort:
                    </span>
                    <select
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(
                          e.target.value as "quantity" | "updatedAt" | "status",
                        )
                      }
                      className="min-w-28 appearance-none rounded-lg border border-[#e5eeff] bg-[#f8f9ff]/80 px-2 py-1.5 font-ochre-ui text-sm text-[#121c28] outline-none transition-colors duration-200 hover:border-[#b0c8f8] focus:border-[#894d0d]/35 focus:ring-2 focus:ring-[#894d0d]/15 focus:outline-none"
                    >
                      <option value="quantity">Quantity</option>
                      <option value="status">Status</option>
                      <option value="updatedAt">Updated At</option>
                    </select>
                  </div>

                  {sortBy === "status" && (
                    <div className="flex items-center gap-2">
                      <span className="font-ochre-ui text-xs font-medium uppercase tracking-wide text-[#524439]/70">
                        Status:
                      </span>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="min-w-28 appearance-none rounded-lg border border-[#e5eeff] bg-[#f8f9ff]/80 px-2 py-1.5 font-ochre-ui text-sm text-[#121c28] outline-none transition-colors duration-200 hover:border-[#b0c8f8] focus:border-[#894d0d]/35 focus:ring-2 focus:ring-[#894d0d]/15 focus:outline-none"
                      >
                        <option value="ALL">All Statuses</option>
                        <option value="READY">Ready</option>
                        <option value="DIRTY">Dirty</option>
                        <option value="DAMAGED">Damaged</option>
                        <option value="EXPIRED">Expired</option>
                        <option value="EXPIRING_SOON">Expiring Soon</option>
                      </select>
                    </div>
                  )}

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
                  totalStockRows={totalStockRows}
                  itemStockPage={itemStockPage}
                  itemStocksPerpage={itemStocksPerpage}
                  onPageChange={setItemStockPage}
                />
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
