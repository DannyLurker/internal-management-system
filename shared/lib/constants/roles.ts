import { Roles } from "@prisma/client";

export const ROLE_LABEL: Record<Roles, string> = {
  ADMIN: "Administrator",
  OWNER: "Owner",
  MANAGER: "Manager",
  INVENTORY: "Inventory",
  CASHIER: "Cashier",
};
