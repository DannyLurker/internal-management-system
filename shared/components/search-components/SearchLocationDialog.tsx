"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, MapPin } from "lucide-react";
import { LocationType } from "@prisma/client";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command";
import { useLocations } from "@/features/locations/location.hooks";
import { locationGetManySchema } from "@/shared/lib/zods/location.zod";
import { cn } from "@/shared/lib/utils";

export interface LocationOption {
  id: string;
  name: string;
  type: LocationType;
  description?: string | null;
}

export interface SearchLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (location: LocationOption) => void;
  selectedId?: string;
  locationType?: LocationType;
  title?: string;
  description?: string;
  showAllOption?: boolean;
  onSelectAll?: () => void;
}

const locationTypeLabels: Record<LocationType, string> = {
  STORAGE: "Storage",
  ROOM: "Room",
  VENDOR_LAUNDRY: "Laundry Vendor",
  RESTAURANT: "Restaurant",
  BAR: "Bar",
  HOUSEKEEPING: "Housekeeping",
  FRONT_DESK: "Front Desk",
  OTHER: "Other",
};

export default function SearchLocationDialog({
  open,
  onOpenChange,
  onSelect,
  selectedId,
  locationType,
  title = "Search Locations",
  description = "Search and select a harbor location...",
  showAllOption = false,
  onSelectAll,
}: SearchLocationDialogProps) {
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
    return locationGetManySchema.parse({
      page: 1,
      dataPerPage: 20,
      sortBy: "name",
      sortOrderEnum: "asc",
      searchQuery: trimmed.length >= 3 ? trimmed : undefined,
      locationType,
    });
  }, [debouncedSearch, locationType]);

  const { data: locationsResponse, isLoading } = useLocations(queryParams, {
    enabled: open,
  });

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
          placeholder="Type location name or type..."
          value={search}
          onValueChange={setSearch}
          className="font-ochre-ui text-sm"
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
                        type: "STORAGE" as LocationType,
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
                            {locationTypeLabels[location.type] ?? location.type}
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
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
