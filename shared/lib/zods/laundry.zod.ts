import z from "zod";
import {
  dataPerPage,
  laundrySortByEnum,
  laundryStatusEnum,
  page,
  sortOrderEnum,
} from "./general.zod";

export const laundryCreateSchema = z.object({
  laundryId: z.string().min(1),
  actionType: z.enum(["CANCELLED", "RETURNED"]),
  destinationLocationId: z.string().min(1),
});

export type LaundryCreateSchema = z.infer<typeof laundryCreateSchema>;

export const laundryGetManySchema = z.object({
  page,
  dataPerPage,
  sortBy: laundrySortByEnum,
  sortOrder: sortOrderEnum,
  searchQuery: z.string().optional(),
  status: laundryStatusEnum,
  sourceLocationId: z.string().optional(),
  destinationLocationId: z.string().optional(),
});

export type LaundryGetManySchema = z.infer<typeof laundryGetManySchema>;
