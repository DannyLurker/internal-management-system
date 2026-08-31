import z from "zod";
import { stockRequestStatusEnum, stockRequestTypeEnum } from "./general.zod";

export const stockRequestCreateSchema = z.object({
  itemId: z.string().trim().min(1),
  quantity: z.number().min(1),
  sourceLocationId: z.string().trim().min(1),
  destinationLocationId: z.string().trim().min(1),
  requestType: stockRequestTypeEnum,
});

export type StockRequestCreateSchema = z.infer<typeof stockRequestCreateSchema>;

export const stockRequestReviewSchema = z
  .object({
    stockRequestStatus: stockRequestStatusEnum,
    approvedQuantity: z.number().min(0),
    decisitonNotes: z.string().max(100).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.stockRequestStatus === "PENDING") {
      ctx.addIssue({
        code: "custom",
        message: "Status can't remain 'Pending'. You must change it",
        path: ["stockRequestStatus"],
      });
    }
  });

export type StockRequestReviewSchema = z.infer<typeof stockRequestReviewSchema>;

export const stockRequestUpdateSchema = z.object({
  type: stockRequestTypeEnum,
  requestedQuantity: z.number().min(1),
  sourceLocationId: z.string().trim().min(1),
  destinationLocationId: z.string().trim().min(1),
});

export type StockRequestUpdateSchema = z.infer<typeof stockRequestUpdateSchema>;
