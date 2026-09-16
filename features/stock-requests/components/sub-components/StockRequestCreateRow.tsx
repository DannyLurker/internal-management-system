"use client";

import { useState } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  SearchItemPopover,
  SearchLocationPopover,
  SearchSelectTrigger,
  SearchStockPopover,
} from "@/shared/components/search-components";
import type { StockRequestCreateSchema } from "@/shared/lib/zods/stock-request.zod";
import { stockRequestStyles } from "../../stock-request.styles";
import { cn } from "@/shared/lib/utils";
import { Trash2 } from "lucide-react";

type StockRequestCreateRowProps = {
  index: number;
  requestNumber: number;
  form: UseFormReturn<StockRequestCreateSchema>;
  canRemove: boolean;
  onRemove: () => void;
};

export default function StockRequestCreateRow({
  index,
  requestNumber,
  form,
  canRemove,
  onRemove,
}: StockRequestCreateRowProps) {
  const [itemSearchOpen, setItemSearchOpen] = useState(false);
  const [stockSearchOpen, setStockSearchOpen] = useState(false);
  const [locationSearchOpen, setLocationSearchOpen] = useState(false);
  const [selectedItemName, setSelectedItemName] = useState("");
  const [selectedStockLabel, setSelectedStockLabel] = useState("");
  const [selectedDestinationName, setSelectedDestinationName] = useState("");

  const selectedItemId = form.watch(`requests.${index}.itemId`);
  const rowErrors = form.formState.errors.requests?.[index];

  return (
    <div className="rounded-xl border border-[#d9e3f4] bg-white p-4 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)] space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-ochre-ui text-xs font-semibold uppercase tracking-wider text-[#524439]">
          Request {requestNumber}
        </p>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-8 rounded-lg px-2 font-ochre-ui text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700"
          >
            <Trash2 className="mr-1 size-3.5" />
            Remove
          </Button>
        )}
      </div>

      <div>
        <Label className="text-xs font-semibold text-[#121c28]">
          Target Item <span className="text-rose-600">*</span>
        </Label>
        <div className="mt-1.5">
          <SearchItemPopover
            open={itemSearchOpen}
            onOpenChange={setItemSearchOpen}
            selectedId={selectedItemId}
            onSelect={(item) => {
              setSelectedItemName(item.name);
              form.setValue(`requests.${index}.itemId`, item.id, {
                shouldValidate: true,
              });
              form.setValue(`requests.${index}.stockId`, "", {
                shouldValidate: true,
              });
              setSelectedStockLabel("");
            }}
          >
            <SearchSelectTrigger
              value={selectedItemName}
              placeholder="Search and select item..."
              error={Boolean(rowErrors?.itemId)}
            />
          </SearchItemPopover>
        </div>
        {rowErrors?.itemId && (
          <p className="mt-1 text-xs text-rose-600">
            {rowErrors.itemId.message}
          </p>
        )}
      </div>

      <div>
        <Label className="text-xs font-semibold text-[#121c28]">
          Source Stock Batch <span className="text-rose-600">*</span>
        </Label>
        <div className="mt-1.5">
          <SearchStockPopover
            open={stockSearchOpen}
            onOpenChange={setStockSearchOpen}
            selectedId={form.watch(`requests.${index}.stockId`)}
            itemId={selectedItemId}
            onlyReady
            onSelect={(stock) => {
              form.setValue(`requests.${index}.stockId`, stock.id, {
                shouldValidate: true,
              });
              setSelectedStockLabel(
                `${stock.location?.name ?? "Location"} - Ready (${stock.quantity} available)`,
              );
            }}
          >
            <SearchSelectTrigger
              value={selectedStockLabel}
              placeholder={
                selectedItemId
                  ? "Select available ready stock batch..."
                  : "Select an item first..."
              }
              disabled={!selectedItemId}
              error={Boolean(rowErrors?.stockId)}
            />
          </SearchStockPopover>
        </div>
        {rowErrors?.stockId && (
          <p className="mt-1 text-xs text-rose-600">
            {rowErrors.stockId.message}
          </p>
        )}
      </div>

      <div>
        <Label className="text-xs font-semibold text-[#121c28]">
          Destination Location <span className="text-rose-600">*</span>
        </Label>
        <div className="mt-1.5">
          <SearchLocationPopover
            open={locationSearchOpen}
            onOpenChange={setLocationSearchOpen}
            selectedId={form.watch(`requests.${index}.destinationLocationId`)}
            onSelect={(loc) => {
              setSelectedDestinationName(loc.name);
              form.setValue(`requests.${index}.destinationLocationId`, loc.id, {
                shouldValidate: true,
              });
            }}
          >
            <SearchSelectTrigger
              value={selectedDestinationName}
              placeholder="Search and select destination..."
              error={Boolean(rowErrors?.destinationLocationId)}
            />
          </SearchLocationPopover>
        </div>
        {rowErrors?.destinationLocationId && (
          <p className="mt-1 text-xs text-rose-600">
            {rowErrors.destinationLocationId.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label className="text-xs font-semibold text-[#121c28]">
            Request Type <span className="text-rose-600">*</span>
          </Label>
          <Controller
            control={form.control}
            name={`requests.${index}.requestType`}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  className={cn("mt-1.5 w-full", stockRequestStyles.inputClass)}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ISSUE">
                    Issue (Standard Consumption)
                  </SelectItem>
                  <SelectItem value="RESTOCK">Restock</SelectItem>
                  <SelectItem value="TRANSFER">Transfer</SelectItem>
                  <SelectItem value="SALE">Sale</SelectItem>
                  <SelectItem value="REPORT_LOST">Report Lost</SelectItem>
                  <SelectItem value="WRITE_OFF">Write-Off</SelectItem>
                  <SelectItem value="LAUNDRY_IN">Laundry In</SelectItem>
                  <SelectItem value="LAUNDRY_OUT">Laundry Out</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div>
          <Label className="text-xs font-semibold text-[#121c28]">
            Requested Quantity <span className="text-rose-600">*</span>
          </Label>
          <Controller
            control={form.control}
            name={`requests.${index}.quantity`}
            render={({ field }) => (
              <Input
                type="number"
                min={1}
                value={field.value || ""}
                onChange={(e) => field.onChange(Number(e.target.value))}
                className={cn("mt-1.5", stockRequestStyles.inputClass)}
              />
            )}
          />
          {rowErrors?.quantity && (
            <p className="mt-1 text-xs text-rose-600">
              {rowErrors.quantity.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label className="text-xs font-semibold text-[#121c28]">
          Reason for Request{" "}
          <span className="text-rose-600">* (min 10 characters)</span>
        </Label>
        <Textarea
          rows={3}
          placeholder="e.g. Restocking Housekeeping Cart 2 for weekend turnover..."
          className={cn(
            "mt-1.5",
            stockRequestStyles.inputClass,
            "h-auto py-2",
          )}
          {...form.register(`requests.${index}.reason`)}
        />
        {rowErrors?.reason && (
          <p className="mt-1 text-xs text-rose-600">
            {rowErrors.reason.message}
          </p>
        )}
      </div>
    </div>
  );
}
