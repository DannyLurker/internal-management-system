import { Role } from "@prisma/client";

const PERMISSIONS = {
  MANAGE_LOCATION: ["HOTEL_MANAGER", "SUPERVISOR"] as Role[],
  MANAGE_CATEGORY: ["HOTEL_MANAGER", "SUPERVISOR"] as Role[],
  MANAGE_ITEM: ["HOTEL_MANAGER", "SUPERVISOR"] as Role[],
  MANAGE_STOCK: ["HOTEL_MANAGER", "SUPERVISOR"] as Role[],
  MANAGE_STOCK_MOVEMENT: ["HOTEL_MANAGER", "SUPERVISOR"] as Role[],
  MANAGER_LAUNDRY: ["HOTEL_MANAGER", "SUPERVISOR"] as Role[],
  ACCESS_MANAGER_DASHBOARD: "HOTEL_MANAGER" as Role,
  PRINT_REPORT: ["HOTEL_MANAGER", "ACCOUNTANT"] as Role[],
  STOCK_REQUEST: ["HOUSEKEEPING", "FRONT_DESK"] as Role[],
  STOCK_REQUEST_UPDATE_REVIEW: [
    "HOTEL_MANAGER",
    "SUPERVISOR",
    "FRONT_DESK",
    "HOUSEKEEPING",
  ] as Role[],
};

export const canManageLocation = (role: Role) => {
  return PERMISSIONS.MANAGE_LOCATION.includes(role);
};

export const canManageCategory = (role: Role) => {
  return PERMISSIONS.MANAGE_CATEGORY.includes(role);
};

export const canManageItem = (role: Role) => {
  return PERMISSIONS.MANAGE_ITEM.includes(role);
};

export const canManageStock = (role: Role) => {
  return PERMISSIONS.MANAGE_STOCK.includes(role);
};

export const canManageStockMovement = (role: Role) => {
  return PERMISSIONS.MANAGE_STOCK_MOVEMENT.includes(role);
};

export const canDeleteLocation = (role: Role) => {
  return role === "HOTEL_MANAGER";
};

export const canDeleteCategory = (role: Role) => {
  return role === "HOTEL_MANAGER";
};

export const canDeleteItem = (role: Role) => {
  return role === "HOTEL_MANAGER";
};

export const canDeleteStock = (role: Role) => {
  return role === "HOTEL_MANAGER";
};

export const canDeleteStockMovement = (role: Role) => {
  return role === "HOTEL_MANAGER";
};

export const canAccessManagerDashboard = (role: Role) => {
  return role === PERMISSIONS.ACCESS_MANAGER_DASHBOARD;
};

export const canManageLaundry = (role: Role) => {
  return PERMISSIONS.MANAGER_LAUNDRY.includes(role);
};

export const canPrintReport = (role: Role) => {
  return PERMISSIONS.PRINT_REPORT.includes(role);
};

export const canManageStockRequest = (role: Role) => {
  return PERMISSIONS.STOCK_REQUEST.includes(role);
};

export const canUpdateReviewStockRequest = (role: Role) => {
  return PERMISSIONS.STOCK_REQUEST_UPDATE_REVIEW.includes(role);
};
