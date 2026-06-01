"use client";

import type { CategoryListItem } from "@/features/categories/category.types";
import { cn } from "@/shared/lib/utils";
import {
  ChevronsLeft,
  ChevronsRight,
  ClipboardCheck,
  Plus,
} from "lucide-react";
import TableHeader, { type CategorySortBy } from "./TableHeader";
import TableRow from "./TableRow";
import type { CategoryGetSchema } from "@/shared/lib/zods/category.zod";

type CategoryTableProps = {
  totalCategoryData: number;
  categories: CategoryListItem[];
  isLoading: boolean;
  isError: boolean;
  sortBy: CategorySortBy;
  sortOrder: CategoryGetSchema["sortOrder"];
  onRequestSort: (column: CategorySortBy) => void;
  page: number;
  dataPerPage: number;
  onPageChange: (page: number) => void;
  onEdit: (category: CategoryListItem) => void;
  onDelete: (category: CategoryListItem) => void;
  onCreateFirst: () => void;
  onImportData?: () => void;
};

export default function CategoryTable({
  totalCategoryData,
  categories,
  isLoading,
  isError,
  sortBy,
  sortOrder,
  onRequestSort,
  page,
  dataPerPage,
  onPageChange,
  onEdit,
  onDelete,
  onCreateFirst,
  onImportData,
}: CategoryTableProps) {
  const totalPages = Math.ceil(totalCategoryData / dataPerPage);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  const rangeStart = categories.length === 0 ? 0 : (page - 1) * dataPerPage + 1;
  const rangeEnd = (page - 1) * dataPerPage + categories.length;

  if (isError) {
    return (
      <div
        className="rounded-xl border border-[#ffdad6] bg-white px-6 py-10 text-center font-ochre-ui text-sm text-[#93000a] shadow-[0_12px_40px_-16px_rgba(15,23,42,0.08)]"
        role="alert"
      >
        Something went wrong while loading categories. Please try again.
      </div>
    );
  }

  if (!isLoading && categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="relative mb-8 w-full max-w-md overflow-hidden rounded-xl bg-[#e5eeff] shadow-[0_20px_48px_-20px_rgba(15,23,42,0.12)]">
          <div className="aspect-16/10 bg-[linear-gradient(135deg,#dfe9fa_0%,#eef4ff_45%,#d9e3f4_100%)]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-[#eaf1ff]/80">
              <ClipboardCheck
                className="size-8 text-[#894d0d]"
                strokeWidth={1.5}
                aria-hidden
              />
            </div>
          </div>
        </div>
        <h2 className="font-ochre-brand text-2xl font-medium text-[#894d0d] md:text-3xl">
          No categories found
        </h2>
        <p className="mt-3 max-w-lg font-ochre-ui text-sm leading-relaxed text-[#524439] md:text-base">
          Your inventory organization starts here. Categories help you group
          items, manage stock levels more efficiently, and generate detailed
          reports.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onCreateFirst}
            className={cn(
              "inline-flex items-center gap-2 rounded-md bg-[#894d0d] px-5 py-2.5 font-ochre-ui text-sm font-semibold text-white shadow-sm",
              "transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-[0_12px_28px_-10px_rgba(137,77,13,0.35)]",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#894d0d]",
            )}
          >
            <span className="flex size-6 items-center justify-center rounded-full bg-white/15">
              <Plus className="size-3.5" strokeWidth={2} aria-hidden />
            </span>
            Create your first category
          </button>
          <button
            type="button"
            onClick={() => onImportData?.()}
            className={cn(
              "inline-flex items-center rounded-md border border-[#d8c3b4] bg-white px-5 py-2.5 font-ochre-ui text-sm font-semibold text-[#894d0d]",
              "hover:bg-[#f8f9ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#894d0d]",
            )}
          >
            Import data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#d9e3f4]/80 bg-white shadow-[0_16px_48px_-20px_rgba(15,23,42,0.08)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-160 border-collapse">
          <TableHeader
            sortBy={sortBy}
            sortOrder={sortOrder}
            onRequestSort={onRequestSort}
          />
          <tbody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#eef4ff]">
                    <td className="px-4 py-3" colSpan={5}>
                      <div className="h-10 animate-pulse rounded-md bg-[#eef4ff]/80" />
                    </td>
                  </tr>
                ))
              : categories.map((c) => (
                  <TableRow
                    key={c.id}
                    category={c}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
          </tbody>
        </table>
      </div>

      {!isLoading && categories.length > 0 ? (
        <div className="flex flex-col gap-3 border-t border-[#eef4ff] px-4 py-3 font-ochre-ui text-sm text-[#524439] sm:flex-row sm:items-center sm:justify-between">
          <p>
            Showing{" "}
            <span className="font-semibold text-[#121c28]">{rangeStart}</span>{" "}
            to <span className="font-semibold text-[#121c28]">{rangeEnd}</span>{" "}
            of{" "}
            <span className="font-semibold text-[#121c28]">
              {totalCategoryData}
            </span>{" "}
            {totalCategoryData === 1 ? "category" : "categories"}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!hasPrevPage}
              onClick={() => onPageChange(1)}
              className={cn(
                "rounded-md border border-[#d9e3f4] p-1.5 text-[#565e74]",
                !hasPrevPage && "cursor-not-allowed opacity-40",
                hasPrevPage && "hover:border-[#894d0d]/40 hover:text-[#894d0d]",
              )}
              aria-label="First page"
            >
              <ChevronsLeft className="size-4" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              disabled={!hasPrevPage}
              onClick={() => onPageChange(page - 1)}
              className={cn(
                "rounded-md border border-[#d9e3f4] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#565e74]",
                !hasPrevPage && "cursor-not-allowed opacity-40",
                hasPrevPage && "hover:border-[#894d0d]/40 hover:text-[#894d0d]",
              )}
            >
              Prev
            </button>
            <span className="rounded-md bg-[#894d0d] px-3 py-1.5 text-xs font-semibold text-white">
              {page}
            </span>
            <button
              type="button"
              disabled={!hasNextPage}
              onClick={() => onPageChange(page + 1)}
              className={cn(
                "rounded-md border border-[#d9e3f4] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#565e74]",
                !hasNextPage && "cursor-not-allowed opacity-40",
                hasNextPage && "hover:border-[#894d0d]/40 hover:text-[#894d0d]",
              )}
            >
              Next
            </button>
            <button
              type="button"
              disabled={!hasNextPage}
              onClick={() => onPageChange(totalPages)}
              className={cn(
                "rounded-md border border-[#d9e3f4] p-1.5 text-[#565e74]",
                !hasNextPage && "cursor-not-allowed opacity-40",
                hasNextPage && "hover:border-[#894d0d]/40 hover:text-[#894d0d]",
              )}
              aria-label="Last page"
            >
              <ChevronsRight className="size-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
