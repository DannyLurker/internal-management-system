"use client";

import { Info, Pencil, Trash2 } from "lucide-react";
import type { LocationListItem } from "@/features/locations/location.types";
import {
  infoButtonClasses,
  sharedButtonClasses,
} from "@/features/locations/location.styles";
import {
  formatLocationDisplayId,
  formatLocationTypeBadge,
} from "@/features/locations/location.utils";
import { cn } from "@/shared/lib/utils";

type TableRowProps = {
  location: LocationListItem;
  onInfo: (location: LocationListItem) => void;
  onEdit: (location: LocationListItem) => void;
  onDelete: (location: LocationListItem) => void;
};

export default function TableRow({
  location,
  onInfo,
  onEdit,
  onDelete,
}: TableRowProps) {
  return (
    <tr className="border-b border-[#eef4ff] last:border-0 hover:bg-[#f8f9ff]/80">
      <td className="px-4 py-3 align-middle">
        <div className="min-w-0">
          <p className="truncate font-ochre-ui text-sm font-semibold text-[#121c28]">
            {location.name}
          </p>
          <p className="mt-0.5 font-ochre-ui text-xs text-[#524439]/70">
            ID: {formatLocationDisplayId(location.id)}
          </p>
        </div>
      </td>
      <td className="px-4 py-3 align-middle">
        <span className="inline-flex items-center rounded-md bg-[#121c28] px-2.5 py-1 font-ochre-ui text-[10px] font-semibold uppercase tracking-wide text-white">
          {formatLocationTypeBadge(location.type)}
        </span>
      </td>
      <td className="hidden max-w-xs px-4 py-3 align-middle md:table-cell">
        <p className="truncate font-ochre-ui text-sm text-[#524439]">
          {location.description?.trim() || "—"}
        </p>
      </td>
      <td className="px-4 py-3 align-middle text-end">
        <div className="inline-flex items-center gap-1">
          <button
            type="button"
            onClick={() => onInfo(location)}
            className={infoButtonClasses}
            aria-label={`View details for ${location.name}`}
          >
            <Info className="size-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => onEdit(location)}
            className={cn(
              sharedButtonClasses,
              "hover:bg-[#e5eeff] hover:text-[#121c28]",
            )}
            aria-label={`Edit ${location.name}`}
          >
            <Pencil className="size-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(location)}
            className={cn(
              sharedButtonClasses,
              "hover:bg-[#ffdad6]/60 hover:text-[#ba1a1a]",
              "focus-visible:ring-[#ba1a1a]",
            )}
            aria-label={`Delete ${location.name}`}
          >
            <Trash2 className="size-4" strokeWidth={1.5} />
          </button>
        </div>
      </td>
    </tr>
  );
}
