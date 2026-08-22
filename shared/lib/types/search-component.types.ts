import { LocationType } from "@prisma/client";

export interface SearchCategoryOption {
  id: string;
  name: string;
  totalItems?: number;
}

export interface SearchLocationOption {
  id: string;
  name: string;
  type: LocationType;
  description?: string | null;
}

export interface SearchItemSearchOption {
  id: string;
  name: string;
  costPrice?: number;
  sellingPrice?: number | null;
  minThreshold?: number;
  image?: string | null;
  category?: { id: string; name: string } | null;
  isActive?: boolean;
}
