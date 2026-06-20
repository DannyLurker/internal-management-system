import z from "zod";
import {
  sortItemEnumAtLocation,
  sortLocationEnum,
  sortOrderEnum,
  stockStatusEnum,
} from "../zods/general.zod";

export type Issue = {
  code: string;
  path: (string | number)[];
  message: string;
  expected?: string;
  keys?: string[];
};

export type SortOrder = z.infer<typeof sortOrderEnum>;
export type SortLocationBy = z.infer<typeof sortLocationEnum>;
export type SortItemByAtLocation = z.infer<typeof sortItemEnumAtLocation>;
export type StockTypeStatus = z.infer<typeof stockStatusEnum>;
