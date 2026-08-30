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

export const stockRequestUpdateSchema = z.object({
  stockRequestStatus: stockRequestStatusEnum,
  approvedQuantity: z.number().optional(),
  decisitonNotes: z.string().optional(),
});

export type StockRequestUpdateSchema = z.infer<typeof stockRequestUpdateSchema>;
