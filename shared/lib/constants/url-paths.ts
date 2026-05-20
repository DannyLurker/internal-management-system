export const paths = {
  dashboard: "/dashboard",
  items: "/inventory/items",
  categories: "/inventory/categories",
} as const;

export type PathsType = typeof paths;
