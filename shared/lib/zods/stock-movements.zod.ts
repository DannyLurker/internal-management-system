import z from "zod";
import {
  dataPerPage,
  page,
  sortOrderEnum,
  stockEnum,
  stockMovementSortByEnum,
  stockMovementTypeEnum,
} from "./general.zod";
import { MovementType } from "@prisma/client";

export const stockMovementCreateSchema = z
  .object({
    itemId: z.string().trim().min(1),
    stockId: z.string().trim().min(1).optional(),
    stockMovementType: stockMovementTypeEnum,
    stockTransferType: stockEnum.optional(),
    quantity: z.number().int().nonnegative(),
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
      val.stockMovementType === "SALE"
    ) {
      if (!val.totalCost) {
        ctx.addIssue({
          code: "custom",
          message: "Total cost field must be filled",
          path: ["totalCost"],
        });
      }
    }

    if (val.stockMovementType === "TRANSFER") {
      if (!val.stockTransferType) {
        ctx.addIssue({
          code: "custom",
          message: "Stock transfer type field must be filled",
          path: ["stockTransferType"],
        });
      }

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

export const stockMovementUpdateSchema = z.object({
  reason: z.string().trim().min(10),
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
