"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Plus, X, Calendar, Keyboard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import {
  SearchCategoryDialog,
  SearchLocationDialog,
  SearchSelectTrigger,
} from "@/shared/components/search-components";
import type { AttributeRow, Item } from "@/features/items/item.types";
import { useCreateItem, useUpdateItem } from "@/features/items/item.hooks";
import {
  itemCreateSchema,
  itemUpdateSchema,
  type ItemCreateSchema,
  type ItemUpdateSchema,
} from "@/shared/lib/zods/item.zod";
import { cn } from "@/shared/lib/utils";
import { attributesToRecord, parseAttributes } from "../../item.utils";
import { inputClass } from "../../item.style";
import { toast } from "sonner";
import { formatThousand, unformatThousand } from "@/shared/lib/formatter";
import { LocationOption } from "@/features/locations/location.types";

type CategoryOption = { id: string; name: string };

type ItemFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Item | null;
  onSuccess: () => void;
  locations?: LocationOption[];
  categories?: CategoryOption[];
};

export default function ItemFormDialog({
  open,
  onOpenChange,
  item,
  onSuccess,
  locations,
  categories,
}: ItemFormDialogProps) {
  const isEdit = item != null;
  const formId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [attributeRows, setAttributeRows] = useState<AttributeRow[]>([
    { key: "", value: "" },
  ]);
  const [expiryInputMode, setExpiryInputMode] = useState<"picker" | "manual">(
    "picker",
  );
  const [categorySearchOpen, setCategorySearchOpen] = useState(false);
  const [locationSearchOpen, setLocationSearchOpen] = useState(false);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>("");
  const [selectedLocationName, setSelectedLocationName] = useState<string>("");

  const createMutation = useCreateItem();
  const updateMutation = useUpdateItem();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const createForm = useForm<ItemCreateSchema>({
    resolver: zodResolver(itemCreateSchema) as Resolver<ItemCreateSchema>,
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
      locationId: "",
      image: "",
      sellingPrice: undefined,
      costPrice: 0,
      minThreshold: 0,
      attributes: {},
      stock: {
        quantity: undefined,
        totalCost: undefined,
        reason: "",
        expiredAt: undefined,
      },
    },
  });

  const updateForm = useForm<ItemUpdateSchema>({
    resolver: zodResolver(itemUpdateSchema) as Resolver<ItemUpdateSchema>,
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
      image: "",
      sellingPrice: undefined,
      costPrice: 0,
      minThreshold: 0,
      attributes: {},
    },
  });

  const stockQuantity = createForm.watch("stock.quantity");

  useEffect(() => {
    if (!open) return;

    if (item) {
      const price =
        item.sellingPrice != null ? Number(item.sellingPrice) : undefined;
      updateForm.reset({
        name: item.name,
        description: item.description,
        categoryId: item.categoryId ?? "",
        image: item.image ?? "",
        sellingPrice: price,
        costPrice: item.costPrice,
        minThreshold: item.minThreshold,
        attributes: (item.attributes as Record<string, unknown> | null) ?? {},
      });
      setSelectedCategoryName(item.category?.name ?? "");
      setImagePreview(item.image ?? null);
      setAttributeRows(parseAttributes(item.attributes));
    } else {
      createForm.reset({
        name: "",
        description: "",
        categoryId: "",
        locationId: "",
        image: "",
        sellingPrice: undefined,
        costPrice: 0,
        minThreshold: 0,
        attributes: {},
        stock: {
          quantity: undefined,
          totalCost: undefined,
          reason: "",
          expiredAt: undefined,
        },
      });
      setSelectedCategoryName("");
      setSelectedLocationName("");
      setImagePreview(null);
      setAttributeRows([{ key: "", value: "" }]);
    }
  }, [open, item, createForm, updateForm]);

  const handleImageChange = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      if (isEdit) {
        updateForm.setValue("image", result);
      } else {
        createForm.setValue("image", result);
      }
    };
    reader.readAsDataURL(file);
  };

  const onCreateSubmit = createForm.handleSubmit(
    async (values) => {
      const quantity = values.stock?.quantity;
      const payload = itemCreateSchema.parse({
        ...values,
        attributes: attributesToRecord(attributeRows),
        stock: quantity
          ? {
              quantity,
              totalCost: values.stock?.totalCost,
              reason: values.stock?.reason,
              expiredAt: values.stock?.expiredAt,
            }
          : undefined,
      });

      try {
        await createMutation.mutateAsync(payload);
        onOpenChange(false);
        onSuccess();
      } catch {
        /* handled by API */
      }
    },
    (error) => {},
  );

  const onUpdateSubmit = updateForm.handleSubmit(async (values) => {
    if (!item?.id) {
      toast.error(
        "Something went wrong. Item id is missing. Try it again later.",
      );
      return;
    }

    const payload = itemUpdateSchema.parse({
      ...values,
      attributes: attributesToRecord(attributeRows),
    });

    try {
      await updateMutation.mutateAsync({ itemId: item?.id, payload });
      onOpenChange(false);
      onSuccess();
    } catch {
      /* handled by API */
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
            {isEdit ? "Edit item" : "New item"}
          </DialogTitle>
        </DialogHeader>

        <form
          id={formId}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-5"
          onSubmit={isEdit ? onUpdateSubmit : onCreateSubmit}
        >
          <fieldset className="space-y-4">
            <legend className="font-ochre-ui text-[11px] font-semibold uppercase tracking-wider text-[#524439]">
              General specifications
            </legend>
            <div>
              <Label
                htmlFor={`${formId}-name`}
                className="font-ochre-ui text-sm"
              >
                Item name
              </Label>
              <Input
                id={`${formId}-name`}
                className={cn("mt-1.5", inputClass)}
                {...(isEdit
                  ? updateForm.register("name")
                  : createForm.register("name"))}
              />
              {(
                isEdit
                  ? updateForm.formState.errors.name
                  : createForm.formState.errors.name
              ) ? (
                <p className="mt-1 font-ochre-ui text-xs text-red-600">
                  {
                    (isEdit
                      ? updateForm.formState.errors.name
                      : createForm.formState.errors.name
                    )?.message
                  }
                </p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="font-ochre-ui text-sm">Category</Label>
                <div className="mt-1.5">
                  <SearchSelectTrigger
                    value={selectedCategoryName}
                    placeholder="Search category..."
                    onClick={() => {
                      setCategorySearchOpen(true);
                    }}
                    error={Boolean(
                      isEdit
                        ? updateForm.formState.errors.categoryId
                        : createForm.formState.errors.categoryId,
                    )}
                  />
                  <SearchCategoryDialog
                    open={categorySearchOpen}
                    onOpenChange={setCategorySearchOpen}
                    selectedId={
                      isEdit
                        ? updateForm.watch("categoryId")
                        : createForm.watch("categoryId")
                    }
                    onSelect={(cat) => {
                      setSelectedCategoryName(cat.name);
                      if (isEdit) {
                        updateForm.setValue("categoryId", cat.id, {
                          shouldValidate: true,
                        });
                      } else {
                        createForm.setValue("categoryId", cat.id, {
                          shouldValidate: true,
                        });
                      }
                    }}
                  />
                </div>
                {(
                  isEdit
                    ? updateForm.formState.errors.categoryId
                    : createForm.formState.errors.categoryId
                ) ? (
                  <p className="mt-1 font-ochre-ui text-xs text-red-600">
                    {
                      (isEdit
                        ? updateForm.formState.errors.categoryId
                        : createForm.formState.errors.categoryId
                      )?.message
                    }
                  </p>
                ) : null}
              </div>
            </div>

            <div>
              <Label
                htmlFor={`${formId}-desc`}
                className="font-ochre-ui text-sm"
              >
                Description
              </Label>
              <Textarea
                id={`${formId}-desc`}
                rows={3}
                className={cn("mt-1.5", inputClass)}
                {...(isEdit
                  ? updateForm.register("description")
                  : createForm.register("description"))}
              />
            </div>
          </fieldset>

          <fieldset className="mt-6 grid gap-4 sm:grid-cols-2">
            <legend className="sr-only">Location and visual identity</legend>
            <div>
              <p className="font-ochre-ui text-[11px] font-semibold uppercase tracking-wider text-[#524439]">
                Initial Storage Location
              </p>

              {!isEdit ? (
                <div className="mt-2">
                  <SearchSelectTrigger
                    value={selectedLocationName}
                    placeholder="Select storage location..."
                    onClick={() => setLocationSearchOpen(true)}
                    error={Boolean(createForm.formState.errors.locationId)}
                  />
                  <SearchLocationDialog
                    open={locationSearchOpen}
                    onOpenChange={setLocationSearchOpen}
                    selectedId={createForm.watch("locationId")}
                    onSelect={(loc) => {
                      setSelectedLocationName(loc.name);
                      createForm.setValue("locationId", loc.id, {
                        shouldValidate: true,
                      });
                    }}
                  />
                  {createForm.formState.errors.locationId ? (
                    <p className="mt-1 font-ochre-ui text-xs text-red-600">
                      {createForm.formState.errors.locationId.message}
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="mt-2 font-ochre-ui text-sm text-[#524439]">
                  Location is set at stock receipt and cannot be changed here.
                </p>
              )}
            </div>

            <div>
              <p className="font-ochre-ui text-[11px] font-semibold uppercase tracking-wider text-[#524439]">
                Visual identity
              </p>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className={cn(
                  "mt-2 flex h-28 w-full flex-col items-center justify-center gap-2 rounded border border-dashed border-[#894d0d]/50 bg-[#f8f9ff]/50",
                  "font-ochre-ui text-xs text-[#524439] transition-colors hover:border-[#894d0d]",
                )}
              >
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imagePreview}
                    alt=""
                    className="max-h-20 max-w-full object-contain"
                  />
                ) : (
                  <>
                    <Camera className="size-6 text-[#894d0d]" />
                    <span>Upload product image</span>
                  </>
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => handleImageChange(e.target.files?.[0])}
              />
            </div>
          </fieldset>

          <fieldset className="mt-6 space-y-4">
            <legend className="font-ochre-ui text-[11px] font-semibold uppercase tracking-wider text-[#524439]">
              Financial controls &amp; availability
            </legend>
            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <Label className="font-ochre-ui text-sm">
                  Selling price ($)
                </Label>
                {isEdit ? (
                  <Controller
                    control={updateForm.control}
                    name="sellingPrice"
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
                ) : (
                  <Controller
                    control={createForm.control}
                    name="sellingPrice"
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
                )}
              </div>
              <div>
                <Label className="font-ochre-ui text-sm">Cost price ($)</Label>
                {isEdit ? (
                  <Controller
                    control={updateForm.control}
                    name="costPrice"
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
                          field.onChange(
                            numericValue === 0 ? undefined : numericValue,
                          );
                        }}
                      />
                    )}
                  />
                ) : (
                  <Controller
                    control={createForm.control}
                    name="costPrice"
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
                          field.onChange(
                            numericValue === 0 ? undefined : numericValue,
                          );
                        }}
                      />
                    )}
                  />
                )}
                {(
                  isEdit
                    ? updateForm.formState.errors.costPrice
                    : createForm.formState.errors.costPrice
                ) ? (
                  <p className="mt-1 font-ochre-ui text-xs text-red-600">
                    {
                      (isEdit
                        ? updateForm.formState.errors.costPrice
                        : createForm.formState.errors.costPrice
                      )?.message
                    }
                  </p>
                ) : null}
              </div>
              {!isEdit ? (
                <div>
                  <Label className="font-ochre-ui text-sm">Initial stock</Label>
                  <Controller
                    control={createForm.control}
                    name="stock.quantity"
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
                </div>
              ) : null}
              <div>
                <Label className="font-ochre-ui text-sm">Min. threshold</Label>
                {isEdit ? (
                  <Controller
                    control={updateForm.control}
                    name="minThreshold"
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
                          field.onChange(
                            numericValue === 0 ? undefined : numericValue,
                          );
                        }}
                      />
                    )}
                  />
                ) : (
                  <Controller
                    control={createForm.control}
                    name="minThreshold"
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
                )}
              </div>
            </div>

            {!isEdit && stockQuantity != null && stockQuantity > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 rounded-lg bg-[#eef4ff]/50 p-4 border border-[#eef4ff] mt-4">
                <div>
                  <Label className="font-ochre-ui text-sm">
                    Total cost ($)
                  </Label>
                  <Controller
                    control={createForm.control}
                    name="stock.totalCost"
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
                  {createForm.formState.errors.stock?.totalCost ? (
                    <p className="mt-1 font-ochre-ui text-xs text-red-600">
                      {createForm.formState.errors.stock.totalCost.message}
                    </p>
                  ) : null}
                </div>
                <div>
                  <Label className="font-ochre-ui text-sm">
                    Reason for stock transaction
                  </Label>
                  <Input
                    placeholder="e.g. Initial stock receipt"
                    className={cn("mt-1.5", inputClass)}
                    {...createForm.register("stock.reason")}
                  />
                  {createForm.formState.errors.stock?.reason ? (
                    <p className="mt-1 font-ochre-ui text-xs text-red-600">
                      {createForm.formState.errors.stock.reason.message}
                    </p>
                  ) : null}
                </div>

                <div className="sm:col-span-2 mt-2 pt-4 border-t border-[#d9e3f4]/60">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <Label className="font-ochre-ui text-sm font-semibold text-[#121c28]">
                      Expiration date (Optional)
                    </Label>

                    <div className="inline-flex rounded-lg bg-[#eef4ff] p-0.5 border border-[#d9e3f4]/40">
                      <button
                        type="button"
                        onClick={() => setExpiryInputMode("picker")}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer",
                          expiryInputMode === "picker"
                            ? "bg-white text-[#894d0d] shadow-[0_2px_8px_rgba(137,77,13,0.12)] font-bold"
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
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer",
                          expiryInputMode === "manual"
                            ? "bg-white text-[#894d0d] shadow-[0_2px_8px_rgba(137,77,13,0.12)] font-bold"
                            : "text-[#565e74] hover:text-[#121c28]",
                        )}
                      >
                        <Keyboard className="size-3.5 text-[#894d0d]" />
                        Manual
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 relative">
                    <Input
                      type={expiryInputMode === "picker" ? "date" : "text"}
                      placeholder={
                        expiryInputMode === "picker" ? undefined : "YYYY-MM-DD"
                      }
                      className={cn("w-full", inputClass)}
                      {...createForm.register("stock.expiredAt", {
                        setValueAs: (value) =>
                          value === "" ? undefined : value,
                      })}
                    />
                    {createForm.formState.errors.stock?.expiredAt ? (
                      <p className="mt-1 font-ochre-ui text-xs text-red-600">
                        {createForm.formState.errors.stock.expiredAt.message}
                      </p>
                    ) : null}
                  </div>
                  <p className="mt-1.5 font-ochre-ui text-xs text-[#524439]/70 leading-normal">
                    {expiryInputMode === "picker"
                      ? "Select the date when this stock batch will expire using the calendar picker."
                      : "Type the date in YYYY-MM-DD format (e.g., 2026-12-31)."}
                  </p>
                </div>
              </div>
            )}
          </fieldset>

          <fieldset className="mt-6 space-y-3">
            <legend className="font-ochre-ui text-[11px] font-semibold uppercase tracking-wider text-[#524439]">
              Custom attributes
            </legend>
            {attributeRows.map((row, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Field name"
                  value={row.key}
                  onChange={(e) => {
                    const next = [...attributeRows];
                    next[index] = { ...next[index], key: e.target.value };
                    setAttributeRows(next);
                  }}
                  className={inputClass}
                />
                <Input
                  placeholder="Value"
                  value={row.value}
                  onChange={(e) => {
                    const next = [...attributeRows];
                    next[index] = { ...next[index], value: e.target.value };
                    setAttributeRows(next);
                  }}
                  className={inputClass}
                />
                {attributeRows.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() =>
                      setAttributeRows((rows) =>
                        rows.filter((_, i) => i !== index),
                      )
                    }
                    aria-label="Remove field"
                  >
                    <X className="size-4" />
                  </Button>
                ) : null}
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setAttributeRows((rows) => [...rows, { key: "", value: "" }])
              }
              className="inline-flex items-center gap-1 font-ochre-ui text-sm font-semibold text-[#894d0d] hover:underline"
            >
              <Plus className="size-4" />
              Add field
            </button>
          </fieldset>
        </form>

        <DialogFooter className="shrink-0 gap-2 border-t border-[#eef4ff] bg-[#f8f9ff]/50 px-6 py-4 sm:justify-end mb-1">
          <Button
            type="button"
            onSubmit={isEdit ? onUpdateSubmit : onCreateSubmit}
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
            {isPending ? "Saving…" : isEdit ? "Save changes" : "Save item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
