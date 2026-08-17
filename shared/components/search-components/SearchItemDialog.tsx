"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, Package } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command";
import { useItems } from "@/features/items/item.hooks";
import { itemGetManyschema } from "@/shared/lib/zods/item.zod";
import { cn } from "@/shared/lib/utils";
import { formatThousand } from "@/shared/lib/formatter";

export interface ItemSearchOption {
  id: string;
  name: string;
  costPrice?: number;
  sellingPrice?: number | null;
  minThreshold?: number;
  image?: string | null;
  category?: { id: string; name: string } | null;
  isActive?: boolean;
}

export interface SearchItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (item: ItemSearchOption) => void;
  selectedId?: string;
  categoryId?: string;
  status?: boolean;
  title?: string;
  description?: string;
  showAllOption?: boolean;
  onSelectAll?: () => void;
}

export default function SearchItemDialog({
  open,
  onOpenChange,
  onSelect,
  selectedId,
  categoryId,
  status,
  title = "Search Items",
  description = "Search and select an inventory item...",
  showAllOption = false,
  onSelectAll,
}: SearchItemDialogProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

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

  const queryParams = useMemo(() => {
    const trimmed = debouncedSearch.trim();
    return itemGetManyschema.parse({
      page: 1,
      dataPerPage: 20,
      sortBy: "name",
      orderBy: "asc",
      search: trimmed.length >= 3 ? trimmed : undefined,
      categoryId: categoryId && categoryId !== "ALL" ? categoryId : undefined,
      findBy: categoryId && categoryId !== "ALL" ? "category" : undefined,
      status: status !== undefined ? (status ? "true" : "false") : undefined,
    });
  }, [debouncedSearch, categoryId, status]);

  const { data: itemsResponse, isLoading } = useItems(queryParams, {
    enabled: open,
  });

  const items = itemsResponse?.data.items ?? [];

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

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      className="max-w-lg rounded-xl border border-[#d9e3f4] bg-white shadow-2xl"
    >
      <Command shouldFilter={false} className="rounded-xl">
        <CommandInput
          placeholder="Type item name or category..."
          value={search}
          onValueChange={setSearch}
          className="font-ochre-ui text-sm"
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
                          <span>Cost: ${formatThousand(item.costPrice)}</span>
                          {item.sellingPrice != null && (
                            <>
                              <span>•</span>
                              <span>Sell: ${formatThousand(item.sellingPrice)}</span>
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
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
