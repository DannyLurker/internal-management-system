import { z } from "zod";
import { dataPerPage, page, sortOrderEnum } from "./general.zod";

export const itemCreateSchema = z.object({
  locationId: z.string().trim().min(3),
  categoryId: z.string().trim().min(3),
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  image: z.string().optional(),
  sellingPrice: z.number().min(1).optional(),
  attributes: z.record(z.any(), z.any()).optional().default({}),
  stock: z
    .object({
      quantity: z.number().min(1).optional(),
      totalCost: z.number().min(1).optional(),
      reason: z.string().trim().min(1).optional(),
    })
    .optional()
    .superRefine((stock, ctx) => {
      if (!stock?.quantity) return;

      if (stock.totalCost == null) {
        ctx.addIssue({
          code: "invalid_value" as any,
          path: ["totalCost"],
          message: "Total cost is required when quantity is filled",
        });
      }

      if (!stock.reason) {
        ctx.addIssue({
          code: "invalid_value" as any,
          path: ["reason"],
          message: "Reason is required when quantity is filled",
        });
      }
    }),

  expiredAt: z.coerce.date().optional(),
});

export type ItemCreateSchema = z.infer<typeof itemCreateSchema>;
