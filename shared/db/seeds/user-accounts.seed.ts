import { Roles } from "@prisma/client";
import { hash } from "bcryptjs";
import prisma from "../prisma";

export async function createUserAccountsSeed() {
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@hotel.com" },
    update: {},
    create: {
      name: "System Admin",
      email: "admin@hotel.com",
      password: await hash("admin123", 10),
      role: Roles.ADMIN,
    },
  });

  const hotelManagerUser = await prisma.user.upsert({
    where: { email: "manager@hotel.com" },
    update: {},
    create: {
      name: "Hotel Manager",
      email: "manager@hotel.com",
      password: await hash("manager123", 10),
      role: Roles.HOTEL_MANAGER,
    },
  });

  const supervisorUser = await prisma.user.upsert({
    where: { email: "supervisor@hotel.com" },
    update: {},
    create: {
      name: "Shift Supervisor",
      email: "supervisor@hotel.com",
      password: await hash("supervisor123", 10),
      role: Roles.SUPERVISOR,
    },
  });

  const accountantUser = await prisma.user.upsert({
    where: { email: "accountant@hotel.com" },
    update: {},
    create: {
      name: "Hotel Accountant",
      email: "accountant@hotel.com",
      password: await hash("accountant123", 10),
      role: Roles.ACCOUNTANT,
    },
  });

  const housekeepingUser = await prisma.user.upsert({
    where: { email: "housekeeping@hotel.com" },
    update: {},
    create: {
      name: "Housekeeping Staff",
      email: "housekeeping@hotel.com",
      password: await hash("housekeeping123", 10),
      role: Roles.HOUSEKEEPING,
    },
  });

  const frontDeskUser = await prisma.user.upsert({
    where: { email: "frontdesk@hotel.com" },
    update: {},
    create: {
      name: "Front Desk Staff",
      email: "frontdesk@hotel.com",
      password: await hash("frontdesk123", 10),
      role: Roles.FRONT_DESK,
    },
  });

  console.log("   ✓ Created 6 users");
  console.log("     - Admin:        admin@hotel.com / admin123");
  console.log("     - Hotel Manager: manager@hotel.com / manager123");
  console.log("     - Supervisor:   supervisor@hotel.com / supervisor123");
  console.log("     - Accountant:   accountant@hotel.com / accountant123");
  console.log("     - Housekeeping: housekeeping@hotel.com / housekeeping123");
  console.log("     - Front Desk:   frontdesk@hotel.com / frontdesk123\n");

  return {
    adminUser,
    hotelManagerUser,
    supervisorUser,
    accountantUser,
    housekeepingUser,
    frontDeskUser,
  };
}
