"use client";

import { isValidElement, useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  Package,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/shared/components/ui/command";
import { useItems } from "@/features/items/item.hooks";
import { itemGetManyschema } from "@/shared/lib/zods/item.zod";
import { cn } from "@/shared/lib/utils";
import { formatThousand } from "@/shared/lib/formatter";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { SearchItemSearchOption } from "@/shared/lib/types/search-component.types";

export interface SearchItemPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (item: SearchItemSearchOption) => void;
  selectedId?: string;
  categoryId?: string;
  status?: boolean;
  showAllOption?: boolean;
  onSelectAll?: () => void;
  children?: React.ReactNode;
  trigger?: React.ReactNode;
}

export default function SearchItemPopover({
  open,
  onOpenChange,
  onSelect,
  selectedId,
  categoryId,
  status,
  showAllOption = false,
  onSelectAll,
  children,
  trigger,
}: SearchItemPopoverProps) {
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

  const dataPerPage = 10;

  const queryParams = useMemo(() => {
    const trimmed = debouncedSearch.trim();
    return itemGetManyschema.parse({
      page,
      dataPerPage,
      sortBy: "name",
      orderBy: "asc",
      search: trimmed.length >= 3 ? trimmed : undefined,
      categoryId: categoryId && categoryId !== "ALL" ? categoryId : undefined,
      findBy: categoryId && categoryId !== "ALL" ? "category" : undefined,
      status: status !== undefined ? (status ? "true" : "false") : undefined,
    });
  }, [debouncedSearch, categoryId, status, page]);

  const { data: itemsResponse, isLoading } = useItems(queryParams, {
    enabled: open,
  });

  const items = itemsResponse?.data.items ?? [];
  const totalItems = itemsResponse?.data.totalItems ?? 0;
  const totalPages = Math.ceil(totalItems / dataPerPage) || 1;
  const hasNextPage = page * dataPerPage < totalItems;
  const hasPreviousPage = page > 1;
  const rangeStart = totalItems === 0 ? 0 : (page - 1) * dataPerPage + 1;
  const rangeEnd = Math.min(page * dataPerPage, totalItems);

  const filteredItems = useMemo(() => {
    const trimmed = search.trim().toLowerCase();
    if (!trimmed || debouncedSearch.trim().length >= 3) {
      return items;
    }
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(trimmed) ||
        (item.category?.name &&
          item.category.name.toLowerCase().includes(trimmed)),
    );
  }, [items, search, debouncedSearch]);

  const triggerElement = trigger ?? children;

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      {triggerElement && (
        <PopoverTrigger
          render={isValidElement(triggerElement) ? triggerElement : undefined}
        >
          {!isValidElement(triggerElement) ? triggerElement : undefined}
        </PopoverTrigger>
      )}
      <PopoverContent
        className="w-(--anchor-width,420px) min-w-[320px] max-w-[calc(100vw-2rem)] p-0 shadow-2xl rounded-xl border border-[#d9e3f4] bg-white"
        align="start"
      >
        <Command shouldFilter={false} className="rounded-xl">
          <CommandInput
            placeholder="Type item name or category..."
            value={search}
            onValueChange={setSearch}
            className="font-ochre-ui text-sm border-b border-[#d9e3f4]"
          />

          <CommandList className="max-h-80 p-1 font-ochre-ui">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-[#524439]/70">
                <Loader2 className="size-4 animate-spin text-[#894d0d]" />
                <span>Searching items...</span>
              </div>
            ) : filteredItems.length === 0 && !showAllOption ? (
              <CommandEmpty className="py-8 text-center text-sm text-[#524439]/70">
                No items found.
              </CommandEmpty>
            ) : (
              <div>
                <CommandGroup heading="Items">
                  {showAllOption && (
                    <CommandItem
                      value="ALL_ITEMS"
                      onSelect={() => {
                        if (onSelectAll) {
                          onSelectAll();
                        } else {
                          onSelect({ id: "ALL", name: "All Items" });
                        }
                        onOpenChange(false);
                      }}
                      className={cn(
                        "flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors",
                        "hover:bg-[#eef4ff] aria-selected:bg-[#eef4ff] aria-selected:text-[#894d0d]",
                        selectedId === "ALL" || !selectedId
                          ? "bg-[#eef4ff]/70 font-semibold text-[#894d0d]"
                          : "text-[#121c28]",
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Package className="size-4 text-[#894d0d]" />
                        <span>All Items</span>
                      </div>
                      {(selectedId === "ALL" || !selectedId) && (
                        <Check className="size-4 text-[#894d0d]" />
                      )}
                    </CommandItem>
                  )}

                  {filteredItems.map((item) => {
                    const isSelected = selectedId === item.id;
                    return (
                      <CommandItem
                        key={item.id}
                        value={item.name}
                        onSelect={() => {
                          onSelect({
                            id: item.id,
                            name: item.name,
                            costPrice: item.costPrice,
                            sellingPrice: item.sellingPrice,
                            minThreshold: item.minThreshold,
                            image: item.image,
                            category: item.category,
                            isActive: item.isActive,
                          });
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
                        <div className="flex min-w-0 flex-1 items-center gap-3 pr-2">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-[#d9e3f4] bg-[#f8f9ff] text-[#894d0d] overflow-hidden">
                            {item.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.image}
                                alt={item.name}
                                className="size-full object-cover"
                              />
                            ) : (
                              <Package className="size-4" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="truncate font-medium text-[#121c28]">
                                {item.name}
                              </span>
                              {item.category?.name && (
                                <span className="rounded bg-[#eef4ff] px-2 py-0.5 font-ochre-ui text-[11px] font-semibold text-[#894d0d] shrink-0">
                                  {item.category.name}
                                </span>
                              )}
                            </div>
                            <div className="mt-0.5 flex items-center gap-2 text-xs text-[#524439]/70">
                              <span>
                                Cost: ${formatThousand(item.costPrice)}
                              </span>
                              {item.sellingPrice != null && (
                                <>
                                  <span>•</span>
                                  <span>
                                    Sell: ${formatThousand(item.sellingPrice)}
                                  </span>
                                </>
                              )}
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
                {totalItems > 0 && (
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
                        {totalItems}
                      </span>{" "}
                      items
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
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
