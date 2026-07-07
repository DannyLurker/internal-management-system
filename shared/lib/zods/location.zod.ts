import z from "zod";
import {
  dataPerPage,
  locationEnum,
  page,
  searchQuery,
  sortItemEnumAtLocation,
  sortLocationEnum,
  sortOrderEnum,
  stockStatusEnum,
} from "./general.zod";

export const locationCreateSchema = z.object({
  name: z.string().trim().min(3),
  type: locationEnum,
  description: z.string().trim().optional(),
});

export type LocationCreateSchema = z.infer<typeof locationCreateSchema>;

export const locationUpdateSchema = z.object({
  name: z.string().trim().min(3).optional(),
  type: locationEnum.optional(),
  description: z.string().trim().optional(),
});

export type LocationUpdateSchema = z.infer<typeof locationUpdateSchema>;

export const locationGetManySchema = z.object({
  searchQuery,
  page,
  dataPerPage,
  sortOrderEnum,
  sortBy: sortLocationEnum,
  locationType: locationEnum.optional(),
});

export type LocationGetManySchema = z.infer<typeof locationGetManySchema>;

export const locationGetByIdSchema = z.object({
  itemSearchQuery: searchQuery,
  itemPage: page,
  itemDataPerPage: dataPerPage,
  sortOrder: sortOrderEnum.default("desc"),
  sortBy: sortItemEnumAtLocation.default("name"),
  stockStatusType: stockStatusEnum.default("ALL"),
});

export type LocationGetByIdSchema = z.infer<typeof locationGetByIdSchema>;
