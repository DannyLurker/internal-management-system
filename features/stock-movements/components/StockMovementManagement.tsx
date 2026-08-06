"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  stockMovementGetManySchema,
  type StockMovementGetManySchema,
} from "@/shared/lib/zods/stock-movements.zod";
import { useStockMovementsHooks } from "../stock-movements.hooks";
import StockMovementFormDialog from "./sub-components/StockMovementFormDialog";
import StockMovementInfoDialog from "./sub-components/StockMovementInfoDialog";
import StockMovementTable, {
  type StockMovementTableFilters,
} from "./sub-components/stock-movement-table";
import { MovementTypeOption } from "../stock-movements.types";
import { LocationOption } from "@/features/locations/location.types";
import { ItemOption } from "@/features/items/item.types";

type StockMovementManagementProps = {
  items: ItemOption[];
  locations: LocationOption[];
  movementTypes: MovementTypeOption[];
};

export default function StockMovementManagement({
  items,
  locations,
  movementTypes,
}: StockMovementManagementProps) {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] =
    useState<StockMovementGetManySchema["sortBy"]>("createdAt");
  const [sortOrder, setSortOrder] =
    useState<StockMovementGetManySchema["sortOrder"]>("desc");
  const [dataPerPage, setDataPerPage] = useState(10);
  const [filters, setFilters] = useState<StockMovementTableFilters>({
    searchQuery: "",
    type: "ALL",
    sourceLocation: "",
    destinationLocation: "",
  });
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedMovementId, setSelectedMovementId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const id = window.setTimeout(
      () => setDebouncedSearch(filters.searchQuery),
      350,
    );
    return () => window.clearTimeout(id);
  }, [filters.searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters.type, sortBy, sortOrder, dataPerPage]);

  const params = useMemo(() => {
    const search = debouncedSearch.trim();
    const nextSortBy = search.length >= 3 ? "name" : sortBy;

    return stockMovementGetManySchema.parse({
      page,
      dataPerPage,
      sortBy: nextSortBy,
      sortOrder,
      searchQuery: search.length >= 3 ? search : undefined,
      type: filters.type !== "ALL" ? filters.type : undefined,
      sourceLocationId:
        filters.sourceLocation !== "ALL" && filters.sourceLocation.length > 0
          ? filters.sourceLocation
          : undefined,
      destinationLocationId:
        filters.destinationLocation !== "ALL" &&
        filters.destinationLocation.length > 0
          ? filters.destinationLocation
          : undefined,
    });
  }, [
    dataPerPage,
    debouncedSearch,
    filters.type,
    page,
    sortBy,
    sortOrder,
    filters.sourceLocation,
    filters.destinationLocation,
  ]);

  const {
    data: movementsResponse,
    isLoading,
    isError,
  } = useStockMovementsHooks(params);

  const movements = movementsResponse?.data.movements ?? [];
  const totalCount = movementsResponse?.data.totalCount ?? 0;

  const handleRequestSort = useCallback(
    (column: StockMovementGetManySchema["sortBy"]) => {
      setSortBy((prevColumn) => {
        if (prevColumn === column) {
          setSortOrder((order) => (order === "asc" ? "desc" : "asc"));
          return prevColumn;
        }

        setSortOrder(column === "createdAt" ? "desc" : "asc");
        return column;
      });
    },
    [],
  );

  const handleToggleSort = useCallback(() => {
    setSortOrder((order) => (order === "asc" ? "desc" : "asc"));
  }, []);

  const handleFiltersChange = useCallback(
    (patch: Partial<StockMovementTableFilters>) => {
      setFilters((prev) => ({ ...prev, ...patch }));

      if (patch.searchQuery != null && patch.searchQuery.trim().length >= 3) {
        setSortBy("name");
      }

      if (patch.type != null && patch.type !== "ALL") {
        setSortBy("type");
      }
      if (patch.sourceLocation != null && patch.sourceLocation !== "ALL") {
        setSortBy("sourceLocation");
      }
      if (
        patch.destinationLocation != null &&
        patch.destinationLocation !== "ALL"
      ) {
        setSortBy("destinationLocation");
      }
    },
    [],
  );

  const handleFormSuccess = useCallback(() => {
    setFormOpen(false);
  }, []);

  const handleInfoOpenChange = useCallback((open: boolean) => {
    if (!open) setSelectedMovementId(null);
  }, []);

  return (
    <div className="min-h-0 flex-1 bg-[#f8f9ff] px-4 py-8 md:px-10">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <h1 className="font-ochre-brand text-3xl font-medium text-[#894d0d] md:text-4xl">
            Stock movements
          </h1>
          <p className="mt-2 font-ochre-brand text-sm italic leading-relaxed text-[#524439] md:text-base">
            Review inventory movement history and record new audited stock
            activity.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className={cn(
            "inline-flex shrink-0 items-center gap-2 self-start rounded bg-[#894d0d] px-5 py-2.5 font-ochre-ui text-sm font-semibold uppercase tracking-wide text-white shadow-[0_8px_24px_-8px_rgba(137,77,13,0.45)]",
            "transition-[transform,box-shadow] hover:-translate-y-px",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#894d0d]",
          )}
        >
          <Plus className="size-4" strokeWidth={2} aria-hidden />
          New movement
        </button>
      </header>

      <div className="mt-8">
        <StockMovementTable
          locations={locations}
          movements={movements}
          totalCount={totalCount}
          isLoading={isLoading}
          isError={isError}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          sortBy={params.sortBy}
          sortOrder={sortOrder}
          onRequestSort={handleRequestSort}
          onToggleSort={handleToggleSort}
          dataPerPage={dataPerPage}
          onDataPerPageChange={setDataPerPage}
          page={page}
          onPageChange={setPage}
          movementTypes={movementTypes}
          onInfo={setSelectedMovementId}
        />
      </div>

      <StockMovementFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={handleFormSuccess}
        items={items}
        locations={locations}
        movementTypes={movementTypes}
      />

      <StockMovementInfoDialog
        open={selectedMovementId != null}
        movementId={selectedMovementId}
        onOpenChange={handleInfoOpenChange}
      />
    </div>
  );
}
