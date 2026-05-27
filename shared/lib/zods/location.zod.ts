import z from "zod";
import { locationEnum } from "./general.zod";

export const locationCreateSchema = z.object({
  name: z.string().trim().min(3),
  type: locationEnum,
  description: z.string().trim().optional(),
});

export type LocationCreateSchema = z.infer<typeof locationCreateSchema>;
