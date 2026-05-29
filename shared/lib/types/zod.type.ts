import z from "zod";
import { sortLocationEnum, sortOrderEnum } from "../zods/general.zod";

export type Issue = {
  code: string;
  path: (string | number)[];
  message: string;
  expected?: string;
  keys?: string[];
};

export type SortOrder = z.infer<typeof sortOrderEnum>;
export type SortLocationBy = z.infer<typeof sortLocationEnum>;
