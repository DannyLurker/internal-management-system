import z from "zod";
import {
  dataPerPage,
  page,
  sortOrderEnum,
  stockMovementSortByEnum,
  stockMovementTypeEnum,
} from "./general.zod";

export const stockMovementCreateSchema = z.object({
  itemId: z.string().trim().min(1),
  stockId: z.string().trim().min(1),
  type: stockMovementTypeEnum,
  quantity: z.number().int().min(1),
  totalCost: z.number().optional(),
  reason: z.string().trim().min(10),
  sourceLocationId: z.string().trim().min(1).optional(),
  destinationLocationid: z.string().trim().min(1).optional(),
  orderId: z.string().trim().min(1).optional(),
});

export type StockMovementCreateSchema = z.infer<
  typeof stockMovementCreateSchema
>;

export const stockMovementUpdateSchema = z.object({
  itemId: z.string().trim().min(1),
  stockId: z.string().trim().min(1),
  type: stockMovementTypeEnum,
  quantity: z.number().int().min(1),
  totalCost: z.number().optional(),
  reason: z.string().trim().min(10),
  sourceLocationId: z.string().trim().min(1).optional(),
  destinationLocationid: z.string().trim().min(1).optional(),
  orderId: z.string().trim().min(1).optional(),
});

export type StockMovementUpdateSchema = z.infer<
  typeof stockMovementUpdateSchema
>;

export const stockMovementGetManySchema = z.object({
  searchQuery: z.string().trim().min(3).optional(),
  page: page,
  dataPerPage: dataPerPage,
  sortOrder: sortOrderEnum,
  sortBy: stockMovementSortByEnum.default("createdAt"),
  type: stockMovementTypeEnum.optional(),
});

export type StockMovementGetManySchema = z.infer<
  typeof stockMovementGetManySchema
>;
