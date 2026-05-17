import { z } from "zod";
import { dataPerPage, page, sortOrderEnum } from "./general.zod";

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(3),
});

export type CategoryCreateSchema = z.infer<typeof categoryCreateSchema>;

export const categoryUpdateSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(3),
});

export type CategoryUpdateSchema = z.infer<typeof categoryUpdateSchema>;

export const categoryGetSchema = z.object({
  search: z.string().trim().min(3).optional(),
  sortOrder: sortOrderEnum,
  sortBy: z.enum(["name", "createdAt"]).default("name"),
  page: page,
  dataPerPage: dataPerPage,
});

export type CategoryGetSchema = z.infer<typeof categoryGetSchema>;
