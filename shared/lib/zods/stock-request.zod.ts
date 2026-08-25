import z from "zod";

export const stockRequestCreateScehma = z.object({
  itemId: z.string().trim().min(1),
  quantity: z.number().min(1),
});

export type StockRequestCreateSchema = z.infer<typeof stockRequestCreateScehma>;
