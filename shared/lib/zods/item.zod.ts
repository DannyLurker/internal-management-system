import { z } from "zod";
import {
  dataPerPage,
  page,
  sortItemByEnum,
  sortOrderEnum,
} from "./general.zod";

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
      expiredAt: z.coerce.date().optional(),
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
});

export type ItemCreateSchema = z.infer<typeof itemCreateSchema>;

export const itemGetSchema = z.object({
  page,
  dataPerPage,
  isByCategory: z
    .preprocess((val) => val === "true", z.boolean())
    .default(false),
  categoryId: z.string().optional(),
  isByLocation: z
    .preprocess((val) => val === "true", z.boolean())
    .default(false),
  locationId: z.string().optional(),
  isTakeAll: z.preprocess((val) => val === "true", z.boolean()).default(false),
  search: z.string().trim().optional(),
  sortBy: sortItemByEnum,
  orderBy: sortOrderEnum.default("asc"),
});

export type ItemGetSchema = z.infer<typeof itemGetSchema>;

export const itemUpdateSchema = z.object({
  itemId: z.string().trim().min(1),
  categoryId: z.string().trim().min(3),
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  image: z.string().optional(),
  sellingPrice: z.number().min(1).optional(),
  attributes: z.record(z.any(), z.any()).optional().default({}),
});

export type ItemUpdateSchema = z.infer<typeof itemUpdateSchema>;
