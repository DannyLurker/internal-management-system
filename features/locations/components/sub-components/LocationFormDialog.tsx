"use client";

import { useEffect } from "react";
import { useForm, type Resolver, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { LocationType } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  useCreateLocation,
  useUpdateLocation,
} from "@/features/locations/location.hooks";
import { LOCATION_TYPE_OPTIONS } from "@/features/locations/location.utils";
import {
  locationCreateSchema,
  locationUpdateSchema,
  type LocationCreateSchema,
  type LocationUpdateSchema,
} from "@/shared/lib/zods/location.zod";
import { cn } from "@/shared/lib/utils";

type LocationFormDefaultValues = {
  locationId: string;
  name: string;
  type: LocationType;
  description?: string;
};

type LocationFormDialogProps = {
  mode: "create" | "edit";
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultValues?: LocationFormDefaultValues;
};

const fieldLabelClass =
  "font-ochre-ui text-[10px] font-semibold uppercase tracking-wider text-[#524439]/80";

const fieldInputClass = cn(
  "mt-1.5 w-full rounded-lg border border-[#e5eeff] bg-[#f8f9ff]/80 px-3 py-2.5 font-ochre-ui text-sm text-[#121c28] outline-none transition-[border-color,box-shadow]",
  "placeholder:text-[#524439]/45 focus:border-[#894d0d]/35 focus:ring-2 focus:ring-[#894d0d]/15",
);

type LocationFormFields = {
  name: string;
  type: LocationType;
  description?: string;
};

function LocationFormFields({
  form,
  idPrefix,
}: {
  form: UseFormReturn<LocationFormFields>;
  idPrefix: string;
}) {
  const selectedType = form.watch("type");

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor={`${idPrefix}-name`} className={fieldLabelClass}>
          Location name
        </label>
        <input
          id={`${idPrefix}-name`}
          autoComplete="off"
          className={fieldInputClass}
          placeholder="e.g. North Wing Cellar"
          {...form.register("name")}
        />
        {form.formState.errors.name ? (
          <p className="mt-1.5 font-ochre-ui text-xs text-[#ba1a1a]">
            {form.formState.errors.name.message}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor={`${idPrefix}-type`} className={fieldLabelClass}>
          Type
        </label>
        <Select
          value={selectedType}
          onValueChange={(value) => {
            if (!value) return;
            form.setValue("type", value as LocationType, {
              shouldValidate: true,
            });
          }}
        >
          <SelectTrigger
            id={`${idPrefix}-type`}
            className={cn(fieldInputClass, "mt-1.5 flex h-auto w-full")}
          >
            <SelectValue>
              {LOCATION_TYPE_OPTIONS.find((option) => option.value === selectedType)
                ?.label ?? "Select type"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {LOCATION_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.type ? (
          <p className="mt-1.5 font-ochre-ui text-xs text-[#ba1a1a]">
            {form.formState.errors.type.message}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor={`${idPrefix}-description`} className={fieldLabelClass}>
          Description
        </label>
        <textarea
          id={`${idPrefix}-description`}
          rows={4}
          className={cn(fieldInputClass, "resize-none")}
          placeholder="Enter specific access instructions or notes..."
          {...form.register("description")}
        />
        {form.formState.errors.description ? (
          <p className="mt-1.5 font-ochre-ui text-xs text-[#ba1a1a]">
            {form.formState.errors.description.message}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function LocationFormShell({
  submitLabel,
  isSubmitting,
  onClose,
  onSubmit,
  children,
}: {
  submitLabel: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <form className="px-6 py-5" onSubmit={onSubmit}>
      {children}
      <DialogFooter className="mt-8 gap-3 border-t border-[#eef4ff] bg-[#f8f9ff]/40 px-0 pt-5 sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md px-4 py-2 font-ochre-ui text-sm font-semibold text-[#565e74] hover:text-[#121c28] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#894d0d]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "inline-flex items-center gap-2 rounded-md bg-[#894d0d] px-4 py-2 font-ochre-ui text-sm font-semibold text-white",
            "hover:bg-[#6d3a00] disabled:cursor-not-allowed disabled:opacity-60",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#894d0d]",
          )}
        >
          {submitLabel}
          <span className="flex size-6 items-center justify-center rounded-full bg-white/15">
            <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
          </span>
        </button>
      </DialogFooter>
    </form>
  );
}

export default function LocationFormDialog({
  mode,
  open,
  onClose,
  onSuccess,
  defaultValues,
}: LocationFormDialogProps) {
  const createMutation = useCreateLocation();
  const updateMutation = useUpdateLocation();

  const createForm = useForm<LocationCreateSchema>({
    resolver: zodResolver(locationCreateSchema) as Resolver<LocationCreateSchema>,
    defaultValues: {
      name: "",
      type: LocationType.MAIN_WAREHOUSE,
      description: "",
    },
  });

  const updateForm = useForm<LocationUpdateSchema>({
    resolver: zodResolver(locationUpdateSchema) as Resolver<LocationUpdateSchema>,
    defaultValues: {
      locationId: "",
      name: "",
      type: LocationType.MAIN_WAREHOUSE,
      description: "",
    },
  });

  useEffect(() => {
    if (!open) return;

    if (mode === "create") {
      createForm.reset({
        name: "",
        type: LocationType.MAIN_WAREHOUSE,
        description: "",
      });
      return;
    }

    if (defaultValues) {
      updateForm.reset({
        locationId: defaultValues.locationId,
        name: defaultValues.name,
        type: defaultValues.type,
        description: defaultValues.description ?? "",
      });
    }
  }, [open, mode, defaultValues, createForm, updateForm]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) onClose();
  };

  const isCreate = mode === "create";
  const isSubmitting = isCreate
    ? createMutation.isPending
    : updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton
        className="gap-0 overflow-hidden rounded-lg border-[#eef4ff] p-0 sm:max-w-lg"
      >
        <DialogHeader className="border-b border-[#eef4ff] px-6 py-5 text-left">
          <DialogTitle className="font-ochre-brand text-2xl font-medium text-[#894d0d]">
            {isCreate ? "New location" : "Edit location"}
          </DialogTitle>
          <DialogDescription className="font-ochre-ui text-sm text-[#524439]/80">
            {isCreate
              ? "Define a new storage location for your inventory."
              : "Update the details for this storage location."}
          </DialogDescription>
        </DialogHeader>

        {isCreate ? (
          <LocationFormShell
            submitLabel="Save location"
            isSubmitting={isSubmitting}
            onClose={onClose}
            onSubmit={createForm.handleSubmit(async (values) => {
              try {
                await createMutation.mutateAsync({
                  ...values,
                  description: values.description?.trim() || undefined,
                });
                onSuccess();
                onClose();
              } catch {
                /* errors surfaced by API client */
              }
            })}
          >
            <LocationFormFields form={createForm} idPrefix="location-create" />
          </LocationFormShell>
        ) : (
          <LocationFormShell
            submitLabel="Update location"
            isSubmitting={isSubmitting}
            onClose={onClose}
            onSubmit={updateForm.handleSubmit(async (values) => {
              try {
                await updateMutation.mutateAsync({
                  ...values,
                  description: values.description?.trim() || undefined,
                });
                onSuccess();
                onClose();
              } catch {
                /* errors surfaced by API client */
              }
            })}
          >
            <input type="hidden" {...updateForm.register("locationId")} />
            <LocationFormFields form={updateForm} idPrefix="location-edit" />
          </LocationFormShell>
        )}
      </DialogContent>
    </Dialog>
  );
}
