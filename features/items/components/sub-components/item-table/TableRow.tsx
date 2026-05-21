"use client";

import Image from "next/image";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Button } from "@/shared/components/ui/button";
import type { Item } from "@/features/items/item.types";
import {
  formatItemDate,
  formatItemPrice,
  formatItemSku,
  getItemStockStatus,
  ITEM_STATUS_LABELS,
  ITEM_STATUS_STYLES,
} from "@/features/items/item.utils";
import { cn } from "@/shared/lib/utils";

type TableRowProps = {
  item: Item;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
};

export default function TableRow({ item, onEdit, onDelete }: TableRowProps) {
  const status = getItemStockStatus(item);
  const categoryLabel = item.category?.name ?? "General";

  return (
    <tr className="border-b border-[#eef4ff] last:border-0 hover:bg-[#f8f9ff]/80">
      <td className="px-4 py-3 align-middle">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-sm bg-[#e5eeff]">
            {item.image ? (
              <Image
                src={item.image}
                alt=""
                fill
                className="object-cover"
                sizes="40px"
                unoptimized
              />
            ) : (
              <span className="flex size-full items-center justify-center font-ochre-ui text-[10px] font-semibold uppercase text-[#565e74]">
                {item.name.slice(0, 2)}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-ochre-ui text-sm font-semibold text-[#121c28]">
              {item.name}
            </p>
            <p className="font-ochre-ui text-xs text-[#524439]/70">
              SKU: {formatItemSku(item.id)}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 align-middle">
        <span className="inline-flex rounded px-2 py-0.5 font-ochre-ui text-[11px] font-semibold uppercase tracking-[0.05em] text-white bg-[#121c28]">
          {categoryLabel}
        </span>
      </td>
      <td className="px-4 py-3 align-middle font-ochre-ui text-sm text-[#121c28]">
        {item.totalStock}
      </td>
      <td className="px-4 py-3 align-middle font-ochre-ui text-sm text-[#121c28]">
        {formatItemPrice(item.sellingPrice)}
      </td>
      <td className="px-4 py-3 align-middle">
        <span
          className={cn(
            "inline-flex rounded-full border px-2.5 py-0.5 font-ochre-ui text-[10px] font-semibold uppercase tracking-[0.05em]",
            ITEM_STATUS_STYLES[status],
          )}
        >
          {ITEM_STATUS_LABELS[status]}
        </span>
      </td>
      <td className="px-4 py-3 align-middle font-ochre-ui text-sm text-[#524439]">
        {formatItemDate(item.updatedAt)}
      </td>
      <td className="px-4 py-3 align-middle text-end">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-[#565e74] hover:bg-[#eef4ff] hover:text-[#121c28]"
                aria-label={`Actions for ${item.name}`}
              />
            }
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-40">
            <DropdownMenuItem onClick={() => onEdit(item)}>
              <Pencil className="size-4" />
              Edit item
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(item)}
            >
              <Trash2 className="size-4" />
              Delete item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}
