import { Roles } from "@prisma/client";

const PERMISSIONS = {
  MANAGE_LOCATION: ["HOTEL_MANAGER", "SUPERVISOR"] as Roles[],
  MANAGE_CATEGORY: ["HOTEL_MANAGER", "SUPERVISOR"] as Roles[],
  MANAGE_ITEM: ["HOTEL_MANAGER", "SUPERVISOR"] as Roles[],
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

export const canDeleteLocation = (role: Roles) => {
  return role === "HOTEL_MANAGER";
};

export const canDeleteCategory = (role: Roles) => {
  return role === "HOTEL_MANAGER";
};

export const canDeleteItem = (role: Roles) => {
  return role === "HOTEL_MANAGER";
};
