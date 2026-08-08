import { Roles } from "@prisma/client";

const PERMISSIONS = {
  MANAGE_LOCATION: ["HOTEL_MANAGER", "SUPERVISOR"] as Roles[],
  MANAGE_CATEGORY: ["HOTEL_MANAGER", "SUPERVISOR"] as Roles[],
  MANAGE_ITEM: ["HOTEL_MANAGER", "SUPERVISOR"] as Roles[],
  MANAGE_STOCK: ["HOTEL_MANAGER", "SUPERVISOR"] as Roles[],
  MANAGE_STOCK_MOVEMENT: ["HOTEL_MANAGER", "SUPERVISOR"] as Roles[],
  MANAGER_LAUNDRY: ["HOTEL_MANAGER", "SUPERVISOR"] as Roles[],
  ACCESS_MANAGER_DASHBOARD: "HOTEL_MANAGER" as Roles,
  PRINT_REPORT: ["HOTEL_MANAGER", "ACCOUNTANT"] as Roles[],
};

export const canManageLocation = (role: Roles) => {
  return PERMISSIONS.MANAGE_LOCATION.includes(role);
};

export const canManageCategory = (role: Roles) => {
  return PERMISSIONS.MANAGE_CATEGORY.includes(role);
};

export const canManageItem = (role: Roles) => {
  return PERMISSIONS.MANAGE_ITEM.includes(role);
};

export const canManageStock = (role: Roles) => {
  return PERMISSIONS.MANAGE_STOCK.includes(role);
};

export const canManageStockMovement = (role: Roles) => {
  return PERMISSIONS.MANAGE_STOCK_MOVEMENT.includes(role);
};

export const canDeleteLocation = (role: Roles) => {
  return role === "HOTEL_MANAGER";
};

export const canDeleteCategory = (role: Roles) => {
  return role === "HOTEL_MANAGER";
};

export const canDeleteItem = (role: Roles) => {
  return role === "HOTEL_MANAGER";
};

export const canDeleteStock = (role: Roles) => {
  return role === "HOTEL_MANAGER";
};

export const canDeleteStockMovement = (role: Roles) => {
  return role === "HOTEL_MANAGER";
};

export const canAccessManagerDashboard = (role: Roles) => {
  return role === PERMISSIONS.ACCESS_MANAGER_DASHBOARD;
};

export const canManageLaundry = (role: Roles) => {
  return PERMISSIONS.MANAGER_LAUNDRY.includes(role);
};

export const canPrintReport = (role: Roles) => {
  return PERMISSIONS.PRINT_REPORT.includes(role);
};
