export const paths = {
  dashboard: "/dashboard",
  items: "/inventory/items",
  categories: "/inventory/categories",
  locations: "/inventory/locations",
  stocks: "/inventory/stocks",
  stock_movements: "/inventory/stock-movements",
} as const;

export type PathsType = typeof paths;
