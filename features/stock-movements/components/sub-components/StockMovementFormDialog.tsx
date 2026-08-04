"use client";

import { useEffect, useId, useMemo } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils";
import { useStocks } from "@/features/stocks/stock.hooks";
import {
  stockMovementCreateSchema,
  type StockMovementCreateSchema,
} from "@/shared/lib/zods/stock-movements.zod";
import { stockGetManySchema } from "@/shared/lib/zods/stock.zod";
import { useCreateStockMovement } from "../../stock-movements.hooks";
import { stockMovementInputClass } from "../../stock-movements.style";
import { LocationType, StockType } from "@prisma/client";
import { formatThousand, unformatThousand } from "@/shared/lib/formatter";
import { AUTO_CALCULATED_MOVEMENTS } from "../../stock-movements.utils";

type ItemOption = { id: string; name: string };
type LocationOption = { id: string; name: string; type: LocationType };
type MovementTypeOption = StockMovementCreateSchema["stockMovementType"];

type StockMovementFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  items: ItemOption[];
  locations: LocationOption[];
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

const markAsTypes = new Set<MovementTypeOption>([
  "MARK_AS_DAMAGED",
  "MARK_AS_DIRTY",
  "MARK_AS_EXPIRED",
  "MARK_AS_LOST",
]);

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

  const filteredLocationForLaundryOut = locations.filter(
    (location) => location.type === "VENDOR_LAUNDRY",
  );
  const selectedItemId = form.watch("itemId");
  const selectedStockId = form.watch("stockId");
  const selectedMovementType = form.watch("stockMovementType");
  const requiresStock = stockRequiredTypes.has(selectedMovementType);
  const requiresDestination =
    destinationRequiredTypes.has(selectedMovementType);
  const requiresTotalCost = totalCostRequiredTypes.has(selectedMovementType);

  const stockParams = useMemo(
    () =>
      stockGetManySchema.parse({
        page: 1,
        dataPerPage: 100,
        sortBy: "createdAt",
        sortOrder: "asc",
        itemId: selectedItemId || undefined,
      }),
    [selectedItemId],
  );

  const { data: stocksResponse } = useStocks(stockParams, {
    enabled: open && requiresStock && selectedItemId.length > 0,
  });

  let stockOptions = stocksResponse?.data.stocks ?? [];
  const selectedStock = stockOptions.find(
    (stock) => stock.id === selectedStockId,
  );

  if (typeShowReadyStocks.has(selectedMovementType)) {
    stockOptions = stockOptions.filter((stock) => stock.type === "READY");
  }

  if (markAsTypes.has(selectedMovementType)) {
    let avoidedType: StockType;

    if (selectedMovementType === "MARK_AS_DAMAGED") {
      avoidedType = "DAMAGED";
    }
    if (selectedMovementType === "MARK_AS_DIRTY") {
      avoidedType = "DIRTY";
    }
    if (selectedMovementType === "MARK_AS_EXPIRED") {
      avoidedType = "EXPIRED";
    }
    if (selectedMovementType === "MARK_AS_LOST") {
      avoidedType = "LOST";
    }

    stockOptions = stockOptions.filter((stock) => stock.type !== avoidedType);
  }

  useEffect(() => {
    if (!open) return;

    form.reset({
      itemId: defaultItemId ?? items[0]?.id ?? "",
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
      return;
    }

    if (defaultStockId) {
      form.setValue("stockId", defaultStockId, { shouldValidate: true });
    }
  }, [defaultStockId, form, requiresStock, selectedStock]);

  useEffect(() => {
    if (requiresDestination) {
      form.setValue(
        "destinationLocationId",
        form.getValues("destinationLocationId") ?? locations[0]?.id,
        { shouldValidate: true },
      );
    } else {
      form.setValue("destinationLocationId", undefined);
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
              <div>
                <Label className="font-ochre-ui text-sm">Item</Label>
                {(() => {
                  const selectedId = form.watch("itemId");
                  return (
                    <Select
                      value={selectedId}
                      onValueChange={(value) => {
                        form.setValue("itemId", value ?? "", {
                          shouldValidate: true,
                        });
                        form.setValue("stockId", defaultStockId ?? undefined);
                      }}
                    >
                      <SelectTrigger
                        className={cn("mt-1.5 w-full", stockMovementInputClass)}
                      >
                        {selectedId
                          ? (items.find((item) => item.id === selectedId)
                              ?.name ?? "Select an item")
                          : "Select an item"}
                      </SelectTrigger>
                      <SelectContent>
                        {items.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  );
                })()}
                {form.formState.errors.itemId ? (
                  <p className="mt-1 font-ochre-ui text-xs text-red-600">
                    {form.formState.errors.itemId.message}
                  </p>
                ) : null}
              </div>

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
                    <Select
                      value={selectedStockId ?? ""}
                      onValueChange={(value) =>
                        form.setValue("stockId", value || undefined, {
                          shouldValidate: true,
                        })
                      }
                    >
                      <SelectTrigger
                        className={cn("mt-1.5 w-full", stockMovementInputClass)}
                      >
                        <span className="block truncate text-left">
                          {selectedStock
                            ? `${selectedStock.item.name} - ${selectedStock.location?.name ?? "No location"} - ${selectedStock.type} (${selectedStock.quantity ?? 0}) - (${selectedStock.expiredAt?.toString().split("T")[0] ?? "Can't be expired"})`
                            : "Select source stock"}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        {stockOptions.map((stock) => (
                          <SelectItem key={stock.id} value={stock.id}>
                            {stock.item.name} -{" "}
                            {stock.location?.name ?? "No location"} -{" "}
                            {stock.type} ({stock.quantity ?? 0}) - (
                            {stock.expiredAt?.toString().split("T")[0] ??
                              "Can't be expired"}
                            )
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.stockId ? (
                      <p className="mt-1 font-ochre-ui text-xs text-red-600">
                        {form.formState.errors.stockId.message}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </>
            )}

            <div className="grid gap-4  ">
              {requiresDestination ? (
                <div>
                  <Label className="font-ochre-ui text-sm">
                    {form.getValues("stockMovementType") === "RECEIVE"}
                    Destination location
                  </Label>
                  <Select
                    value={form.watch("destinationLocationId") ?? ""}
                    onValueChange={(value) =>
                      form.setValue(
                        "destinationLocationId",
                        value || undefined,
                        {
                          shouldValidate: true,
                        },
                      )
                    }
                  >
                    <SelectTrigger
                      className={cn("mt-1.5 w-full", stockMovementInputClass)}
                    >
                      {form.watch("destinationLocationId")
                        ? (locations.find(
                            (location) =>
                              location.id ===
                              form.watch("destinationLocationId"),
                          )?.name ?? "Select destination")
                        : "Select destination"}
                    </SelectTrigger>
                    <SelectContent>
                      {selectedMovementType === "LAUNDRY_OUT" &&
                        filteredLocationForLaundryOut.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name}
                          </SelectItem>
                        ))}
                      {selectedMovementType !== "LAUNDRY_OUT" &&
                        locations.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
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
