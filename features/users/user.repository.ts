import prisma from "@/shared/db/prisma";
import { Prisma } from "@prisma/client";

export const createUserWhere = <T extends Prisma.UserWhereInput>(where: T): T =>
  where;

export const createUserWhereUnique = <T extends Prisma.UserWhereUniqueInput>(
  where: T,
): T => where;

export const createUserSelect = <T extends Prisma.UserSelect>(select: T): T =>
  select;

export const userRepository = {
  findUserByEmail: <T extends Prisma.UserSelect>(
    email: string,
    select: Prisma.Subset<T, Prisma.UserSelect>,
  ) => {
    return prisma.user.findUnique({
      where: {
        email,
      },
      select: select,
    });
  },
  findUserById: <T extends Prisma.UserSelect>(
    id: string,
    select: Prisma.Subset<T, Prisma.UserSelect>,
  ) => {
    return prisma.user.findUnique({
      where: {
        id: id,
      },
      select: select,
    });
  },
};
