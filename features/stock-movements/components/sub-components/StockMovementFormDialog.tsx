"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Textarea } from "@/shared/components/ui/textarea";
import {
  SearchItemDialog,
  SearchLocationDialog,
  SearchSelectTrigger,
  SearchStockDialog,
} from "@/shared/components/search-components";
import { cn } from "@/shared/lib/utils";
import {
  stockMovementCreateSchema,
  type StockMovementCreateSchema,
} from "@/shared/lib/zods/stock-movements.zod";
import { useCreateStockMovement } from "../../stock-movements.hooks";
import { stockMovementInputClass } from "../../stock-movements.style";
import { StockType } from "@prisma/client";
import { formatThousand, unformatThousand } from "@/shared/lib/formatter";
import { AUTO_CALCULATED_MOVEMENTS } from "../../stock-movements.utils";
import { LocationOption } from "@/features/locations/location.types";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/shared/components/ui/select";

type ItemOption = { id: string; name: string };
type MovementTypeOption = StockMovementCreateSchema["stockMovementType"];

type StockMovementFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  items?: ItemOption[];
  locations?: LocationOption[];
  isGlobalStock?: boolean;
  neededDatePicker?: boolean;
  movementTypes: MovementTypeOption[];
  hiddenFields?: ("stockBatch" | "itemId" | "movementType")[];
  defaultStockId?: string;
  defaultItemId?: string;
};

const stockRequiredTypes = new Set<MovementTypeOption>([
  "TRANSFER",
  "ADJUSTMENT",
  "MARK_AS_DAMAGED",
  "MARK_AS_DIRTY",
  "MARK_AS_LOST",
  "MARK_AS_EXPIRED",
  "CONSUME",
  "SALE",
  "LAUNDRY_OUT",
  "DISCARD",
  "RECEIVE",
]);

const typeShowReadyStocks = new Set<MovementTypeOption>(["CONSUME", "SALE"]);

const destinationRequiredTypes = new Set<MovementTypeOption>([
  "TRANSFER",
  "LAUNDRY_OUT",
]);

const totalCostRequiredTypes = new Set<MovementTypeOption>([
  "DISCARD",
  "SALE",
  "LAUNDRY_OUT",
]);

function formatMovementLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

