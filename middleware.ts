import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Routes that require authentication
const PROTECTED_ROUTES = ["/account", "/checkout", "/wishlist"];
// Routes that require admin
const ADMIN_ROUTES = ["/admin"];
// Routes that redirect if already logged in
const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip static files and API auth routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const session = await auth();
  const isLoggedIn = !!session?.user;
  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(
    (session?.user as { role?: string })?.role ?? ""
  );

  // Redirect logged-in users away from auth pages
  if (AUTH_ROUTES.some(r => pathname.startsWith(r)) && isLoggedIn) {
    const redirect = req.nextUrl.searchParams.get("redirect") ?? "/";
    return NextResponse.redirect(new URL(redirect, req.url));
  }

  // Protect user routes
  if (PROTECTED_ROUTES.some(r => pathname.startsWith(r)) && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protect admin routes
  if (ADMIN_ROUTES.some(r => pathname.startsWith(r))) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Basic rate limiting header (actual limiting would use Upstash Redis)
  const res = NextResponse.next();
  res.headers.set("X-Powered-By", "Luxe Store");
  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
