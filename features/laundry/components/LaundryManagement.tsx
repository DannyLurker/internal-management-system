"use client";

import { useEffect, useMemo, useState } from "react";

import {
  laundryGetManySchema,
  LaundryGetManySchema,
} from "@/shared/lib/zods/laundry.zod";
import LaundryTable, {
  LaundryTableFilters,
} from "./sub-components/laundry-table";
import LaundryDetailDialog from "./sub-components/LaundryDetailDialog";
import LaundryActionModal from "./sub-components/LaundryActionModal";
import { laundryStyles } from "../laundry.style";
import { Shirt } from "lucide-react";
import { LocationOption } from "@/features/locations/location.types";
import { Laundry } from "../laundry.types";
import { useLaundries } from "../laundry.hooks";

type LaundryManagementProps = {
  locations: LocationOption[];
};

export default function LaundryManagement({
  locations,
}: LaundryManagementProps) {
  const [page, setPage] = useState(1);
  const [dataPerPage, setDataPerPage] = useState(10);
  const [sortBy, setSortBy] =
    useState<LaundryGetManySchema["sortBy"]>("sentAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [filters, setFilters] = useState<LaundryTableFilters>({
    searchQuery: "",
    status: "ALL",
    sourceLocationId: "ALL",
  });
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Modals state
  const [detailLaundry, setDetailLaundry] = useState<Laundry | null>(null);
  const [actionLaundry, setActionLaundry] = useState<Laundry | null>(null);
  const [actionType, setActionType] = useState<"RETURNED" | "CANCELLED" | null>(
    null,
  );

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [filters.searchQuery]);

  // Reset to page 1 on filter change
  useEffect(() => {
    setPage(1);
  }, [
    debouncedSearch,
    filters.status,
    filters.sourceLocationId,
    sortBy,
    sortOrder,
    dataPerPage,
  ]);

  const params: LaundryGetManySchema = useMemo(() => {
    const search = debouncedSearch.trim();
    return laundryGetManySchema.parse({
      page,
      dataPerPage,
      sortBy,
      sortOrder,
      searchQuery: search.length >= 3 ? search : undefined,
      status: filters.status !== "ALL" ? filters.status : undefined,
      sourceLocationId:
        filters.sourceLocationId !== "ALL" &&
        filters.sourceLocationId.length > 0
          ? filters.sourceLocationId
          : undefined,
    });
  }, [
    page,
    dataPerPage,
    sortBy,
    sortOrder,
    debouncedSearch,
    filters.status,
    filters.sourceLocationId,
  ]);

  const { data: response, isLoading, isError } = useLaundries(params);

  const laundries = response?.data?.laundries ?? [];
  const totalLaundries = response?.data?.totalLaundries ?? 0;

  const handleRequestSort = (column: LaundryGetManySchema["sortBy"]) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const handleOpenAction = (
    laundry: Laundry,
    type: "RETURNED" | "CANCELLED",
  ) => {
    setActionLaundry(laundry);
    setActionType(type);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <Shirt className="size-7 text-[#894d0d]" />
          <h1 className={laundryStyles.headerTitle}>Laundry Management</h1>
        </div>
        <p className={laundryStyles.headerDescription}>
          Track laundry movements, vendor stock shipments, returns, and
          cancellations across hotel locations.
        </p>
      </div>

      {/* Data Table */}
      <LaundryTable
        laundries={laundries}
        totalLaundries={totalLaundries}
        isLoading={isLoading}
        isError={isError}
        filters={filters}
        onFiltersChange={(patch) =>
          setFilters((prev) => ({ ...prev, ...patch }))
        }
        sortBy={sortBy}
        sortOrder={sortOrder}
        onRequestSort={handleRequestSort}
        dataPerPage={dataPerPage}
        onDataPerPageChange={setDataPerPage}
        page={page}
        onPageChange={setPage}
        locations={locations}
        onInfo={(laundry) => setDetailLaundry(laundry)}
        onAction={handleOpenAction}
      />

      {/* Action Modal (Returned / Cancel with destination location selector) */}
      <LaundryActionModal
        open={Boolean(actionLaundry && actionType)}
        laundry={actionLaundry}
        actionType={actionType}
        locations={locations}
        onClose={() => {
          setActionLaundry(null);
          setActionType(null);
        }}
      />

      {/* Detail View Dialog ("I" trigger modal) */}
      <LaundryDetailDialog
        open={Boolean(detailLaundry)}
        laundry={detailLaundry}
        onClose={() => setDetailLaundry(null)}
      />
    </div>
  );
}
