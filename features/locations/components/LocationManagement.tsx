"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowDown, ArrowUp, Plus, Search } from "lucide-react";
import { LocationType } from "@prisma/client";
import { useLocations } from "@/features/locations/location.hooks";
import type { LocationListItem } from "@/features/locations/location.types";
import { LOCATION_TYPE_OPTIONS } from "@/features/locations/location.utils";
import { locationGetSchema } from "@/shared/lib/zods/location.zod";
import type { LocationGetSchema } from "@/shared/lib/zods/location.zod";
import { cn } from "@/shared/lib/utils";
import LocationInfoPanel from "./sub-components/location-table/LocationInfoPanel";
import LocationFormDialog from "./sub-components/LocationFormDialog";
import LocationDeleteModal from "./sub-components/LocationDeleteModal";
import LocationTable from "./sub-components/location-table/index";

const DATA_PER_PAGE_OPTIONS = [10, 20, 50, 100] as const;
const SORT_BY_OPTIONS: LocationGetSchema["sortBy"][] = [
  "name",
  "type",
  "createdAt",
  "updatedAt",
];

function parsePage(value: string | null): number {
  const parsed = Number(value ?? 1);
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
}

function parseDataPerPage(value: string | null): number {
  const parsed = Number(value ?? 10);
  return DATA_PER_PAGE_OPTIONS.includes(
    parsed as (typeof DATA_PER_PAGE_OPTIONS)[number],
  )
    ? parsed
    : 10;
}

function parseSortBy(value: string | null): LocationGetSchema["sortBy"] {
  return SORT_BY_OPTIONS.includes(value as LocationGetSchema["sortBy"])
    ? (value as LocationGetSchema["sortBy"])
    : "name";
}

function parseSortOrder(
  value: string | null,
): LocationGetSchema["sortOrderEnum"] {
  return value === "desc" ? "desc" : "asc";
}

function parseLocationType(
  value: string | null,
): LocationGetSchema["locationType"] | undefined {
  if (!value || value === "ALL") return undefined;
  return Object.values(LocationType).includes(value as LocationType)
    ? (value as LocationType)
    : undefined;
}