export default function StockMovementFormDialog({
  open,
  onOpenChange,
  onSuccess,
  items,
  locations,
  movementTypes,
  hiddenFields,
  isGlobalStock,
  defaultStockId,
  defaultItemId,
}: StockMovementFormDialogProps) {
  const formId = useId();
  const createMutation = useCreateStockMovement();

  const [itemSearchOpen, setItemSearchOpen] = useState(false);
  const [stockSearchOpen, setStockSearchOpen] = useState(false);
  const [locationSearchOpen, setLocationSearchOpen] = useState(false);
  const [selectedItemName, setSelectedItemName] = useState<string>("");
  const [selectedStockLabel, setSelectedStockLabel] = useState<string>("");
  const [selectedDestinationName, setSelectedDestinationName] =
    useState<string>("");

  const defaultType =
    movementTypes.length === 1 && movementTypes[0] === "TRANSFER"
      ? "TRANSFER"
      : "RECEIVE";

  const form = useForm<StockMovementCreateSchema>({
    resolver: zodResolver(
      stockMovementCreateSchema,
    ) as Resolver<StockMovementCreateSchema>,
    defaultValues: {
      itemId: "",
      stockId: undefined,
      isGlobalStock: isGlobalStock ?? undefined,
      stockMovementType: defaultType,
      laundryTotalCost: undefined,
      quantity: undefined,
      totalCost: undefined,
      reason: "",
      destinationLocationId: undefined,
      orderId: undefined,
    },
  });

  const selectedItemId = form.watch("itemId");
  const selectedStockId = form.watch("stockId");
  const selectedMovementType = form.watch("stockMovementType");
  const requiresStock = stockRequiredTypes.has(selectedMovementType);
  const requiresDestination =
    destinationRequiredTypes.has(selectedMovementType);
  const requiresTotalCost = totalCostRequiredTypes.has(selectedMovementType);

  const excludedStockTypes = useMemo(() => {
    if (selectedMovementType === "MARK_AS_DAMAGED")
      return ["DAMAGED" as StockType];
    if (selectedMovementType === "MARK_AS_DIRTY")
      return ["DIRTY" as StockType];
    if (selectedMovementType === "MARK_AS_EXPIRED")
      return ["EXPIRED" as StockType];
    if (selectedMovementType === "MARK_AS_LOST")
      return ["LOST" as StockType];
    return undefined;
  }, [selectedMovementType]);

  useEffect(() => {
    if (!open) return;

    const initialItem =
      defaultItemId && items
        ? items.find((i) => i.id === defaultItemId)
        : items && items.length === 1
          ? items[0]
          : null;

    form.reset({
      itemId: defaultItemId ?? initialItem?.id ?? "",
      stockId: defaultStockId ?? undefined,
      stockMovementType: defaultType,
      isGlobalStock: isGlobalStock ?? undefined,
      laundryTotalCost: undefined,
      quantity: undefined,
      totalCost: undefined,
      reason: "",
      destinationLocationId: undefined,
      orderId: undefined,
    });

    setSelectedItemName(initialItem?.name ?? "");
    setSelectedStockLabel("");
    setSelectedDestinationName("");
  }, [
    defaultItemId,
    defaultStockId,
    defaultType,
    form,
    isGlobalStock,
    items,
    locations,
    open,
  ]);

  useEffect(() => {
    if (!requiresStock) {
      form.setValue("stockId", undefined);
      setSelectedStockLabel("");
      return;
    }

    if (defaultStockId) {
      form.setValue("stockId", defaultStockId, { shouldValidate: true });
    }
  }, [defaultStockId, form, requiresStock]);

  useEffect(() => {
    if (requiresDestination) {
      form.setValue(
        "destinationLocationId",
        form.getValues("destinationLocationId") ?? undefined,
        { shouldValidate: true },
      );
    } else {
      form.setValue("destinationLocationId", undefined);
      setSelectedDestinationName("");
    }
  }, [form, locations, requiresDestination]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = stockMovementCreateSchema.parse({
      ...values,
      stockId: requiresStock ? values.stockId : undefined,
      destinationLocationId: requiresDestination
        ? values.destinationLocationId
        : undefined,
      totalCost: values.totalCost,
    });

    try {
      await createMutation.mutateAsync(payload);
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
            New stock movement
          </DialogTitle>
        </DialogHeader>

        <form
          id={formId}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-5"
          onSubmit={onSubmit}
        >
          <fieldset className="space-y-4">
            <legend className="font-ochre-ui text-[11px] font-semibold uppercase tracking-wider text-[#524439]">
              Movement details
            </legend>

            <div className="grid gap-4 sm:grid-cols-2">
              {!hiddenFields?.includes("itemId") ? (
                <div>
                  <Label className="font-ochre-ui text-sm">Item</Label>
                  <div className="mt-1.5">
                    <SearchSelectTrigger
                      value={selectedItemName}
                      placeholder="Search and select item..."
                      onClick={() => setItemSearchOpen(true)}
                      error={Boolean(form.formState.errors.itemId)}
                    />
                    <SearchItemDialog
                      open={itemSearchOpen}
                      onOpenChange={setItemSearchOpen}
                      selectedId={selectedItemId}
                      onSelect={(item) => {
                        setSelectedItemName(item.name);
                        form.setValue("itemId", item.id, {
                          shouldValidate: true,
                        });
                        form.setValue("stockId", defaultStockId ?? undefined);
                        setSelectedStockLabel("");
                      }}
                    />
                  </div>
                  {form.formState.errors.itemId ? (
                    <p className="mt-1 font-ochre-ui text-xs text-red-600">
                      {form.formState.errors.itemId.message}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div>
                <Label className="font-ochre-ui text-sm">Movement type</Label>
                <Select
                  value={selectedMovementType}
                  onValueChange={(value) => {
                    form.setValue(
                      "stockMovementType",
                      value as MovementTypeOption,
                      {
                        shouldValidate: true,
                      },
                    );
                    form.setValue("stockId", defaultStockId ?? undefined);
                    setSelectedStockLabel("");
                  }}
                >
                  <SelectTrigger
                    className={cn("mt-1.5 w-full", stockMovementInputClass)}
                  >
                    {formatMovementLabel(selectedMovementType)}
                  </SelectTrigger>
                  <SelectContent>
                    {movementTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {formatMovementLabel(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {hiddenFields?.includes("stockBatch") ? (
              <div></div>
            ) : (
              <>
                {requiresStock ? (
                  <div>
                    <Label className="font-ochre-ui text-sm">Stock Batch</Label>
                    <div className="mt-1.5">
                      <SearchSelectTrigger
                        value={selectedStockLabel}
                        placeholder={
                          selectedItemId
                            ? "Search and select source stock batch..."
                            : "Select an item first..."
                        }
                        disabled={!selectedItemId}
                        onClick={() => setStockSearchOpen(true)}
                        error={Boolean(form.formState.errors.stockId)}
                      />
                      <SearchStockDialog
                        open={stockSearchOpen}
                        onOpenChange={setStockSearchOpen}
                        selectedId={selectedStockId}
                        itemId={selectedItemId}
                        onlyReady={typeShowReadyStocks.has(selectedMovementType)}
                        excludedTypes={excludedStockTypes}
                        onSelect={(stock) => {
                          form.setValue("stockId", stock.id, {
                            shouldValidate: true,
                          });
                          setSelectedStockLabel(
                            `${stock.item.name} - ${stock.location?.name ?? "No location"} - ${stock.type} (${stock.quantity ?? 0})`,
                          );
                        }}
                      />
                    </div>
                    {form.formState.errors.stockId ? (
                      <p className="mt-1 font-ochre-ui text-xs text-red-600">
                        {form.formState.errors.stockId.message}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </>
            )}

            <div className="grid gap-4">
              {requiresDestination ? (
                <div>
                  <Label className="font-ochre-ui text-sm">
                    {form.getValues("stockMovementType") === "RECEIVE"}
                    Destination location
                  </Label>
                  <div className="mt-1.5">
                    <SearchSelectTrigger
                      value={selectedDestinationName}
                      placeholder="Search and select destination..."
                      onClick={() => setLocationSearchOpen(true)}
                      error={Boolean(
                        form.formState.errors.destinationLocationId,
                      )}
                    />
                    <SearchLocationDialog
                      open={locationSearchOpen}
                      onOpenChange={setLocationSearchOpen}
                      selectedId={form.watch("destinationLocationId")}
                      locationType={
                        selectedMovementType === "LAUNDRY_OUT"
                          ? "VENDOR_LAUNDRY"
                          : undefined
                      }
                      onSelect={(loc) => {
                        setSelectedDestinationName(loc.name);
                        form.setValue("destinationLocationId", loc.id, {
                          shouldValidate: true,
                        });
                      }}
                    />
                  </div>
                  {form.formState.errors.destinationLocationId ? (
                    <p className="mt-1 font-ochre-ui text-xs text-red-600">
                      {form.formState.errors.destinationLocationId.message}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </fieldset>

          <fieldset className="mt-6 space-y-4">
            <legend className="font-ochre-ui text-[11px] font-semibold uppercase tracking-wider text-[#524439]">
              Quantity and audit note
            </legend>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="font-ochre-ui text-sm">Quantity</Label>
                <Controller
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <Input
                      type="text"
                      inputMode="numeric"
                      className={cn("mt-1.5", stockMovementInputClass)}
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
                {form.formState.errors.quantity ? (
                  <p className="mt-1 font-ochre-ui text-xs text-red-600">
                    {form.formState.errors.quantity.message}
                  </p>
                ) : null}
              </div>

              {selectedMovementType == "LAUNDRY_OUT" && (
                <div>
                  <Label className="font-ochre-ui text-sm">
                    Total Laundry Cost
                  </Label>
                  <Controller
                    control={form.control}
                    name="laundryTotalCost"
                    render={({ field }) => (
                      <Input
                        type="text"
                        inputMode="numeric"
                        className={cn("mt-1.5", stockMovementInputClass)}
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
                  {form.formState.errors.laundryTotalCost ? (
                    <p className="mt-1 font-ochre-ui text-xs text-red-600">
                      {form.formState.errors.laundryTotalCost.message}
                    </p>
                  ) : null}
                </div>
              )}

              {!AUTO_CALCULATED_MOVEMENTS.includes(
                form.getValues("stockMovementType"),
              ) && (
                  <>
                    {form.getValues("stockMovementType") === "TRANSFER" ? (
                      <div></div>
                    ) : (
                      <div>
                        <Label className="font-ochre-ui text-sm">
                          Total cost {requiresTotalCost ? "" : "(optional)"}
                        </Label>
                        <Controller
                          control={form.control}
                          name="totalCost"
                          render={({ field }) => (
                            <Input
                              type="text"
                              inputMode="numeric"
                              className={cn("mt-1.5", stockMovementInputClass)}
                              placeholder="10.000.000"
                              value={formatThousand(field.value ?? "")}
                              onChange={(e) => {
                                const rawValue = e.target.value;
                                const numericValue = unformatThousand(rawValue);
                                field.onChange(
                                  numericValue === 0 ? undefined : numericValue,
                                );
                              }}
                            />
                          )}
                        />
                        {form.formState.errors.totalCost ? (
                          <p className="mt-1 font-ochre-ui text-xs text-red-600">
                            {form.formState.errors.totalCost.message}
                          </p>
                        ) : null}
                      </div>
                    )}
                  </>
                )}
            </div>

            <div>
              <Label className="font-ochre-ui text-sm">Reason</Label>
              <Textarea
                rows={4}
                placeholder="Describe why this stock movement is being recorded."
                className={cn("mt-1.5", stockMovementInputClass)}
                {...form.register("reason")}
              />
              {form.formState.errors.reason ? (
                <p className="mt-1 font-ochre-ui text-xs text-red-600">
                  {form.formState.errors.reason.message}
                </p>
              ) : null}
            </div>
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
            disabled={createMutation.isPending}
            className="rounded bg-[#894d0d] font-ochre-ui text-white hover:bg-[#6d3a00]"
          >
            {createMutation.isPending ? "Saving..." : "Create movement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
