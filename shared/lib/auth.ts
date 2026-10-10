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
import { Role } from "@prisma/client";
import { EmailNotVerifiedError } from "./auth-errors";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  pages: {
    signIn: "/sign-in",
  },
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
          emailVerified: true,
        });

        const userDb = await userRepository.findUserByEmail(
          email,
          selectData,
          prisma,
        );

        if (!userDb) {
          return null;
        }

        if (!userDb.emailVerified) {
          throw new EmailNotVerifiedError();
        }

        const isPwValid = await bcrypt.compare(password, userDb.password);

        if (!isPwValid) return null;

        // Never leak the password hash into the JWT / session.
        const { password: _passwordHash, ...safeUser } = userDb;
        void _passwordHash;
        return safeUser;
      },
    }),
  ],
  callbacks: {
    authorized: async ({ auth, request }) => {
      const pathname = request.nextUrl.pathname;

      // NextAuth's own routes must stay reachable.
      if (pathname.startsWith("/api/auth")) return true;

      const isAuthPage =
        pathname === "/sign-in" ||
        pathname.startsWith("/users/email-otps") ||
        pathname.startsWith("/users/password-otps");

      const isProtectedRoute =
        pathname === "/dashboard" ||
        pathname.startsWith("/dashboard/") ||
        pathname.startsWith("/inventory");

      if (isAuthPage) {
        // Authenticated users don't need the sign-in form.
        if (auth?.user && pathname === "/sign-in") {
          return Response.redirect(new URL("/dashboard", request.nextUrl));
        }
        return true;
      }

      if (isProtectedRoute) {
        if (!auth?.user) {
          const signInUrl = new URL("/sign-in", request.nextUrl);
          signInUrl.searchParams.set(
            "callbackUrl",
            request.nextUrl.pathname + request.nextUrl.search,
          );
          return Response.redirect(signInUrl);
        }
        return true;
      }

      return true;
    },
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
      if (token.id) session.user.id = token.id as string;
      if (typeof token.name === "string") session.user.name = token.name;
      if (typeof token.email === "string") session.user.email = token.email;
      session.user.image =
        typeof token.image === "string" ? token.image : null;
      if (token.role) session.user.role = token.role as Role;

      return session;
    },
  },
});

declare module "next-auth" {
  interface User {
    role: Role;
  }

  export interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image: string | null;
      role: Role;
    } & DefaultSession["user"];
  }
}
