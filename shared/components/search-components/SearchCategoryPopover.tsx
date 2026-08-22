"use client";

import { isValidElement, useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronsLeft,
  ChevronsRight,
  Folder,
  Loader2,
  Tag,
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

import { useCategories } from "@/features/categories/category.hooks";
import { categoryGetManySchema } from "@/shared/lib/zods/category.zod";
import { cn } from "@/shared/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { SearchCategoryOption } from "@/shared/lib/types/search-component.types";

export interface SearchCategoryPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (category: SearchCategoryOption) => void;
  selectedId?: string;
  showAllOption?: boolean;
  onSelectAll?: () => void;
  children?: React.ReactNode;
  trigger?: React.ReactNode;
}

export default function SearchCategoryPopover({
  open,
  onOpenChange,
  onSelect,
  selectedId,
  showAllOption = false,
  onSelectAll,
  children,
  trigger,
}: SearchCategoryPopoverProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  // Handling search debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Reset search when popover opens/closes
  useEffect(() => {
    if (!open) {
      setSearch("");
      setDebouncedSearch("");
    }
  }, [open]);

  const dataPerPage = 10;

  // Preparing query parameters
  const queryParams = useMemo(() => {
    const trimmed = debouncedSearch.trim();
    return categoryGetManySchema.parse({
      page,
      dataPerPage,
      sortBy: "name",
      sortOrder: "asc",
      search: trimmed.length >= 3 ? trimmed : undefined,
    });
  }, [debouncedSearch, page]);

  const { data: categoriesResponse, isLoading } = useCategories(queryParams, {
    enabled: open,
  });

  const categories = categoriesResponse?.data.categories ?? [];
  const totalCategories = categoriesResponse?.data.totalCategoryData ?? 0;
  const totalPages = Math.ceil(totalCategories / dataPerPage) || 1;
  const hasNextPage = page * dataPerPage < totalCategories;
  const hasPrevPage = page > 1;
  const rangeStart = totalCategories === 0 ? 0 : (page - 1) * dataPerPage + 1;
  const rangeEnd = Math.min(page * dataPerPage, totalCategories);

  // Handling client-side filtering when search query is < 3 characters
  const filteredCategories = useMemo(() => {
    const trimmed = search.trim().toLowerCase();
    if (!trimmed || debouncedSearch.trim().length >= 3) {
      return categories;
    }
    return categories.filter((cat) => cat.name.toLowerCase().includes(trimmed));
  }, [categories, search, debouncedSearch]);

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
        className="w-(--anchor-width,380px) min-w-[320px] max-w-[calc(100vw-2rem)] p-0 shadow-2xl rounded-xl border border-[#d9e3f4] bg-white"
        align="start"
      >
        <Command shouldFilter={false} className="rounded-xl">
          <CommandInput
            placeholder="Type category name..."
            value={search}
            onValueChange={setSearch}
            className="font-ochre-ui text-sm border-b border-[#d9e3f4]"
          />

          <CommandList className="max-h-80 p-1 font-ochre-ui">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-[#524439]/70">
                <Loader2 className="size-4 animate-spin text-[#894d0d]" />
                <span>Searching categories...</span>
              </div>
            ) : filteredCategories.length === 0 && !showAllOption ? (
              <CommandEmpty className="py-8 text-center text-sm text-[#524439]/70">
                No categories found.
              </CommandEmpty>
            ) : (
              <div>
                <CommandGroup heading="Categories">
                  {showAllOption && (
                    <CommandItem
                      value="ALL_CATEGORIES"
                      onSelect={() => {
                        if (onSelectAll) {
                          onSelectAll();
                        } else {
                          onSelect({ id: "ALL", name: "All Categories" });
                        }
                        onOpenChange(false);
                      }}
                      className={cn(
                        "flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                        "hover:bg-[#eef4ff] aria-selected:bg-[#eef4ff] aria-selected:text-[#894d0d]",
                        selectedId === "ALL" || !selectedId
                          ? "bg-[#eef4ff]/70 font-semibold text-[#894d0d]"
                          : "text-[#121c28]",
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Folder className="size-4 text-[#894d0d]" />
                        <span>All Categories</span>
                      </div>
                      {(selectedId === "ALL" || !selectedId) && (
                        <Check className="size-4 text-[#894d0d]" />
                      )}
                    </CommandItem>
                  )}

                  {filteredCategories.map((category) => {
                    const isSelected = selectedId === category.id;
                    return (
                      <CommandItem
                        key={category.id}
                        value={category.name}
                        onSelect={() => {
                          onSelect({
                            id: category.id,
                            name: category.name,
                            totalItems: category.totalItems,
                          });
                          onOpenChange(false);
                        }}
                        className={cn(
                          "flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                          "hover:bg-[#eef4ff] aria-selected:bg-[#eef4ff] aria-selected:text-[#894d0d]",
                          isSelected
                            ? "bg-[#eef4ff]/70 font-semibold text-[#894d0d]"
                            : "text-[#121c28]",
                        )}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Tag className="size-3.5 text-[#565e74] shrink-0" />
                          <span className="truncate">{category.name}</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {category.totalItems !== undefined && (
                            <span className="rounded bg-[#f8f9ff] px-2 py-0.5 text-xs text-[#524439]/70 border border-[#d9e3f4]/50">
                              {category.totalItems}{" "}
                              {category.totalItems === 1 ? "item" : "items"}
                            </span>
                          )}
                          {isSelected && (
                            <Check className="size-4 text-[#894d0d]" />
                          )}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
                <CommandSeparator />
                {totalCategories > 0 && (
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
                        {totalCategories}
                      </span>
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={!hasPrevPage || isLoading}
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(1);
                        }}
                        className={cn(
                          "rounded-md border border-[#d9e3f4] p-1.5 text-[#565e74]",
                          !hasPrevPage && "cursor-not-allowed opacity-40",
                          hasPrevPage &&
                            "hover:border-[#894d0d]/40 hover:text-[#894d0d]",
                        )}
                        aria-label="First page"
                      >
                        <ChevronsLeft className="size-4" strokeWidth={1.5} />
                      </button>
                      <button
                        type="button"
                        disabled={!hasPrevPage || isLoading}
                        onClick={(e) => {
                          e.preventDefault();
                          setPage((prev) => Math.max(prev - 1, 1));
                        }}
                        className={cn(
                          "rounded-md border border-[#d9e3f4] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#565e74]",
                          !hasPrevPage && "cursor-not-allowed opacity-40",
                          hasPrevPage &&
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
                        onClick={(e) => {
                          e.preventDefault();
                          setPage((prev) => Math.min(prev + 1, totalPages));
                        }}
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
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(totalPages);
                        }}
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
