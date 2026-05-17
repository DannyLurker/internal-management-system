import { z } from "zod";
import { dataPerPage, page, sortOrderEnum } from "./general.zod";

export const productCreateSchema = z.object({
  categoryId: z.string().trim().min(3),
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  image: z.string().optional(),
  price: z.number().min(1),
  attributes: z.record(z.any(), z.any()).optional().default({}),
  initialStock: z.number().optional(),
  expiredAt: z.coerce.date().optional(),
});

export type ProductCreateSchema = z.infer<typeof productCreateSchema>;

export const productUpdateSchema = z.object({
  productId: z.string().trim().min(1),
  categoryId: z.string().trim().min(3),
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  image: z.string().optional(),
  price: z.number().min(1),
  attributes: z.json().optional(),
});

export type ProductUpdateSchema = z.infer<typeof productUpdateSchema>;

export const productGetSchema = z.object({
  page,
  dataPerPage,
  isByCategory: z
    .preprocess((val) => val === "true", z.boolean())
    .default(false),
  categoryId: z.string().optional(),
  isTakeAll: z.preprocess((val) => val === "true", z.boolean()).default(false),
  search: z.string().trim().optional(),
  sortBy: z.enum(["name", "price", "createdAt"]).default("name"),
  orderBy: sortOrderEnum.default("asc"),
});

export type ProductGetSchema = z.infer<typeof productGetSchema>;
