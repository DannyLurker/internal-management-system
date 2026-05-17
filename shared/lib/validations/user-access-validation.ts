import { Roles } from "@prisma/client";

const PERMISSIONS = {
  MANAGE_PRODUCT: ["MANAGER", "OWNER"],
  MANAGE_INVENTORY: ["OWNER", "MANAGER", "INVENTORY"],
  MANAGE_CATEGORY: ["OWNER", "MANAGER", "INVENTORY"],
};

export const canManageCategory = (role: Roles) => {
  return PERMISSIONS.MANAGE_CATEGORY.includes(role);
};

export const canManageProduct = (role: Roles) => {
  return PERMISSIONS.MANAGE_PRODUCT.includes(role);
};
