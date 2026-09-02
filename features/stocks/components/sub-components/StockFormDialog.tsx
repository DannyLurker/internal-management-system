"use client";

import { useEffect, useId, useState } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Keyboard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  SearchItemPopover,
  SearchLocationPopover,
  SearchSelectTrigger,
} from "@/shared/components/search-components";
import type { Stock } from "@/features/stocks/stock.types";
import { useCreateStock, useUpdateStock } from "@/features/stocks/stock.hooks";
import {
  stockCreateSchema,
  stockUpdateSchema,
  type StockCreateSchema,
  type StockUpdateSchema,
} from "@/shared/lib/zods/stock.zod";
import { cn } from "@/shared/lib/utils";
import { inputClass } from "../../stock.style";
import { toast } from "sonner";
import { formatThousand, unformatThousand } from "@/shared/lib/formatter";
import { LocationOption } from "@/features/locations/location.types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/shared/components/ui/select";

type ItemOption = { id: string; name: string };

type StockFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stock: Stock | null;
  onSuccess: () => void;
  locations?: LocationOption[];
  items?: ItemOption[];
};

export default function StockFormDialog({
  open,
  onOpenChange,
  stock,
  onSuccess,
  locations,
  items,
}: StockFormDialogProps) {
  const isEdit = stock != null;
  const formId = useId();
  const [expiryInputMode, setExpiryInputMode] = useState<"picker" | "manual">(
    "picker",
  );
  const [itemSearchOpen, setItemSearchOpen] = useState(false);
  const [locationSearchOpen, setLocationSearchOpen] = useState(false);
  const [selectedItemName, setSelectedItemName] = useState<string>("");
  const [selectedLocationName, setSelectedLocationName] = useState<string>("");

  const createMutation = useCreateStock();
  const updateMutation = useUpdateStock();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const createForm = useForm<StockCreateSchema>({
    resolver: zodResolver(stockCreateSchema) as Resolver<StockCreateSchema>,
    defaultValues: {
      itemId: "",
      quantity: undefined,
      totalCost: undefined,
      reason: "",
      type: "READY",
      locationId: "",
      expiredAt: undefined,
    },
  });

  const watchedType = createForm.watch("type");

  const updateForm = useForm<StockUpdateSchema>({
    resolver: zodResolver(stockUpdateSchema) as Resolver<StockUpdateSchema>,
    defaultValues: {
      locationId: "",
      expiredAt: undefined,
    },
  });

  useEffect(() => {
    if (!open) return;

    if (stock) {
      updateForm.reset({
        locationId: stock.locationId,
        expiredAt: stock.expiredAt ? new Date(stock.expiredAt) : undefined,
      });
      setSelectedItemName(stock.item?.name ?? "");
      setSelectedLocationName(stock.location?.name ?? "");
    } else {
      const initialItem = items && items.length === 1 ? items[0] : null;
      const initialLocation =
        locations && locations.length === 1 ? locations[0] : null;

      createForm.reset({
        itemId: initialItem?.id ?? "",
        quantity: undefined,
        totalCost: undefined,
        reason: "",
        type: "READY",
        locationId: initialLocation?.id ?? "",
        expiredAt: undefined,
      });
      setSelectedItemName(initialItem?.name ?? "");
      setSelectedLocationName(initialLocation?.name ?? "");
    }
  }, [open, stock, items, locations, createForm, updateForm]);

  const onCreateSubmit = createForm.handleSubmit(async (values) => {
    const payload = stockCreateSchema.parse(values);

    try {
      await createMutation.mutateAsync(payload);
      onOpenChange(false);
      onSuccess();
    } catch {
      /* handled by API interceptor */
    }
  });

  const onUpdateSubmit = updateForm.handleSubmit(async (values) => {
    if (!stock?.id) {
      toast.error(
        "Stock id missing. Something went wrong. Try it again later.",
      );
      return;
    }

    const payload = stockUpdateSchema.parse(values);

    try {
      await updateMutation.mutateAsync({ stockId: stock.id, payload });
      onOpenChange(false);
      onSuccess();
    } catch {
      /* handled by API interceptor */
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[90vh] max-w-2xl flex-col gap-0 overflow-hidden rounded-lg p-0 sm:max-w-2xl"
        showCloseButton
      >
        <DialogHeader className="shrink-0 border-b border-[#eef4ff] px-6 py-5">
          <DialogTitle className="font-ochre-brand text-2xl font-medium text-[#894d0d]">
            {isEdit ? "Edit stock" : "New stock"}
          </DialogTitle>
        </DialogHeader>

        <form
          id={formId}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-5"
          onSubmit={isEdit ? onUpdateSubmit : onCreateSubmit}
        >
          {/* Stock details fieldset */}
          <fieldset className="space-y-4">
            <legend className="font-ochre-ui text-[11px] font-semibold uppercase tracking-wider text-[#524439]">
              Stock details
            </legend>

            {/* Item Selector (creation mode only) */}
            {!isEdit ? (
              <div>
                <Label className="font-ochre-ui text-sm">Item</Label>
                <div className="mt-1.5">
                  <SearchItemPopover
                    open={itemSearchOpen}
                    onOpenChange={setItemSearchOpen}
                    selectedId={createForm.watch("itemId")}
                    onSelect={(item) => {
                      setSelectedItemName(item.name);
                      createForm.setValue("itemId", item.id, {
                        shouldValidate: true,
                      });
                    }}
                  >
                    <SearchSelectTrigger
                      value={selectedItemName}
                      placeholder="Search and select an item..."
                      error={Boolean(createForm.formState.errors.itemId)}
                    />
                  </SearchItemPopover>
                </div>
                {createForm.formState.errors.itemId && (
                  <p className="mt-1 font-ochre-ui text-xs text-red-600">
                    {createForm.formState.errors.itemId.message}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <Label className="font-ochre-ui text-sm">Item</Label>
                <p className="mt-1.5 font-ochre-ui text-sm font-semibold text-[#121c28]">
                  {stock?.item?.name}
                </p>
              </div>
            )}

            <div className="grid gap-4">
              {/* Location Selection */}
              <div>
                <Label className="font-ochre-ui text-sm">Location</Label>
                <div className="mt-1.5">
                  <SearchLocationPopover
                    open={locationSearchOpen}
                    onOpenChange={setLocationSearchOpen}
                    selectedId={
                      isEdit
                        ? updateForm.watch("locationId")
                        : createForm.watch("locationId")
                    }
                    onSelect={(loc) => {
                      setSelectedLocationName(loc.name);
                      if (isEdit) {
                        updateForm.setValue("locationId", loc.id, {
                          shouldValidate: true,
                        });
                      } else {
                        createForm.setValue("locationId", loc.id, {
                          shouldValidate: true,
                        });
                      }
                    }}
                  >
                    <SearchSelectTrigger
                      value={selectedLocationName}
                      placeholder="Search and select location..."
                      error={Boolean(
                        isEdit
                          ? updateForm.formState.errors.locationId
                          : createForm.formState.errors.locationId,
                      )}
                    />
                  </SearchLocationPopover>
                </div>
                {(isEdit
                  ? updateForm.formState.errors.locationId
                  : createForm.formState.errors.locationId) && (
                  <p className="mt-1 font-ochre-ui text-xs text-red-600">
                    {
                      (isEdit
                        ? updateForm.formState.errors.locationId
                        : createForm.formState.errors.locationId
                      )?.message
                    }
                  </p>
                )}
              </div>

              {/* Stock Type */}
              <div>
                <Label className="font-ochre-ui text-sm">Type</Label>
                {(() => {
                  const selectedType = createForm.watch("type");

                  return (
                    <Select
                      value={selectedType}
                      onValueChange={(v) => {
                        createForm.setValue(
                          "type",
                          v as StockCreateSchema["type"],
                          { shouldValidate: true },
                        );
                      }}
                    >
                      <SelectTrigger
                        className={cn("mt-1.5 w-full", inputClass)}
                      >
                        {selectedType ?? "Select type"}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="READY">Ready</SelectItem>
                        <SelectItem value="DIRTY">Dirty</SelectItem>
                        <SelectItem value="DAMAGED">Damaged</SelectItem>
                        <SelectItem value="EXPIRED">Expired</SelectItem>
                        <SelectItem value="LOST">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  );
                })()}
              </div>
            </div>

            {/*  Quantity  */}
            {!isEdit && (
              <div className="mt-6 space-y-3">
                <Label className="font-ochre-ui text-sm font-semibold text-[#121c28]">
                  Quantity
                </Label>

                <Controller
                  control={createForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <Input
                      type="text"
                      inputMode="numeric"
                      className={cn("mt-1.5", inputClass)}
                      placeholder="1.000"
                      value={formatThousand(field.value ?? "")}
                      onChange={(e) => {
                        const rawValue = e.target.value;
                        const numericValue = unformatThousand(rawValue);
                        // Directly updates the numerical form state without DOM interference
                        field.onChange(
                          numericValue === 0 ? undefined : numericValue,
                        );
                      }}
                    />
                  )}
                />
                {createForm.formState.errors.quantity && (
                  <p className="mt-1 font-ochre-ui text-xs text-red-600">
                    {createForm.formState.errors.quantity.message}
                  </p>
                )}
              </div>
            )}
          </fieldset>

          {/* Cost and Reason – only for creation */}
          {!isEdit && (
            <fieldset className="mt-6 space-y-4">
              <legend className="font-ochre-ui text-[11px] font-semibold uppercase tracking-wider text-[#524439]">
                Transaction details
              </legend>

              <div className="grid gap-4 sm:grid-cols-2 rounded-lg bg-[#eef4ff]/50 p-4 border border-[#eef4ff]">
                {watchedType === "READY" && (
                  <div>
                    <Label className="font-ochre-ui text-sm">
                      Total cost ($)
                    </Label>
                    <Controller
                      control={createForm.control}
                      name="totalCost"
                      render={({ field }) => (
                        <Input
                          type="text"
                          inputMode="numeric"
                          className={cn("mt-1.5", inputClass)}
                          placeholder="1.000"
                          value={formatThousand(field.value ?? "")}
                          onChange={(e) => {
                            const rawValue = e.target.value;
                            const numericValue = unformatThousand(rawValue);
                            // Directly updates the numerical form state without DOM interference
                            field.onChange(
                              numericValue === 0 ? undefined : numericValue,
                            );
                          }}
                        />
                      )}
                    />
                    {createForm.formState.errors.totalCost ? (
                      <p className="mt-1 font-ochre-ui text-xs text-red-600">
                        {createForm.formState.errors.totalCost.message}
                      </p>
                    ) : null}
                  </div>
                )}

                <div className={watchedType === "READY" ? "" : "sm:col-span-2"}>
                  <Label className="font-ochre-ui text-sm">
                    Reason for stock transaction
                  </Label>
                  <Input
                    placeholder="e.g. Initial stock receipt"
                    className={cn("mt-1.5", inputClass)}
                    {...createForm.register("reason")}
                  />
                  {createForm.formState.errors.reason ? (
                    <p className="mt-1 font-ochre-ui text-xs text-red-600">
                      {createForm.formState.errors.reason.message}
                    </p>
                  ) : null}
                </div>
              </div>
            </fieldset>
          )}

          {/* Expiration Date */}
          <fieldset className="mt-6 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label className="font-ochre-ui text-sm font-semibold text-[#121c28]">
                Expiration date (Optional)
              </Label>

              <div className="inline-flex rounded-lg border border-[#d9e3f4]/40 bg-[#eef4ff] p-0.5">
                <button
                  type="button"
                  onClick={() => setExpiryInputMode("picker")}
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold tracking-wide transition-all duration-200",
                    expiryInputMode === "picker"
                      ? "bg-white font-bold text-[#894d0d] shadow-[0_2px_8px_rgba(137,77,13,0.12)]"
                      : "text-[#565e74] hover:text-[#121c28]",
                  )}
                >
                  <Calendar className="size-3.5 text-[#894d0d]" />
                  Calendar
                </button>
                <button
                  type="button"
                  onClick={() => setExpiryInputMode("manual")}
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold tracking-wide transition-all duration-200",
                    expiryInputMode === "manual"
                      ? "bg-white font-bold text-[#894d0d] shadow-[0_2px_8px_rgba(137,77,13,0.12)]"
                      : "text-[#565e74] hover:text-[#121c28]",
                  )}
                >
                  <Keyboard className="size-3.5 text-[#894d0d]" />
                  Manual
                </button>
              </div>
            </div>

            <div className="relative">
              <Input
                type={expiryInputMode === "picker" ? "date" : "text"}
                placeholder={
                  expiryInputMode === "picker" ? undefined : "YYYY-MM-DD"
                }
                className={cn("w-full", inputClass)}
                {...(isEdit
                  ? updateForm.register("expiredAt", {
                      setValueAs: (value) => (value === "" ? undefined : value),
                    })
                  : createForm.register("expiredAt", {
                      setValueAs: (value) => (value === "" ? undefined : value),
                    }))}
              />
              {(isEdit
                ? updateForm.formState.errors.expiredAt
                : createForm.formState.errors.expiredAt) && (
                <p className="mt-1 font-ochre-ui text-xs text-red-600">
                  {
                    (isEdit
                      ? updateForm.formState.errors.expiredAt
                      : createForm.formState.errors.expiredAt
                    )?.message
                  }
                </p>
              )}
            </div>
            <p className="mt-1.5 font-ochre-ui text-xs leading-normal text-[#524439]/70">
              {expiryInputMode === "picker"
                ? "Select the date when this stock batch will expire using the calendar picker."
                : "Type the date in YYYY-MM-DD format (e.g., 2026-12-31)."}
            </p>
          </fieldset>
        </form>

        <DialogFooter className="mb-1 shrink-0 gap-2 border-t border-[#eef4ff] bg-[#f8f9ff]/50 px-6 py-4 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded border-[#121c28]/30 font-ochre-ui text-[#121c28] hover:bg-white"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form={formId}
            disabled={isPending}
            className="rounded bg-[#894d0d] font-ochre-ui text-white hover:bg-[#6d3a00]"
          >
            {isPending ? "Saving…" : isEdit ? "Save changes" : "Create stock"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
