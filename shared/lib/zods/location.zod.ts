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
  locationId: z.string().trim().min(3),
  name: z.string().trim().min(3).optional(),
  type: locationEnum.optional(),
  description: z.string().trim().optional(),
});

export type LocationUpdateSchema = z.infer<typeof locationUpdateSchema>;

export const locationGetSchema = z.object({
  searchQuery,
  page,
  dataPerPage,
  sortOrderEnum,
  sortBy: sortLocationEnum,
  locationType: locationEnum.optional(),
});

export type LocationGetSchema = z.infer<typeof locationGetSchema>;

export const locationGetSpesificSchema = z.object({
  itemSearchQuery: searchQuery,
  itemPage: page,
  itemDataPerPage: dataPerPage,
  sortOrder: sortOrderEnum,
  sortBy: sortItemEnumAtLocation,
  stockStatusType: stockStatusEnum,
});

export type LocationGetSpecificSchema = z.infer<
  typeof locationGetSpesificSchema
>;
