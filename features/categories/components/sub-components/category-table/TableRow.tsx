"use client";

import { sharedButtonClasses } from "@/features/categories/category.styles";
import type { CategoryListItem } from "@/features/categories/category.types";
import { cn } from "@/shared/lib/utils";
import { Folder, Info, InfoIcon, Pencil, Trash2 } from "lucide-react";

function formatUpdatedAt(value: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

type TableRowProps = {
  category: CategoryListItem;
  onEdit: (category: CategoryListItem) => void;
  onDelete: (category: CategoryListItem) => void;
};

export default function TableRow({
  category,
  onEdit,
  onDelete,
}: TableRowProps) {
  console.log(category);
  return (
    <tr className="border-b border-[#eef4ff] last:border-0 hover:bg-[#f8f9ff]/80">
      <td className="px-4 py-3 align-middle">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[#e5eeff] text-[#565e74]">
            <Folder className="size-4" strokeWidth={1.5} aria-hidden />
          </span>
          <span className="truncate font-ochre-ui text-sm font-semibold text-[#121c28]">
            {category.name}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 align-middle">
        <span className="inline-flex min-w-[2.5rem] items-center justify-center rounded-md bg-[#121c28] px-2 py-0.5 font-ochre-ui text-xs font-semibold text-white">
          {category.totalProducts}
        </span>
      </td>
      <td className="hidden px-4 py-3 align-middle font-ochre-ui text-sm text-[#524439] lg:table-cell">
        {formatUpdatedAt(category.updatedAt)}
      </td>
      <td className="px-4 py-3 align-middle text-end">
        <div className="inline-flex items-center gap-1">
          {/* <button
            type="button"
            onClick={() => onEdit(category)}
            className={cn(
              sharedButtonClasses,

              "hover:bg-[#eef4ff] hover:text-[#121c28]",
            )}
            aria-label={`View details for ${category.name}`}
          >
            <Info className="size-4" strokeWidth={1.5} />
          </button> */}

          <button
            type="button"
            onClick={() => onEdit(category)}
            className={cn(
              sharedButtonClasses,

              "hover:bg-[#e5eeff] hover:text-[#121c28]",
            )}
            aria-label={`Edit ${category.name}`}
          >
            <Pencil className="size-4" strokeWidth={1.5} />
          </button>

          <button
            type="button"
            onClick={() => onDelete(category)}
            className={cn(
              sharedButtonClasses,

              "hover:bg-[#ffdad6]/60 hover:text-[#ba1a1a]",
              "focus-visible:ring-[#ba1a1a]",
            )}
            aria-label={`Delete ${category.name}`}
          >
            <Trash2 className="size-4" strokeWidth={1.5} />
          </button>
        </div>
      </td>
    </tr>
  );
}
