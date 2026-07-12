import type { NextAuthConfig } from "next-auth";

// Edge-safe auth config — no Prisma, no bcrypt, no Node.js-only APIs.
// Used by middleware to verify JWT tokens without importing the full auth setup.
export const authConfig = {
  pages: { signIn: "/login", error: "/login" },
  session: { strategy: "jwt" as const },
  providers: [],
  callbacks: {
    jwt({ token }) {
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
