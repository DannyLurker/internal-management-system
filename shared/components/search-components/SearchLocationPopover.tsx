"use client";

import { isValidElement, useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  MapPin,
} from "lucide-react";
import { LocationType } from "@prisma/client";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/shared/components/ui/command";
import { useLocations } from "@/features/locations/location.hooks";
import { locationGetManySchema } from "@/shared/lib/zods/location.zod";
import { cn } from "@/shared/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { SearchLocationOption } from "@/shared/lib/types/search-component.types";

interface SearchLocationPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (location: SearchLocationOption) => void;
  selectedId?: string;
  locationType?: LocationType;
  showAllOption?: boolean;
  onSelectAll?: () => void;
  children?: React.ReactNode;
  trigger?: React.ReactNode;
}

const locationTypeLabels: Record<LocationType, string> = {
  MAIN_WAREHOUSE: "Main Warehouse",
  FRONT_OFFICE: "Front Office",
  FLOOR_LOCKER: "Floor Locker",
  VENDOR_LAUNDRY: "Laundry Vendor",
  OPERATIONAL: "Operational",
};

export default function SearchLocationPopover({
  open,
  onOpenChange,
  onSelect,
  selectedId,
  locationType,
  showAllOption = false,
  onSelectAll,
  children,
  trigger,
}: SearchLocationPopoverProps) {
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
    return locationGetManySchema.parse({
      page,
      dataPerPage,
      sortBy: "name",
      sortOrderEnum: "asc",
      searchQuery: trimmed.length >= 3 ? trimmed : undefined,
      locationType,
    });
  }, [debouncedSearch, locationType, page]);

  const { data: locationsResponse, isLoading } = useLocations(queryParams, {
    enabled: open,
  });

  const totalLocations = locationsResponse?.data.totalCount ?? 0;
  const totalPages = Math.ceil(totalLocations / dataPerPage) || 1;
  const hasNextPage = page * dataPerPage < totalLocations;
  const hasPreviousPage = page > 1;
  const rangeStart = totalLocations === 0 ? 0 : (page - 1) * dataPerPage + 1;
  const rangeEnd = Math.min(page * dataPerPage, totalLocations);

  const locations = locationsResponse?.data.locations ?? [];

  const filteredLocations = useMemo(() => {
    const trimmed = search.trim().toLowerCase();
    if (!trimmed || debouncedSearch.trim().length >= 3) {
      return locations;
    }
    return locations.filter(
      (loc) =>
        loc.name.toLowerCase().includes(trimmed) ||
        loc.type.toLowerCase().includes(trimmed),
    );
  }, [locations, search, debouncedSearch]);

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
            placeholder="Type location name or type..."
            value={search}
            onValueChange={setSearch}
            className="font-ochre-ui text-sm border-b border-[#d9e3f4]"
          />

          <CommandList className="max-h-80 p-1 font-ochre-ui">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-[#524439]/70">
                <Loader2 className="size-4 animate-spin text-[#894d0d]" />
                <span>Searching locations...</span>
              </div>
            ) : filteredLocations.length === 0 && !showAllOption ? (
              <CommandEmpty className="py-8 text-center text-sm text-[#524439]/70">
                No locations found.
              </CommandEmpty>
            ) : (
              <div>
                <CommandGroup heading="Locations">
                  {showAllOption && (
                    <CommandItem
                      value="ALL_LOCATIONS"
                      onSelect={() => {
                        if (onSelectAll) {
                          onSelectAll();
                        } else {
                          onSelect({
                            id: "ALL",
                            name: "All Locations",
                            type: "MAIN_WAREHOUSE" as LocationType,
                          });
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
                        <MapPin className="size-4 text-[#894d0d]" />
                        <span>All Locations</span>
                      </div>
                      {(selectedId === "ALL" || !selectedId) && (
                        <Check className="size-4 text-[#894d0d]" />
                      )}
                    </CommandItem>
                  )}

                  {filteredLocations.map((location) => {
                    const isSelected = selectedId === location.id;
                    return (
                      <CommandItem
                        key={location.id}
                        value={location.name}
                        onSelect={() => {
                          onSelect({
                            id: location.id,
                            name: location.name,
                            type: location.type,
                            description: location.description,
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
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[#eef4ff] text-[#894d0d]">
                            <MapPin className="size-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="truncate font-medium text-[#121c28]">
                                {location.name}
                              </span>
                              <span className="rounded bg-[#eef4ff] px-2 py-0.5 font-ochre-ui text-[11px] font-semibold uppercase tracking-wider text-[#894d0d] shrink-0">
                                {locationTypeLabels[location.type] ??
                                  location.type}
                              </span>
                            </div>
                            {location.description && (
                              <p className="mt-0.5 truncate text-xs text-[#524439]/70">
                                {location.description}
                              </p>
                            )}
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
                {totalLocations > 0 && (
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
                        {totalLocations}
                      </span>{" "}
                      locations
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
