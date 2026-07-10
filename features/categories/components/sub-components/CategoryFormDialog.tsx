"use client";

import { useEffect, useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { CategoryListItem } from "@/features/categories/category.types";
import {
  categoryCreateSchema,
  categoryUpdateSchema,
  type CategoryCreateSchema,
  type CategoryUpdateSchema,
} from "@/shared/lib/zods/category.zod";

type CategoryFormDialogProps = {
  open: boolean;
  mode: "create" | "update";
  category: CategoryListItem | null;
  isSubmitting: boolean;
  onClose: () => void;
  onCreate: (values: CategoryCreateSchema) => void | Promise<void>;
  onUpdate: (values: CategoryUpdateSchema) => void | Promise<void>;
};

type CreateFormValues = CategoryCreateSchema;
type UpdateFormValues = CategoryUpdateSchema;

function CreateForm({
  open,
  isSubmitting,
  onClose,
  onCreate,
}: {
  open: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onCreate: CategoryFormDialogProps["onCreate"];
}) {
  const titleId = useId();
  const form = useForm<CreateFormValues>({
    resolver: zodResolver(categoryCreateSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (open) form.reset({ name: "" });
  }, [open, form]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            aria-label="Close dialog"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-[0_24px_64px_-24px_rgba(15,23,42,0.25)]"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#eef4ff] px-6 py-5">
              <div>
                <h2
                  id={titleId}
                  className="font-ochre-brand text-2xl font-medium text-[#894d0d]"
                >
                  New category
                </h2>
                <p className="mt-1 font-ochre-ui text-sm text-[#524439]/80">
                  Define a new organizational group for your inventory.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-[#565e74] hover:bg-[#eef4ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#894d0d]"
                aria-label="Close"
              >
                <X className="size-5" strokeWidth={1.5} />
              </button>
            </div>

            <form
              className="px-6 py-5"
              onSubmit={form.handleSubmit(async (values) => {
                await onCreate(values);
              })}
            >
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="category-name-create"
                    className="font-ochre-ui text-sm font-medium text-[#121c28]"
                  >
                    Category name
                  </label>
                  <input
                    id="category-name-create"
                    autoComplete="off"
                    className={cn(
                      "mt-1.5 w-full border-0 border-b border-[#d9e3f4] bg-transparent pb-2 font-ochre-ui text-sm text-[#121c28] outline-none transition-colors",
                      "placeholder:text-[#524439]/45 focus:border-[#894d0d]",
                    )}
                    placeholder="e.g., Luxury textiles"
                    {...form.register("name")}
                  />
                  {form.formState.errors.name ? (
                    <p className="mt-1.5 flex items-center gap-1 font-ochre-ui text-xs text-[#ba1a1a]">
                      <span aria-hidden>⚠️</span>
                      {form.formState.errors.name.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-end gap-3 border-t border-[#eef4ff] bg-[#f8f9ff]/40 px-0 pt-5">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md border border-[#d8c3b4] bg-white px-4 py-2 font-ochre-ui text-sm font-semibold text-[#121c28] hover:bg-[#f8f9ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#894d0d]"
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
                  Save category
                  <span className="flex size-6 items-center justify-center rounded-full bg-white/15">
                    <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
                  </span>
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function UpdateForm({
  open,
  category,
  isSubmitting,
  onClose,
  onUpdate,
}: {
  open: boolean;
  category: CategoryListItem | null;
  isSubmitting: boolean;
  onClose: () => void;
  onUpdate: CategoryFormDialogProps["onUpdate"];
}) {
  const titleId = useId();
  const form = useForm<UpdateFormValues>({
    resolver: zodResolver(categoryUpdateSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (open && category) {
      form.reset({ name: category.name });
    }
  }, [open, category, form]);

  return (
    <AnimatePresence>
      {open && category ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            aria-label="Close dialog"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-[0_24px_64px_-24px_rgba(15,23,42,0.25)]"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#eef4ff] px-6 py-5">
              <div>
                <h2
                  id={titleId}
                  className="font-ochre-brand text-2xl font-medium text-[#894d0d]"
                >
                  Edit category
                </h2>
                <p className="mt-1 font-ochre-ui text-sm text-[#524439]/80">
                  Update how this group appears across your inventory.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-[#565e74] hover:bg-[#eef4ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#894d0d]"
                aria-label="Close"
              >
                <X className="size-5" strokeWidth={1.5} />
              </button>
            </div>

            <form
              className="px-6 py-5"
              onSubmit={form.handleSubmit(async (values) => {
                await onUpdate(values);
              })}
            >
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="category-name-update"
                    className="font-ochre-ui text-sm font-medium text-[#121c28]"
                  >
                    Category name
                  </label>
                  <input
                    id="category-name-update"
                    autoComplete="off"
                    className={cn(
                      "mt-1.5 w-full border-0 border-b border-[#d9e3f4] bg-transparent pb-2 font-ochre-ui text-sm text-[#121c28] outline-none transition-colors",
                      "placeholder:text-[#524439]/45 focus:border-[#894d0d]",
                    )}
                    placeholder="e.g., Luxury textiles"
                    {...form.register("name")}
                  />
                  {form.formState.errors.name ? (
                    <p className="mt-1.5 flex items-center gap-1 font-ochre-ui text-xs text-[#ba1a1a]">
                      <span aria-hidden>⚠️</span>
                      {form.formState.errors.name.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-end gap-3 border-t border-[#eef4ff] bg-[#f8f9ff]/40 px-0 pt-5">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md border border-[#d8c3b4] bg-white px-4 py-2 font-ochre-ui text-sm font-semibold text-[#121c28] hover:bg-[#f8f9ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#894d0d]"
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
                  Save category
                  <span className="flex size-6 items-center justify-center rounded-full bg-white/15">
                    <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
                  </span>
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default function CategoryFormDialog(props: CategoryFormDialogProps) {
  if (props.mode === "update") {
    return (
      <UpdateForm
        open={props.open}
        category={props.category}
        isSubmitting={props.isSubmitting}
        onClose={props.onClose}
        onUpdate={props.onUpdate}
      />
    );
  }
  return (
    <CreateForm
      open={props.open}
      isSubmitting={props.isSubmitting}
      onClose={props.onClose}
      onCreate={props.onCreate}
    />
  );
}
