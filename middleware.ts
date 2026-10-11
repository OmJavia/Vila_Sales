import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Allow Next internals, images, and public static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/manifest.json") ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp)$/)
  ) {
    return NextResponse.next();
  }

  // 2. Allow public endpoints
  if (
    pathname === "/" ||
    pathname.startsWith("/shop") ||
    pathname.startsWith("/login") ||
    pathname === "/api/auth/login" ||
    pathname === "/api/auth/session" ||
    pathname === "/api/auth/logout" ||
    pathname.startsWith("/api/notifications") ||
    pathname === "/api/payments/verify" ||
    pathname === "/api/payments/create-intent"
  ) {
    return NextResponse.next();
  }

  // 3. Inspect session token cookie
  const token = req.cookies.get("vs_session_token")?.value;
  const authHeader = req.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const activeToken = token || bearerToken;

  if (!activeToken) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Active session required" },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Basic format and expiry check
  const parts = activeToken.split(".");
  if (parts.length !== 2) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Malformed session token" },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const base64 = parts[0].replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = atob(base64);
    const payload = JSON.parse(jsonStr);

    if (!payload.expiresAt || payload.expiresAt < Date.now()) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { success: false, error: "Unauthorized: Session expired" },
          { status: 401 }
        );
      }
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  } catch {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid session token" },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except Next static files
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
