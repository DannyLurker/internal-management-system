"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Folder, Loader2, Tag } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command";
import { useCategories } from "@/features/categories/category.hooks";
import { categoryGetManySchema } from "@/shared/lib/zods/category.zod";
import { cn } from "@/shared/lib/utils";

export interface CategoryOption {
  id: string;
  name: string;
  totalItems?: number;
}

export interface SearchCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (category: CategoryOption) => void;
  selectedId?: string;
  title?: string;
  description?: string;
  showAllOption?: boolean;
  onSelectAll?: () => void;
}

export default function SearchCategoryDialog({
  open,
  onOpenChange,
  onSelect,
  selectedId,
  title = "Search Categories",
  description = "Search and select a category...",
  showAllOption = false,
  onSelectAll,
}: SearchCategoryDialogProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Reset search when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSearch("");
      setDebouncedSearch("");
    }
  }, [open]);

  const queryParams = useMemo(() => {
    const trimmed = debouncedSearch.trim();
    return categoryGetManySchema.parse({
      page: 1,
      dataPerPage: 20,
      sortBy: "name",
      sortOrder: "asc",
      search: trimmed.length >= 3 ? trimmed : undefined,
    });
  }, [debouncedSearch]);

  const { data: categoriesResponse, isLoading } = useCategories(queryParams, {
    enabled: open,
  });

  const categories = categoriesResponse?.data.categories ?? [];

  // When search query is < 3 characters, do client-side filter on top of fetched items
  const filteredCategories = useMemo(() => {
    const trimmed = search.trim().toLowerCase();
    if (!trimmed || debouncedSearch.trim().length >= 3) {
      return categories;
    }
    return categories.filter((cat) => cat.name.toLowerCase().includes(trimmed));
  }, [categories, search, debouncedSearch]);

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      className="max-w-md rounded-xl border border-[#d9e3f4] bg-white shadow-2xl"
    >
      <Command shouldFilter={false} className="rounded-xl">
        <CommandInput
          placeholder="Type category name..."
          value={search}
          onValueChange={setSearch}
          className="font-ochre-ui text-sm"
        />

        <CommandList className="max-h-72 p-1 font-ochre-ui">
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
                      {isSelected && <Check className="size-4 text-[#894d0d]" />}
                    </div>
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
