"use client";

import { useEffect, useId, useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
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
import { formatThousand, unformatThousand } from "../../stock-movements.utils";

type ItemOption = { id: string; name: string };
type LocationOption = { id: string; name: string };
type MovementTypeOption = StockMovementCreateSchema["stockMovementType"];

type StockMovementFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  items: ItemOption[];
  locations: LocationOption[];
  movementTypes: MovementTypeOption[];
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
  "LAUNDRY_IN",
  "DISCARD",
]);

const sourceRequiredTypes = new Set<MovementTypeOption>([
  "TRANSFER",
  "LAUNDRY_OUT",
  "MARK_AS_DAMAGED",
  "MARK_AS_DIRTY",
  "CONSUME",
  "SALE",
  "DISCARD",
  "ADJUSTMENT",
  "MARK_AS_LOST",
]);

const destinationRequiredTypes = new Set<MovementTypeOption>([
  "RECEIVE",
  "TRANSFER",
  "LAUNDRY_IN",
  "MARK_AS_DAMAGED",
  "MARK_AS_DIRTY",
  "MARK_AS_LOST",
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
}: StockMovementFormDialogProps) {
  const formId = useId();
  const createMutation = useCreateStockMovement();

  const form = useForm<StockMovementCreateSchema>({
    resolver: zodResolver(
      stockMovementCreateSchema,
    ) as Resolver<StockMovementCreateSchema>,
    defaultValues: {
      itemId: "",
      stockId: undefined,
      stockMovementType: "RECEIVE",
      quantity: undefined,
      totalCost: undefined,
      reason: "",
      sourceLocationId: undefined,
      destinationLocationId: undefined,
      orderId: undefined,
    },
  });

  const selectedItemId = form.watch("itemId");
  const selectedStockId = form.watch("stockId");
  const selectedMovementType = form.watch("stockMovementType");
  const requiresStock = stockRequiredTypes.has(selectedMovementType);
  const requiresSource = sourceRequiredTypes.has(selectedMovementType);
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

  const stockOptions = stocksResponse?.data.stocks ?? [];
  const selectedStock = stockOptions.find(
    (stock) => stock.id === selectedStockId,
  );

  useEffect(() => {
    if (!open) return;

    form.reset({
      itemId: items[0]?.id ?? "",
      stockId: undefined,
      stockMovementType: "RECEIVE",
      quantity: undefined,
      totalCost: undefined,
      reason: "",
      sourceLocationId: undefined,
      destinationLocationId: locations[0]?.id,
      orderId: undefined,
    });
  }, [form, items, locations, open]);

  useEffect(() => {
    if (!requiresStock) {
      form.setValue("stockId", undefined);
      form.setValue("sourceLocationId", undefined);
      return;
    }

    if (selectedStock?.locationId) {
      form.setValue("sourceLocationId", selectedStock.locationId, {
        shouldValidate: true,
      });
    }
  }, [form, requiresStock, selectedStock]);

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
      sourceLocationId: requiresSource ? values.sourceLocationId : undefined,
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
                        form.setValue("stockId", undefined);
                        form.setValue("sourceLocationId", undefined);
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
                    form.setValue("stockId", undefined);
                    form.setValue("sourceLocationId", undefined);
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

            {requiresStock ? (
              <div>
                <Label className="font-ochre-ui text-sm">Source stock</Label>
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
                    {selectedStock
                      ? `${selectedStock.item.name} - ${selectedStock.location?.name ?? "No location"} - ${selectedStock.type} (${selectedStock.quantity ?? 0})`
                      : "Select source stock"}
                  </SelectTrigger>
                  <SelectContent>
                    {stockOptions.map((stock) => (
                      <SelectItem key={stock.id} value={stock.id}>
                        {stock.item.name} -{" "}
                        {stock.location?.name ?? "No location"} - {stock.type} (
                        {stock.quantity ?? 0})
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

            <div className="grid gap-4 sm:grid-cols-2">
              {requiresSource ? (
                <div>
                  <Label className="font-ochre-ui text-sm">
                    Source location
                  </Label>
                  <Select
                    value={form.watch("sourceLocationId") ?? ""}
                    onValueChange={(value) =>
                      form.setValue("sourceLocationId", value || undefined, {
                        shouldValidate: true,
                      })
                    }
                    disabled={Boolean(selectedStock?.locationId)}
                  >
                    <SelectTrigger
                      className={cn("mt-1.5 w-full", stockMovementInputClass)}
                    >
                      {form.watch("sourceLocationId")
                        ? (locations.find(
                            (location) =>
                              location.id === form.watch("sourceLocationId"),
                          )?.name ?? "Select source")
                        : "Select source"}
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.sourceLocationId ? (
                    <p className="mt-1 font-ochre-ui text-xs text-red-600">
                      {form.formState.errors.sourceLocationId.message}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {requiresDestination ? (
                <div>
                  <Label className="font-ochre-ui text-sm">
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
                      {locations.map((location) => (
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
                <Input
                  type="text"
                  inputMode="numeric"
                  className={cn("mt-1.5", stockMovementInputClass)}
                  placeholder="1.000"
                  {...form.register("quantity")}
                  value={formatThousand(form.watch("quantity") ?? "")}
                  onChange={(e) => {
                    const rawValue = e.target.value;
                    const numericValue = unformatThousand(rawValue);
                    form.setValue("quantity", numericValue, {
                      shouldValidate: true,
                    });
                  }}
                />
                {form.formState.errors.quantity ? (
                  <p className="mt-1 font-ochre-ui text-xs text-red-600">
                    {form.formState.errors.quantity.message}
                  </p>
                ) : null}
              </div>

              <div>
                <Label className="font-ochre-ui text-sm">
                  Total cost {requiresTotalCost ? "" : "(optional)"}
                </Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  className={cn("mt-1.5", stockMovementInputClass)}
                  placeholder="10.000.000"
                  value={formatThousand(form.watch("totalCost") ?? "")}
                  {...form.register("totalCost", {
                    onChange: (e) => {
                      const rawValue = e.target.value;
                      const numericValue = unformatThousand(rawValue);
                      form.setValue("totalCost", numericValue, {
                        shouldValidate: true,
                      });
                    },
                  })}
                />
                {form.formState.errors.totalCost ? (
                  <p className="mt-1 font-ochre-ui text-xs text-red-600">
                    {form.formState.errors.totalCost.message}
                  </p>
                ) : null}
              </div>
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
