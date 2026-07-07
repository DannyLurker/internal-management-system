import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import {
  createUserSelect,
  userRepository,
} from "@/features/users/user.repository";
import { signInSchema } from "./zods/auth.zod";
import bcrypt from "bcryptjs";
import prisma from "../db/prisma";
import { Roles } from "@prisma/client";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  providers: [
    Credentials({
      credentials: {
        email: { type: "email", label: "Email" },
        password: { type: "password", label: "Password" },
      },
      authorize: async (credentials) => {
        if (!credentials.email || !credentials.password) {
          return null;
        }

        const { email, password } = await signInSchema.parseAsync(credentials);

        const selectData = createUserSelect({
          id: true,
          name: true,
          email: true,
          password: true,
          image: true,
          role: true,
        });

        const userDb = await userRepository.findUserByEmail(email, selectData);

        if (!userDb) {
          return null;
        }

        const isPwValid = await bcrypt.compare(password, userDb.password);

        if (!isPwValid) return null;

        return userDb;
      },
    }),
  ],
  callbacks: {
    jwt: async ({ user, token, account }) => {
      if (user && account) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
        token.role = user.role;
      }

      return token;
    },
    session: async ({ token, session }) => {
      session.user.id = token.id as string;
      session.user.name = token.name as string;
      session.user.email = token.email as string;
      session.user.image = token.image as string;
      session.user.role = token.role as Roles;

      return session;
    },
  },
});

declare module "next-auth" {
  interface User {
    role: Roles;
  }

  export interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image: string | null;
      role: Roles;
    } & DefaultSession["user"];
  }
}