export default function LocationManagement() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = parsePage(searchParams.get("page"));
  const dataPerPage = parseDataPerPage(searchParams.get("dataPerPage"));
  const sortBy = parseSortBy(searchParams.get("sortBy"));
  const sortOrderEnum = parseSortOrder(searchParams.get("sortOrderEnum"));
  const locationType = parseLocationType(searchParams.get("locationType"));
  const urlSearchQuery = searchParams.get("searchQuery") ?? "";

  const [searchInput, setSearchInput] = useState(urlSearchQuery);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearchQuery);

  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null,
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editTarget, setEditTarget] = useState<LocationListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LocationListItem | null>(
    null,
  );

  useEffect(() => {
    setSearchInput(urlSearchQuery);
    setDebouncedSearch(urlSearchQuery);
  }, [urlSearchQuery]);

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(searchInput), 350);
    return () => window.clearTimeout(id);
  }, [searchInput]);

  const updateSearchParams = useCallback(
    (updates: Record<string, string | undefined>, resetPage = false) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value == null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      if (resetPage) {
        params.set("page", "1");
      }

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    const trimmed = debouncedSearch.trim();
    const nextValue = trimmed.length >= 3 ? trimmed : undefined;
    const currentValue =
      urlSearchQuery.trim().length >= 3 ? urlSearchQuery.trim() : undefined;

    if (nextValue === currentValue) return;

    updateSearchParams(
      {
        searchQuery: nextValue,
      },
      true,
    );
  }, [debouncedSearch, updateSearchParams, urlSearchQuery]);

  const filters: LocationGetSchema = useMemo(() => {
    const raw = {
      page,
      dataPerPage,
      sortBy,
      sortOrderEnum,
      ...(debouncedSearch.trim().length >= 3
        ? { searchQuery: debouncedSearch.trim() }
        : {}),
      ...(locationType ? { locationType } : {}),
    };
    return locationGetSchema.parse(raw);
  }, [page, dataPerPage, sortBy, sortOrderEnum, debouncedSearch, locationType]);

  const { data: locationsResponse, isLoading, isError } = useLocations(filters);
  const locations = locationsResponse?.data?.locations ?? [];
  const totalCount = locationsResponse?.data?.totalCount ?? 0;

  const openCreate = useCallback(() => {
    setFormMode("create");
    setEditTarget(null);
    setIsFormOpen(true);
  }, []);

  const openEdit = useCallback((location: LocationListItem) => {
    setFormMode("edit");
    setEditTarget(location);
    setIsFormOpen(true);
  }, []);

  const openDelete = useCallback((location: LocationListItem) => {
    setDeleteTarget(location);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditTarget(null);
  }, []);

  const closeDelete = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  const handleFormSuccess = useCallback(() => {
    setEditTarget(null);
  }, []);

  const handleDeleteSuccess = useCallback(() => {
    if (deleteTarget && selectedLocationId === deleteTarget.id) {
      setSelectedLocationId(null);
    }
    setDeleteTarget(null);
  }, [deleteTarget, selectedLocationId]);

  return (
    <div className="min-h-screen h-full flex-1 bg-[#f8f9ff] px-4 py-8 md:px-10">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <h1 className="font-ochre-brand text-3xl font-medium text-[#894d0d] md:text-4xl">
            Locations
          </h1>
          <p className="mt-2 font-ochre-ui text-sm leading-relaxed text-[#524439] md:text-base">
            Manage storage locations and track inventory across your facility.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className={cn(
            "inline-flex shrink-0 items-center gap-2 self-start rounded-md bg-[#894d0d] px-4 py-2.5 font-ochre-ui text-sm font-semibold text-white shadow-sm",
            "transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-[0_12px_28px_-10px_rgba(137,77,13,0.35)]",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#894d0d]",
          )}
        >
          <Plus className="size-4" strokeWidth={2} aria-hidden />
          New location
        </button>
      </header>

      <section className="mt-8 rounded-xl border border-[#d9e3f4]/80 bg-white p-4 shadow-[0_12px_40px_-18px_rgba(15,23,42,0.08)] md:p-5">
        <div className="relative min-w-0">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#565e74]/60"
            strokeWidth={1.5}
            aria-hidden
          />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search locations by name..."
            className={cn(
              "w-full rounded-lg border border-[#e5eeff] bg-[#f8f9ff]/80 py-2.5 pe-3 ps-10 font-ochre-ui text-sm text-[#121c28] outline-none transition-[border-color,box-shadow]",
              "placeholder:text-[#524439]/45 focus:border-[#894d0d]/35 focus:ring-2 focus:ring-[#894d0d]/15",
            )}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-ochre-ui text-xs font-medium uppercase tracking-wide text-[#524439]/70">
              Type:
            </span>
            <select
              value={locationType ?? "ALL"}
              onChange={(e) => {
                const value = e.target.value;
                updateSearchParams(
                  {
                    locationType: value === "ALL" ? undefined : value,
                  },
                  true,
                );
              }}
              className={cn(
                "min-w-28 appearance-none rounded-lg border border-[#e5eeff] bg-[#f8f9ff]/80 px-2 py-1.5 font-ochre-ui text-sm text-[#121c28] outline-none transition-colors duration-200 hover:border-[#b0c8f8] focus:border-[#894d0d]/35 focus:ring-2 focus:ring-[#894d0d]/15 focus:outline-none",
              )}
            >
              <option value="ALL">All</option>
              {LOCATION_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
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
                updateSearchParams({ sortBy: e.target.value }, true)
              }
              className={cn(
                "min-w-28 appearance-none rounded-lg border border-[#e5eeff] bg-[#f8f9ff]/80 px-2 py-1.5 font-ochre-ui text-sm text-[#121c28] outline-none transition-colors duration-200 hover:border-[#b0c8f8] focus:border-[#894d0d]/35 focus:ring-2 focus:ring-[#894d0d]/15 focus:outline-none",
              )}
            >
              <option value="name">Name</option>
              <option value="type">Type</option>
              <option value="createdAt">Created</option>
              <option value="updatedAt">Updated</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-ochre-ui text-xs font-medium uppercase tracking-wide text-[#524439]/70">
              Show:
            </span>
            <select
              value={String(dataPerPage)}
              onChange={(e) =>
                updateSearchParams({ dataPerPage: e.target.value }, true)
              }
              className={cn(
                "min-w-28 appearance-none rounded-lg border border-[#e5eeff] bg-[#f8f9ff]/80 px-2 py-1.5 font-ochre-ui text-sm text-[#121c28] outline-none transition-colors duration-200 hover:border-[#b0c8f8] focus:border-[#894d0d]/35 focus:ring-2 focus:ring-[#894d0d]/15 focus:outline-none",
              )}
            >
              {DATA_PER_PAGE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => updateSearchParams({ sortOrderEnum: "asc" }, true)}
              className={cn(
                "rounded-lg border border-[#e5eeff] bg-[#f8f9ff]/80 p-2 text-[#565e74] outline-none transition-colors",
                sortOrderEnum === "asc" &&
                  "border-[#894d0d]/35 text-[#894d0d] ring-2 ring-[#894d0d]/15",
                "hover:border-[#894d0d]/35 hover:text-[#894d0d]",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#894d0d]",
              )}
              aria-label="Sort ascending"
            >
              <ArrowUp className="size-4" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() =>
                updateSearchParams({ sortOrderEnum: "desc" }, true)
              }
              className={cn(
                "rounded-lg border border-[#e5eeff] bg-[#f8f9ff]/80 p-2 text-[#565e74] outline-none transition-colors",
                sortOrderEnum === "desc" &&
                  "border-[#894d0d]/35 text-[#894d0d] ring-2 ring-[#894d0d]/15",
                "hover:border-[#894d0d]/35 hover:text-[#894d0d]",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#894d0d]",
              )}
              aria-label="Sort descending"
            >
              <ArrowDown className="size-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </section>

      <div className="mt-8">
        <LocationTable
          locations={locations}
          totalCount={totalCount}
          isLoading={isLoading}
          isError={isError}
          page={page}
          dataPerPage={dataPerPage}
          onPageChange={(nextPage) =>
            updateSearchParams({ page: String(nextPage) })
          }
          onInfo={(location) => setSelectedLocationId(location.id)}
          onEdit={openEdit}
          onDelete={openDelete}
          onCreateFirst={openCreate}
        />
      </div>

      {selectedLocationId ? (
        <LocationInfoPanel
          key={selectedLocationId}
          locationId={selectedLocationId}
          open={selectedLocationId != null}
          onClose={() => setSelectedLocationId(null)}
        />
      ) : null}

      <LocationFormDialog
        open={isFormOpen}
        mode={formMode}
        onClose={closeForm}
        onSuccess={handleFormSuccess}
        defaultValues={
          editTarget
            ? {
                locationId: editTarget.id,
                name: editTarget.name,
                type: editTarget.type,
                description: editTarget.description ?? "",
              }
            : undefined
        }
      />

      <LocationDeleteModal
        open={deleteTarget != null}
        location={
          deleteTarget ? { id: deleteTarget.id, name: deleteTarget.name } : null
        }
        onClose={closeDelete}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
