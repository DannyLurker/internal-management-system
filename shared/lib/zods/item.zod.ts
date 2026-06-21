import { z } from "zod";
import {
  dataPerPage,
  page,
  sortItemByEnum,
  sortItemDetailByEnum,
  sortOrderEnum,
  stockStatusEnum,
} from "./general.zod";

export const itemCreateSchema = z.object({
  locationId: z.string().trim().min(3),
  categoryId: z.string().trim().min(3),
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  image: z.string().optional(),
  sellingPrice: z.number().min(1).optional(),
  minThreshold: z.number().optional(),
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

export const itemGetManyschema = z.object({
  page,
  dataPerPage,
  isByCategory: z
    .preprocess((val) => val === "true", z.boolean())
    .default(false),
  categoryId: z.string().optional(),
  // isTakeAll: z.preprocess((val) => val === "true", z.boolean()).default(false),
  search: z.string().trim().optional(),
  sortBy: sortItemByEnum,
  orderBy: sortOrderEnum.default("asc"),
  status: z
    .preprocess((val) => {
      if (typeof val == "boolean") return val;

      if (typeof val == "undefined" || typeof val === null || val === "")
        return undefined;

      if (val === "true") return true;
      if (val === "false") return false;
    }, z.boolean().optional())
    .optional(),
});

export type ItemGetManySchema = z.infer<typeof itemGetManyschema>;

export const itemGetDetailSchema = z.object({
  itemStockPage: page,
  itemStocksPerpage: dataPerPage,
  sortBy: sortItemDetailByEnum.default("quantity"),
  orderBy: sortOrderEnum.default("asc"),
  status: stockStatusEnum.default("ALL"),
});

export type ItemGetDetailSchema = z.infer<typeof itemGetDetailSchema>;

export const itemUpdateSchema = z.object({
  itemId: z.string().trim().min(1),
  categoryId: z.string().trim().min(3).optional(),
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  image: z.string().optional(),
  sellingPrice: z.number().min(1).optional(),
  attributes: z.record(z.any(), z.any()).optional().default({}),
  minThreshold: z.number().optional(),
  isActive: z.boolean().default(true),
});

export type ItemUpdateSchema = z.infer<typeof itemUpdateSchema>;
