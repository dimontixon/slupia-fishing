import type { DefaultSession } from "next-auth";

export type Role = "client" | "admin";

declare module "next-auth" {
  interface User {
    role: Role;
    phone?: string;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      phone?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    phone?: string;
  }
}
