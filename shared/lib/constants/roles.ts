import { Role } from "@prisma/client";

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Administrator",
  HOTEL_MANAGER: "Hotel Manager",
  SUPERVISOR: "Supervisor",
  ACCOUNTANT: "Accountant",
  FRONT_DESK: "Front Desk",
  HOUSEKEEPING: "Housekeeping",
};
