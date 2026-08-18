"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Boxes,
  Calendar,
  Check,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  MapPin,
  X,
} from "lucide-react";
import { StockType } from "@prisma/client";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/shared/components/ui/command";
import { useStocks } from "@/features/stocks/stock.hooks";
import type { Stock } from "@/features/stocks/stock.types";
import { stockGetManySchema } from "@/shared/lib/zods/stock.zod";
import { cn } from "@/shared/lib/utils";
import { formatThousand } from "@/shared/lib/formatter";

export interface SearchStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (stock: Stock) => void;
  selectedId?: string;
  itemId?: string;
  locationId?: string;
  stockType?: StockType;
  excludedTypes?: StockType[];
  onlyReady?: boolean;
  title?: string;
  description?: string;
}

const stockTypeColors: Record<
  StockType,
  { bg: string; text: string; border: string }
> = {
  READY: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  DIRTY: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  DAMAGED: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
  },
  EXPIRED: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  LOST: {
    bg: "bg-zinc-100",
    text: "text-zinc-700",
    border: "border-zinc-300",
  },
};

export default function SearchStockDialog({
  open,
  onOpenChange,
  onSelect,
  selectedId,
  itemId,
  locationId,
  stockType,
  excludedTypes,
  onlyReady = false,
  title = "Search Stock Batch",
  description = "Search and select a source stock batch...",
}: SearchStockDialogProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setDebouncedSearch("");
    }
  }, [open]);

  const activeTypeFilter = onlyReady ? "READY" : stockType;

  const dataPerPage = 10;

  const queryParams = useMemo(() => {
    const trimmed = debouncedSearch.trim();
    return stockGetManySchema.parse({
      page,
      dataPerPage,
      sortBy: "createdAt",
      sortOrder: "desc",
      searchQuery: trimmed.length >= 3 ? trimmed : undefined,
      itemId: itemId && itemId.length > 0 ? itemId : undefined,
      locationId: locationId && locationId.length > 0 ? locationId : undefined,
      type: activeTypeFilter,
    });
  }, [debouncedSearch, itemId, locationId, activeTypeFilter, page]);

  const { data: stocksResponse, isLoading } = useStocks(queryParams, {
    enabled: open,
  });

  const totalStocks = stocksResponse?.data.totalCount ?? 0;
  const totalPages = Math.ceil(totalStocks / dataPerPage) || 1;
  const hasNextPage = page * dataPerPage < totalStocks;
  const hasPreviousPage = page > 1;
  const rangeStart = totalStocks === 0 ? 0 : (page - 1) * dataPerPage + 1;
  const rangeEnd = Math.min(page * dataPerPage, totalStocks);

  const rawStocks = stocksResponse?.data.stocks ?? [];

  // Filter excluded types if specified
  const filteredStocks = useMemo(() => {
    let list = rawStocks;

    if (excludedTypes && excludedTypes.length > 0) {
      list = list.filter((stock) => !excludedTypes.includes(stock.type));
    }

    const trimmed = search.trim().toLowerCase();
    if (!trimmed || debouncedSearch.trim().length >= 3) {
      return list;
    }

    return list.filter(
      (stock) =>
        stock.item.name.toLowerCase().includes(trimmed) ||
        (stock.location?.name &&
          stock.location.name.toLowerCase().includes(trimmed)) ||
        stock.type.toLowerCase().includes(trimmed),
    );
  }, [rawStocks, excludedTypes, search, debouncedSearch]);

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      className="max-w-xl rounded-xl border border-[#d9e3f4] bg-white shadow-2xl"
    >
      <Command shouldFilter={false} className="rounded-xl">
        <div className="flex items-center justify-between border-b border-[#d9e3f4] px-4 py-2.5">
          <span className="font-ochre-ui text-sm font-semibold text-[#121c28]">
            {title}
          </span>
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
            }}
            className="rounded-md p-1 text-[#565e74] hover:bg-[#eef4ff] hover:text-[#121c28] transition-colors focus:outline-none focus:ring-2 focus:ring-[#894d0d]"
            aria-label="Close dialog"
          >
            <X className="size-4" />
          </button>
        </div>

        <CommandInput
          placeholder="Type to filter stock by item, location, or condition..."
          value={search}
          onValueChange={setSearch}
          className="font-ochre-ui text-sm"
        />

        <CommandList className="max-h-84 p-1 font-ochre-ui">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-[#524439]/70">
              <Loader2 className="size-4 animate-spin text-[#894d0d]" />
              <span>Searching stock batches...</span>
            </div>
          ) : filteredStocks.length === 0 ? (
            <CommandEmpty className="py-8 text-center text-sm text-[#524439]/70">
              No stock batches found matching criteria.
            </CommandEmpty>
          ) : (
            <>
              <CommandGroup heading="Available Stock Batches">
                {filteredStocks.map((stock) => {
                  const isSelected = selectedId === stock.id;
                  const typeStyle =
                    stockTypeColors[stock.type] ?? stockTypeColors.READY;
                  const formattedExp = stock.expiredAt
                    ? new Date(stock.expiredAt).toISOString().split("T")[0]
                    : null;

                  return (
                    <CommandItem
                      key={stock.id}
                      value={`${stock.item.name} ${stock.location?.name ?? ""} ${stock.type}`}
                      onSelect={() => {
                        onSelect(stock);
                        onOpenChange(false);
                      }}
                      className={cn(
                        "flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors",
                        "hover:bg-[#eef4ff] aria-selected:bg-[#eef4ff] aria-selected:text-[#894d0d]",
                        isSelected
                          ? "bg-[#eef4ff]/70 font-semibold text-[#894d0d]"
                          : "text-[#121c28]",
                      )}
                    >
                      <div className="flex min-w-0 flex-1 items-start gap-3 pr-2">
                        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-[#eef4ff] text-[#894d0d]">
                          <Boxes className="size-4" />
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="truncate font-semibold text-[#121c28]">
                              {stock.item.name}
                            </span>
                            <span
                              className={cn(
                                "rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider border",
                                typeStyle.bg,
                                typeStyle.text,
                                typeStyle.border,
                              )}
                            >
                              {stock.type}
                            </span>
                            <span className="rounded bg-[#f8f9ff] px-2 py-0.5 text-[11px] font-bold text-[#894d0d] border border-[#d9e3f4]">
                              Qty: {formatThousand(stock.quantity ?? 0)}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-[#524439]/75">
                            <span className="flex items-center gap-1">
                              <MapPin className="size-3 text-[#565e74]" />
                              <span>
                                {stock.location?.name ?? "Unassigned"}
                              </span>
                            </span>

                            <span className="flex items-center gap-1">
                              <Calendar className="size-3 text-[#565e74]" />
                              <span>
                                {formattedExp
                                  ? `Exp: ${formattedExp}`
                                  : "No expiration"}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <Check className="size-4 text-[#894d0d] shrink-0" />
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              <CommandSeparator />
              {totalStocks > 0 && (
                <div className="flex flex-col gap-3 border-t border-[#eef4ff] px-4 py-3 font-ochre-ui text-sm text-[#524439] sm:items-center sm:justify-between">
                  <p>
                    Showing{" "}
                    <span className="font-semibold text-[#121c28]">
                      {rangeStart}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold text-[#121c28]">
                      {rangeEnd}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-[#121c28]">
                      {totalStocks}
                    </span>{" "}
                    categories
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={!hasPreviousPage || isLoading}
                      onClick={() => setPage(1)}
                      className={cn(
                        "rounded-md border border-[#d9e3f4] p-1.5 text-[#565e74]",
                        !hasPreviousPage && "cursor-not-allowed opacity-40",
                        hasPreviousPage &&
                          "hover:border-[#894d0d]/40 hover:text-[#894d0d]",
                      )}
                      aria-label="First page"
                    >
                      <ChevronsLeft className="size-4" strokeWidth={1.5} />
                    </button>
                    <button
                      type="button"
                      disabled={!hasPreviousPage || isLoading}
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      className={cn(
                        "rounded-md border border-[#d9e3f4] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#565e74]",
                        !hasPreviousPage && "cursor-not-allowed opacity-40",
                        hasPreviousPage &&
                          "hover:border-[#894d0d]/40 hover:text-[#894d0d]",
                      )}
                    >
                      Prev
                    </button>
                    <span className="rounded-md bg-[#894d0d] px-3 py-1.5 text-xs font-semibold text-white">
                      {page}
                    </span>
                    <button
                      type="button"
                      disabled={!hasNextPage || isLoading}
                      onClick={() =>
                        setPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      className={cn(
                        "rounded-md border border-[#d9e3f4] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#565e74]",
                        !hasNextPage && "cursor-not-allowed opacity-40",
                        hasNextPage &&
                          "hover:border-[#894d0d]/40 hover:text-[#894d0d]",
                      )}
                    >
                      Next
                    </button>
                    <button
                      type="button"
                      disabled={!hasNextPage || isLoading}
                      onClick={() => setPage(totalPages)}
                      className={cn(
                        "rounded-md border border-[#d9e3f4] p-1.5 text-[#565e74]",
                        !hasNextPage && "cursor-not-allowed opacity-40",
                        hasNextPage &&
                          "hover:border-[#894d0d]/40 hover:text-[#894d0d]",
                      )}
                      aria-label="Last page"
                    >
                      <ChevronsRight className="size-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
