import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const PROTECTED = ["/account"];
const ADMIN_ONLY = ["/admin"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const loginUrl = (p: string) =>
    new URL(`/login?redirect=${encodeURIComponent(p)}`, req.url);

  if (ADMIN_ONLY.some(p => pathname.startsWith(p))) {
    if (!session?.user) {
      return NextResponse.redirect(loginUrl(pathname));
    }
    const role = (session.user as { role?: string }).role;
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (PROTECTED.some(p => pathname.startsWith(p))) {
    if (!session?.user) {
      return NextResponse.redirect(loginUrl(pathname));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
