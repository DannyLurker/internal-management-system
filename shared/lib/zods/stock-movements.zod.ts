import z from "zod";
import {
  dataPerPage,
  page,
  sortOrderEnum,
  stockEnum,
  stockMovementSortByEnum,
  stockMovementTypeEnum,
} from "./general.zod";

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
    if (val.stockId) {
      if (!val.destinationLocationId) {
        ctx.addIssue({
          code: "custom",
          message: "Destination locaiton field must be filled",
          path: ["destinationLocationId"],
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
          message: "Destination locaiton field must be filled",
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
