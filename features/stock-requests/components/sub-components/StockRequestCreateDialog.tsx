"use client";

import { useId } from "react";
import { useFieldArray, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import {
  stockRequestCreateSchema,
  type StockRequestCreateSchema,
} from "@/shared/lib/zods/stock-request.zod";
import { useCreateStockRequest } from "../../stock-request.hooks";
import { ClipboardList, Loader2, Plus } from "lucide-react";
import StockRequestCreateRow from "./StockRequestCreateRow";

const MAX_REQUESTS = 5;

const emptyRequest = {
  itemId: "",
  stockId: "",
  destinationLocationId: "",
  requestType: "ISSUE" as const,
  quantity: 1,
  reason: "",
};

type StockRequestCreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export default function StockRequestCreateDialog({
  open,
  onOpenChange,
  onSuccess,
}: StockRequestCreateDialogProps) {
  const formId = useId();
  const createMutation = useCreateStockRequest();

  const form = useForm<StockRequestCreateSchema>({
    resolver: zodResolver(
      stockRequestCreateSchema,
    ) as Resolver<StockRequestCreateSchema>,
    defaultValues: {
      requests: [emptyRequest],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "requests",
  });

  const canAddMore = fields.length < MAX_REQUESTS;

  const resetForm = () => {
    form.reset({ requests: [emptyRequest] });
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createMutation.mutateAsync(values);
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch {
      /* Handled by mutation error notification */
    }
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          resetForm();
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent
        className="flex max-h-[90vh] max-w-2xl flex-col gap-0 overflow-hidden rounded-xl p-0 sm:max-w-2xl"
        showCloseButton
      >
        <DialogHeader className="shrink-0 border-b border-[#eef4ff] px-6 py-5">
          <DialogTitle className="font-ochre-brand text-2xl font-medium text-[#894d0d] flex items-center gap-2">
            <ClipboardList className="size-6 text-[#894d0d]" />
            New Stock Request
          </DialogTitle>
          <DialogDescription className="font-ochre-ui text-xs text-[#524439]/80 pt-1">
            Submit one or more stock requests in a single batch (up to{" "}
            {MAX_REQUESTS}). Each request is reviewed independently after
            submission.
          </DialogDescription>
        </DialogHeader>

        <form
          id={formId}
          onSubmit={onSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-5 font-ochre-ui space-y-4"
        >
          {fields.map((field, index) => (
            <StockRequestCreateRow
              key={field.id}
              index={index}
              requestNumber={index + 1}
              form={form}
              canRemove={fields.length > 1}
              onRemove={() => remove(index)}
            />
          ))}

          {form.formState.errors.requests?.root && (
            <p className="text-xs text-rose-600">
              {form.formState.errors.requests.root.message}
            </p>
          )}

          {canAddMore && (
            <Button
              type="button"
              variant="outline"
              onClick={() => append(emptyRequest)}
              className="w-full rounded-lg border-dashed border-[#d9e3f4] font-ochre-ui text-[#565e74] hover:border-[#894d0d]/35 hover:bg-[#f8f9ff] hover:text-[#894d0d]"
            >
              <Plus className="mr-1.5 size-4" />
              Add Another Request ({fields.length}/{MAX_REQUESTS})
            </Button>
          )}
        </form>

        <DialogFooter className="shrink-0 gap-2 border-t border-[#eef4ff] bg-[#f8f9ff]/50 px-6 py-4 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-lg font-ochre-ui border-[#d9e3f4]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form={formId}
            disabled={createMutation.isPending}
            className="rounded-lg bg-[#894d0d] font-ochre-ui text-white hover:bg-[#a76526]"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin mr-1.5" />
                Submitting...
              </>
            ) : fields.length > 1 ? (
              `Submit ${fields.length} Requests`
            ) : (
              "Submit Request"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
