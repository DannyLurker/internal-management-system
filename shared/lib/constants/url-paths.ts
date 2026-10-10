export const paths = {
  dashboard: "/dashboard",
  staffCreate: "/staff/create",
  items: "/inventory/items",
  categories: "/inventory/categories",
  locations: "/inventory/locations",
  stocks: "/inventory/stocks",
  stock_movements: "/inventory/stock-movements",
  laundry: "/inventory/laundry",
  stock_requests: "/inventory/stock-requests",
} as const;

export type PathsType = typeof paths;
