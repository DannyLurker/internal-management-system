import z from "zod";
import {
  dataPerPage,
  page,
  sortOrderEnum,
  stockMovementSortByEnum,
  stockMovementTypeEnum,
} from "./general.zod";
import { MovementType } from "@prisma/client";

export const stockMovementCreateSchema = z
  .object({
    itemId: z.string().trim().min(1),
    stockId: z.string().trim().min(1).optional(),
    stockMovementType: stockMovementTypeEnum,
    quantity: z.number().int(),
    totalCost: z.number().int().optional(),
    reason: z.string().trim().min(10),
    sourceLocationId: z.string().trim().min(1).optional(),
    destinationLocationId: z.string().trim().min(1).optional(),
    orderId: z.string().trim().min(1).optional(),
  })
  .superRefine((val, ctx) => {
    const TYPES_REQUIRING_DESTINATION: MovementType[] = [
      "RECEIVE",
      "TRANSFER",
      "LAUNDRY_IN",
      "MARK_AS_DAMAGED",
      "MARK_AS_DIRTY",
      "MARK_AS_LOST",
    ];

    const TYPES_REQUIRING_SOURCE: MovementType[] = [
      "TRANSFER",
      "LAUNDRY_OUT",
      "MARK_AS_DAMAGED",
      "MARK_AS_DIRTY",
      "CONSUME",
      "SALE",
      "DISCARD",
      "ADJUSTMENT", // Required to know which specific stock row is being adjusted
      "MARK_AS_LOST",
    ];

    if (TYPES_REQUIRING_DESTINATION.includes(val.stockMovementType)) {
      if (!val.destinationLocationId) {
        ctx.addIssue({
          code: "custom",
          message: "Destination location field must be filled",
          path: ["destinationLocationId"],
        });
      }
    }

    if (TYPES_REQUIRING_SOURCE.includes(val.stockMovementType)) {
      if (!val.sourceLocationId) {
        ctx.addIssue({
          code: "custom",
          message: "Source location field must be filled",
          path: ["sourceLocationId"],
        });
      }
    }

    if (
      val.stockMovementType !== "ADJUSTMENT" &&
      val.quantity &&
      val.quantity < 1
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Quantity field must be greater than 0",
        path: ["quantity"],
      });
    }

    if (
      val.stockMovementType === "DISCARD" ||
      val.stockMovementType === "SALE" ||
      val.stockMovementType === "LAUNDRY_OUT"
    ) {
      if (!val.totalCost || val.totalCost < 1) {
        ctx.addIssue({
          code: "custom",
          message:
            "Total cost field must be filled or total cost must be greater than 0",
          path: ["totalCost"],
        });
      }
    }

    if (val.stockMovementType === "TRANSFER") {
      if (!val.destinationLocationId) {
        ctx.addIssue({
          code: "custom",
          message: "Destination location field must be filled",
          path: ["destinationLocationId"],
        });
      }

      if (!val.sourceLocationId) {
        ctx.addIssue({
          code: "custom",
          message: "Source location field must be filled",
          path: ["sourceLocationId"],
        });
      }
    }
  });

export type StockMovementCreateSchema = z.infer<
  typeof stockMovementCreateSchema
>;

export const stockQuickDiscardSchema = z.object({
  stockId: z.string().trim().min(1),
  quantity: z.number().int().nonnegative(),
  totalCost: z.number().int().nonnegative(),
  discardAs: z.enum(["DAMAGED", "EXPIRED", "LOST"]),
  reason: z.string().trim().min(10),
});

export type StockQuickDiscardSchema = z.infer<typeof stockQuickDiscardSchema>;

export const stockQuickLaundryOutSchema = z.object({
  stockId: z.string().trim().min(1),
  quantity: z.number().int().positive(),
  totalCost: z.number().int().nonnegative(),

  reason: z.string().trim().min(10),
});

export type StockQuickLaundryOutSchema = z.infer<
  typeof stockQuickLaundryOutSchema
>;

export const stockMovementUpdateSchema = z.object({
  reason: z.string().trim().min(10),
});

export type StockMovementUpdateSchema = z.infer<
  typeof stockMovementUpdateSchema
>;

export const stockMovementGetManySchema = z.object({
  searchQuery: z.string().trim().min(3).optional(),
  sourceLocationId: z.string().trim().min(1).optional(),
  destinationLocationId: z.string().trim().min(1).optional(),
  page: page,
  dataPerPage: dataPerPage,
  sortOrder: sortOrderEnum,
  sortBy: stockMovementSortByEnum.default("createdAt"),
  type: stockMovementTypeEnum.optional(),
});

export type StockMovementGetManySchema = z.infer<
  typeof stockMovementGetManySchema
>;
