import z from "zod";
import {
  dataPerPage,
  page,
  sortOrderEnum,
  stockEnum,
  stockSortByEnum,
} from "./general.zod";

export const stockCreateSchema = z
  .object({
    itemId: z.string().trim().min(1),
    quantity: z.number().min(1),
    totalCost: z.number().min(1),
    reason: z.string().trim().min(1),
    type: stockEnum,
    locationId: z.string().trim().min(1),
    expiredAt: z.coerce.date().optional(),
  })
  .superRefine(({ totalCost, reason, type }, ctx) => {
    if (totalCost == null && type === "READY") {
      ctx.addIssue({
        code: "invalid_value" as any,
        path: ["totalCost"],
        message: "Total cost is required is filled",
      });
    }

    if (!reason) {
      ctx.addIssue({
        code: "invalid_value" as any,
        path: ["reason"],
        message: "Reason is required when quantity is filled",
      });
    }
  });

export type StockCreateSchema = z.infer<typeof stockCreateSchema>;

export const stockGetSchema = z.object({
  searchQuery: z.string().trim().min(3).optional(),
  page: page,
  dataPerPage: dataPerPage,
  sortOrder: sortOrderEnum,
  sortBy: stockSortByEnum.default("createdAt"),
  type: stockEnum,
  locationId: z.string().optional(),
  itemId: z.string().optional(),
});

export type StockGetSchema = z.infer<typeof stockGetSchema>;

export const stockUpdateSchema = z.object({
  stockId: z.string().trim().min(1),
  quantity: z.number().min(1),
  type: stockEnum,
  locationId: z.string().trim().min(1),
  expiredAt: z.date().optional(),
});

export type StockUpdateSchema = z.infer<typeof stockUpdateSchema>;
