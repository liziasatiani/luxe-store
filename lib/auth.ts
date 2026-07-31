import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { normalizeEmail } from "@/lib/utils";
import { rateLimit } from "@/lib/rateLimit";
import type { NextAuthConfig } from "next-auth";

/** bcrypt hash of a value no user can supply; used only to equalise timing. */
const DUMMY_HASH = "$2a$12$C6UzMDM.H6dfI/f/IKcEe.aQjKk8pQ5HrhTiWnJ5Vd1LhoAxKPWTm";

/**
 * Password guessing was completely unthrottled: `/api/auth/[...nextauth]` is
 * excluded from the middleware matcher and never called `rateLimit`, so the
 * credentials provider accepted unlimited attempts. Constant-time comparison
 * (added by the previous audit) is meaningless while an attacker can simply try
 * every password.
 *
 * Keyed by the submitted email rather than by IP: `getIP` reads the
 * client-controlled `x-forwarded-for` header, so an IP key is trivially evaded
 * by rotating that header. The account is the thing worth protecting.
 */
const LOGIN_ATTEMPTS = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (typeof credentials?.email !== "string" || typeof credentials?.password !== "string") {
          return null;
        }

        const emailKey = normalizeEmail(credentials.email);

        const rl = await rateLimit(`login:${emailKey}`, LOGIN_ATTEMPTS, LOGIN_WINDOW_MS);
        if (!rl.allowed) return null;

        const user = await prisma.user.findUnique({
          where: { email: emailKey },
        });

        // Compare against a dummy hash when the account is missing or has no
        // password so the response time does not reveal which emails exist.
        const hash = user?.passwordHash ?? DUMMY_HASH;
        const valid = await bcrypt.compare(credentials.password, hash);

        if (!user || !user.passwordHash || !user.isActive || !valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.isActive = true;
        token.checkedAt = Date.now();
      }

      // Re-verify the account is still active at most every 5 minutes.
      // JWT sessions are stateless, so a deactivated user would otherwise remain
      // valid until the token expires. The check is throttled to avoid a DB
      // round-trip on every single request.
      const RECHECK_MS = 5 * 60 * 1000;
      const checkedAt = token.checkedAt as number | undefined;
      if (token.id && (!checkedAt || Date.now() - checkedAt > RECHECK_MS)) {
        const fresh = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { isActive: true, role: true },
        });
        token.isActive = fresh?.isActive ?? false;
        token.role = fresh?.role ?? token.role;
        token.checkedAt = Date.now();
      }

      return token;
    },
    async session({ session, token }) {
      // Deactivated users get a session with no user object, which causes
      // client-side auth hooks to treat them as signed out.
      if (!token.isActive) {
        return { ...session, user: null as unknown as typeof session.user };
      }
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
