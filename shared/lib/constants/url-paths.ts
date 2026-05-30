export const paths = {
  dashboard: "/dashboard",
  items: "/inventory/items",
  categories: "/inventory/categories",
  locations: "/inventory/locations",
} as const;

export type PathsType = typeof paths;
