"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useItems } from "@/features/items/item.hooks";
import type { Item } from "@/features/items/item.types";
import { useCategories } from "@/features/categories/category.hooks";
import { categoryGetSchema } from "@/shared/lib/zods/category.zod";
import ItemTable, {
  type ItemTableFilters,
} from "./sub-components/item-table/Index";
import ItemFormDialog from "./sub-components/ItemFormDialog";
import ItemDeleteModal from "./sub-components/ItemDeleteModal";
import ItemActiveOrInactiveModal from "./sub-components/ItemActiveOrInactiveModal";
import {
  itemGetManyschema,
  ItemGetManySchema,
} from "@/shared/lib/zods/item.zod";

type LocationOption = { id: string; name: string };

type ItemManagementProps = {
  locations: LocationOption[];
};

export default function ItemManagement({ locations }: ItemManagementProps) {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<ItemGetManySchema["sortBy"]>("name");
  const [orderBy, setOrderBy] = useState<ItemGetManySchema["orderBy"]>("asc");
  const [dataPerPage, setDataPerPage] = useState(10);
  const [tableFilters, setTableFilters] = useState<ItemTableFilters>({
    search: "",
    categoryId: "ALL",
    activeStatus: undefined,
  });
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [deleteItem, setDeleteItem] = useState<Item | null>(null);
  const [statusChangeItem, setStatusChangeItem] = useState<Item | null>(null);
  const [statusChangeStatus, setStatusChangeStatus] = useState<
    "ACTIVE" | "INACTIVE"
  >("INACTIVE");

  useEffect(() => {
    const id = window.setTimeout(
      () => setDebouncedSearch(tableFilters.search),
      350,
    );
    return () => window.clearTimeout(id);
  }, [tableFilters.search]);

  useEffect(() => {
    setPage(1);
  }, [
    debouncedSearch,
    sortBy,
    orderBy,
    tableFilters.categoryId,
    tableFilters.activeStatus,
  ]);

  const categoryListParams = useMemo(
    () =>
      categoryGetSchema.parse({
        page: 1,
        dataPerPage: 100,
        sortBy: "name",
        sortOrder: "asc",
      }),
    [],
  );

  const { data: categoriesResponse } = useCategories(categoryListParams);
  const categoryOptions = categoriesResponse?.data.categories ?? [];

  const params: ItemGetManySchema = useMemo(() => {
    const raw = {
      page,
      dataPerPage,
      isTakeAll: false,
      sortBy,
      orderBy,
      isByCategory: tableFilters.categoryId !== "ALL" ? "true" : "false",
      categoryId:
        tableFilters.categoryId !== "ALL" ? tableFilters.categoryId : undefined,
      search:
        debouncedSearch.trim().length >= 3 ? debouncedSearch.trim() : undefined,
      status:
        tableFilters.activeStatus === undefined
          ? undefined
          : tableFilters.activeStatus
            ? "true"
            : "false",
    };
    return itemGetManyschema.parse(raw);
  }, [
    page,
    sortBy,
    orderBy,
    debouncedSearch,
    tableFilters.categoryId,
    tableFilters.activeStatus,
    dataPerPage,
  ]);

  const { data: itemsResponse, isLoading, isError } = useItems(params);

  const dataItems = itemsResponse?.data.items ?? [];
  const totalItems = itemsResponse?.data.totalItems ?? 0;

  const openCreate = useCallback(() => {
    setEditItem(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((item: Item) => {
    setEditItem(item);
    setFormOpen(true);
  }, []);

  const openDelete = useCallback((item: Item) => {
    setDeleteItem(item);
  }, []);

  const openStatusChange = useCallback(
    (item: Item, status: "ACTIVE" | "INACTIVE") => {
      setStatusChangeItem(item);
      setStatusChangeStatus(status);
    },
    [],
  );

  const handleFormOpenChange = useCallback((open: boolean) => {
    setFormOpen(open);
    if (!open) setEditItem(null);
  }, []);

  const handleDeleteOpenChange = useCallback((open: boolean) => {
    if (!open) setDeleteItem(null);
  }, []);

  const handleStatusChangeOpenChange = useCallback((open: boolean) => {
    if (!open) setStatusChangeItem(null);
  }, []);

  const handleRequestSort = useCallback(
    (column: ItemGetManySchema["sortBy"]) => {
      setSortBy((prevColumn: ItemGetManySchema["sortBy"]) => {
        if (prevColumn === column) {
          setOrderBy((o: string) => (o === "asc" ? "desc" : "asc"));
          return prevColumn;
        }
        setOrderBy("asc");
        return column;
      });
    },
    [],
  );

  const handleToggleSort = useCallback(() => {
    setOrderBy((o: string) => (o === "asc" ? "desc" : "asc"));
  }, []);

  const handleFiltersChange = useCallback(
    (patch: Partial<ItemTableFilters>) => {
      setTableFilters((prev) => ({ ...prev, ...patch }));
    },
    [],
  );

  const handleFormSuccess = useCallback(() => {
    setEditItem(null);
  }, []);

  const handleDeleteSuccess = useCallback(() => {
    setDeleteItem(null);
  }, []);

  const handleStatusChangeSuccess = useCallback(() => {
    setStatusChangeItem(null);
  }, []);

  return (
    <div className="min-h-0 flex-1 bg-[#f8f9ff] px-4 py-8 md:px-10">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <h1 className="font-ochre-brand text-3xl font-medium text-[#894d0d] md:text-4xl">
            Items
          </h1>
          <p className="mt-2 font-ochre-brand text-sm italic leading-relaxed text-[#524439] md:text-base">
            Oversee and manage your luxury asset inventory across all harbor
            locations.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className={cn(
            "inline-flex shrink-0 items-center gap-2 self-start rounded bg-[#894d0d] px-5 py-2.5 font-ochre-ui text-sm font-semibold uppercase tracking-wide text-white shadow-[0_8px_24px_-8px_rgba(137,77,13,0.45)]",
            "transition-[transform,box-shadow] hover:-translate-y-px",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#894d0d]",
          )}
        >
          <Plus className="size-4" strokeWidth={2} aria-hidden />
          New item
        </button>
      </header>

      <div className="mt-8">
        <ItemTable
          items={dataItems}
          totalItems={totalItems}
          isLoading={isLoading}
          isError={isError}
          filters={tableFilters}
          onFiltersChange={handleFiltersChange}
          sortBy={sortBy}
          sortOrder={orderBy}
          onRequestSort={handleRequestSort}
          onToggleSort={handleToggleSort}
          dataPerPage={dataPerPage}
          onDataPerPageChange={setDataPerPage}
          page={page}
          onPageChange={setPage}
          categoryOptions={categoryOptions}
          onEdit={openEdit}
          onStatusChange={openStatusChange}
          onDelete={openDelete}
        />
      </div>

      <ItemFormDialog
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        item={editItem}
        onSuccess={handleFormSuccess}
        locations={locations}
        categories={categoryOptions}
      />

      <ItemDeleteModal
        open={deleteItem != null}
        onOpenChange={handleDeleteOpenChange}
        item={deleteItem}
        onSuccess={handleDeleteSuccess}
      />

      <ItemActiveOrInactiveModal
        open={statusChangeItem != null}
        onOpenChange={handleStatusChangeOpenChange}
        item={statusChangeItem}
        onSuccess={handleStatusChangeSuccess}
        status={statusChangeStatus}
      />
    </div>
  );
}
