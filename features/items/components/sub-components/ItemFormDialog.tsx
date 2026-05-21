"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Plus, X } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { Item } from "@/features/items/item.types";
import { useCreateItem, useUpdateItem } from "@/features/items/item.hooks";
import {
  itemCreateSchema,
  itemUpdateSchema,
  type ItemCreateSchema,
  type ItemUpdateSchema,
} from "@/shared/lib/zods/item.zod";
import { cn } from "@/shared/lib/utils";

type LocationOption = { id: string; name: string };
type CategoryOption = { id: string; name: string };

type AttributeRow = { key: string; value: string };

type ItemFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Item | null;
  onSuccess: () => void;
  locations: LocationOption[];
  categories: CategoryOption[];
};

const inputClass =
  "rounded border-[#d9e3f4] bg-white font-ochre-ui text-sm focus-visible:border-[#894d0d]/50 focus-visible:ring-[#894d0d]/25";

function parseAttributes(raw: unknown): AttributeRow[] {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return [{ key: "", value: "" }];
  }
  const entries = Object.entries(raw as Record<string, unknown>);
  if (entries.length === 0) return [{ key: "", value: "" }];
  return entries.map(([key, value]) => ({
    key,
    value: String(value ?? ""),
  }));
}

function attributesToRecord(rows: AttributeRow[]) {
  return rows.reduce<Record<string, unknown>>((acc, row) => {
    const key = row.key.trim();
    if (key) acc[key] = row.value;
    return acc;
  }, {});
}

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
      minThreshold: 0,
      attributes: {},
      stock: { quantity: undefined },
    },
  });

  const updateForm = useForm<ItemUpdateSchema>({
    resolver: zodResolver(itemUpdateSchema) as Resolver<ItemUpdateSchema>,
    defaultValues: {
      itemId: "",
      name: "",
      description: "",
      categoryId: "",
      image: "",
      sellingPrice: undefined,
      minThreshold: 0,
      attributes: {},
    },
  });

  useEffect(() => {
    if (!open) return;

    if (item) {
      const price =
        item.sellingPrice != null ? Number(item.sellingPrice) : undefined;
      updateForm.reset({
        itemId: item.id,
        name: item.name,
        description: item.description,
        categoryId: item.categoryId ?? "",
        image: item.image ?? "",
        sellingPrice: price,
        minThreshold: item.minThreshold,
        attributes: (item.attributes as Record<string, unknown> | null) ?? {},
      });
      setImagePreview(item.image ?? null);
      setAttributeRows(parseAttributes(item.attributes));
    } else {
      createForm.reset({
        name: "",
        description: "",
        categoryId: categories[0]?.id ?? "",
        locationId: locations[0]?.id ?? "",
        image: "",
        sellingPrice: undefined,
        minThreshold: 0,
        attributes: {},
        stock: { quantity: undefined },
      });
      setImagePreview(null);
      setAttributeRows([{ key: "", value: "" }]);
    }
  }, [open, item, categories, locations, createForm, updateForm]);

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
      console.log("test", values);

      const quantity = values.stock?.quantity;
      const price = values.sellingPrice ?? 1;
      const payload = itemCreateSchema.parse({
        ...values,
        attributes: attributesToRecord(attributeRows),
        stock: quantity
          ? {
              quantity,
              totalCost: price * quantity,
              reason: "Initial inventory",
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
    (error) => {
      console.log("validation error", error);
    },
  );

  const onUpdateSubmit = updateForm.handleSubmit(async (values) => {
    const payload = itemUpdateSchema.parse({
      ...values,
      attributes: attributesToRecord(attributeRows),
    });

    try {
      await updateMutation.mutateAsync(payload);
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
            <legend className="font-ochre-ui text-[11px] font-semibold uppercase tracking-[0.05em] text-[#524439]">
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
                <Select
                  value={
                    isEdit
                      ? updateForm.watch("categoryId")
                      : createForm.watch("categoryId")
                  }
                  onValueChange={(v) => {
                    if (isEdit) {
                      updateForm.setValue("categoryId", v ?? "", {
                        shouldValidate: true,
                      });
                    } else {
                      createForm.setValue("categoryId", v ?? "", {
                        shouldValidate: true,
                      });
                    }
                  }}
                >
                  <SelectTrigger className={cn("mt-1.5 w-full", inputClass)}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <p className="font-ochre-ui text-[11px] font-semibold uppercase tracking-[0.05em] text-[#524439]">
                Location
              </p>
              {!isEdit ? (
                <Select
                  value={createForm.watch("locationId")}
                  onValueChange={(v) =>
                    createForm.setValue("locationId", v ?? "", {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger className={cn("mt-2 w-full", inputClass)}>
                    <SelectValue placeholder="Storage wing" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="mt-2 font-ochre-ui text-sm text-[#524439]">
                  Location is set at stock receipt and cannot be changed here.
                </p>
              )}
            </div>

            <div>
              <p className="font-ochre-ui text-[11px] font-semibold uppercase tracking-[0.05em] text-[#524439]">
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
            <legend className="font-ochre-ui text-[11px] font-semibold uppercase tracking-[0.05em] text-[#524439]">
              Financial controls &amp; availability
            </legend>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label className="font-ochre-ui text-sm">
                  Selling price ($)
                </Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  className={cn("mt-1.5", inputClass)}
                  {...(isEdit
                    ? updateForm.register("sellingPrice", {
                        setValueAs: (value) =>
                          value === "" ? undefined : Number(value),
                      })
                    : createForm.register("sellingPrice", {
                        setValueAs: (value) =>
                          value === "" ? undefined : Number(value),
                      }))}
                  required={false}
                />
              </div>
              {!isEdit ? (
                <div>
                  <Label className="font-ochre-ui text-sm">Initial stock</Label>
                  <Input
                    type="number"
                    min={0}
                    className={cn("mt-1.5", inputClass)}
                    {...createForm.register("stock.quantity", {
                      setValueAs: (value) =>
                        value === "" ? undefined : Number(value),
                    })}
                  />
                </div>
              ) : null}
              <div>
                <Label className="font-ochre-ui text-sm">Min. threshold</Label>
                <Input
                  type="number"
                  min={0}
                  className={cn("mt-1.5", inputClass)}
                  {...(isEdit
                    ? updateForm.register("minThreshold", {
                        setValueAs: (value) =>
                          value === "" ? undefined : Number(value),
                      })
                    : createForm.register("minThreshold", {
                        setValueAs: (value) =>
                          value === "" ? undefined : Number(value),
                      }))}
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="mt-6 space-y-3">
            <legend className="font-ochre-ui text-[11px] font-semibold uppercase tracking-[0.05em] text-[#524439]">
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
