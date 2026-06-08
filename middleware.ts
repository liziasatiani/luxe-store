import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const PROTECTED = ["/account"];
const ADMIN_ONLY = ["/admin"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  if (ADMIN_ONLY.some(p => pathname.startsWith(p))) {
    if (!session?.user) {
      return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, req.url));
    }
    const role = (session.user as { role?: string }).role;
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (PROTECTED.some(p => pathname.startsWith(p))) {
    if (!session?.user) {
      return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
