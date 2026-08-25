import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { verifyOtp } from "@/lib/otp";
import type { Role } from "@/types/next-auth";

const config: NextAuthConfig = {
  session: { strategy: "jwt" },
  providers: [
    // Client login: phone number + SMS OTP code (see lib/otp.ts).
    Credentials({
      id: "client-otp",
      name: "Telefon",
      credentials: {
        phone: { label: "Telefon", type: "text" },
        code: { label: "Kod", type: "text" },
      },
      async authorize(credentials) {
        const phone = credentials?.phone as string | undefined;
        const code = credentials?.code as string | undefined;
        if (!phone || !code) return null;

        const isValid = await verifyOtp(phone, code);
        if (!isValid) return null;

        const client = await prisma.client.upsert({
          where: { phone },
          update: {},
          create: { phone },
        });
        if (client.isBlocked) return null;

        return { id: client.id, phone: client.phone, role: "client" };
      },
    }),
    // Admin login: separate flow from clients, credentials checked
    // against ADMIN_LOGIN / ADMIN_PASSWORD_HASH in .env (single owner
    // account, no DB table for MVP).
    Credentials({
      id: "admin-credentials",
      name: "Administrator",
      credentials: {
        login: { label: "Login", type: "text" },
        password: { label: "Hasło", type: "password" },
      },
      async authorize(credentials) {
        const login = credentials?.login as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!login || !password) return null;

        const adminLogin = process.env.ADMIN_LOGIN;
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
        if (!adminLogin || !adminPasswordHash) return null;
        if (login !== adminLogin) return null;

        const isValid = await bcrypt.compare(password, adminPasswordHash);
        if (!isValid) return null;

        return { id: "admin", role: "admin" };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
