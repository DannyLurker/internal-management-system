import z from "zod";
import { stockRequestTypeEnum } from "./general.zod";

export const stockRequestCreateSchema = z.object({
  itemId: z.string().trim().min(1),
  quantity: z.number().min(1),
  sourceLocationId: z.string().trim().min(1),
  destinationLocationId: z.string().trim().min(1),
  requestType: stockRequestTypeEnum,
});

export type StockRequestCreateSchema = z.infer<typeof stockRequestCreateSchema>;
