import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "vs_session_token";
const VALID_ROLES = new Set(["ADMIN", "SALES", "ACCOUNTS", "WAREHOUSE", "DISPATCH", "BUYER"]);
const PUBLIC_API_PATHS = new Set([
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/session",
]);

type SessionPayload = {
  userId: string;
  name: string;
  email: string;
  role: string;
  expiresAt: number;
};

function decodeBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function readValidSession(token: string, secret: string): Promise<SessionPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [encodedPayload, encodedSignature] = parts;
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const validSignature = await crypto.subtle.verify(
      "HMAC",
      key,
      decodeBase64Url(encodedSignature),
      new TextEncoder().encode(encodedPayload)
    );
    if (!validSignature) return null;

    const payload = JSON.parse(new TextDecoder().decode(decodeBase64Url(encodedPayload))) as SessionPayload;
    if (
      !payload ||
      typeof payload.userId !== "string" ||
      typeof payload.name !== "string" ||
      typeof payload.email !== "string" ||
      !VALID_ROLES.has(payload.role) ||
      !Number.isFinite(payload.expiresAt) ||
      payload.expiresAt <= Date.now() ||
      payload.expiresAt > Date.now() + 8 * 24 * 60 * 60 * 1000
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function requiredRoles(pathname: string, method: string): string[] | null {
  if (method === "POST" && pathname === "/api/settings") return ["ADMIN"];
  if (method === "POST" && /^\/api\/invoices\/[^/]+\/payment\/?$/.test(pathname)) return ["ADMIN", "ACCOUNTS"];
  if (method === "POST" && pathname === "/api/invoices") return ["ADMIN", "ACCOUNTS"];
  if (method === "POST" && pathname === "/api/payments/verify") return ["ADMIN", "ACCOUNTS"];
  if (method === "POST" && pathname === "/api/payments/create-intent") return ["ADMIN", "SALES", "ACCOUNTS"];
  if (method === "POST" && pathname === "/api/orders") return ["ADMIN", "SALES"];
  if (method === "POST" && pathname === "/api/purchase/receive") return ["ADMIN", "WAREHOUSE"];
  if (method === "POST" && pathname === "/api/inventory/adjustments") return ["ADMIN", "WAREHOUSE"];
  if (method === "POST" && /^\/api\/returns\/[^/]+\/approve\/?$/.test(pathname)) return ["ADMIN", "WAREHOUSE"];
  if (method === "PATCH" && /^\/api\/orders\/[^/]+\/?$/.test(pathname)) return ["ADMIN", "SALES", "WAREHOUSE", "DISPATCH"];
  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api/");

  if (PUBLIC_API_PATHS.has(pathname)) return NextResponse.next();

  // Only the storefront landing page is public until a buyer-account flow exists.
  // Cart, checkout, payment, and every internal workspace route require a valid staff session.
  if (!isApi && (pathname === "/" || pathname === "/shop" || pathname === "/login")) {
    return NextResponse.next();
  }

  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    if (isApi) {
      return NextResponse.json(
        { success: false, error: "Authentication is unavailable: configure a strong SESSION_SECRET (at least 32 characters)." },
        { status: 503 }
      );
    }
    const loginUrl = new URL("/login?reason=auth-config", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const cookieToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
  const session = await readValidSession(cookieToken || bearerToken || "", secret);

  if (!session) {
    if (isApi) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: an active staff session is required." },
        { status: 401 }
      );
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const allowedRoles = requiredRoles(pathname, request.method.toUpperCase());
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    if (isApi) {
      return NextResponse.json(
        { success: false, error: "Forbidden: your role is not permitted to perform this action." },
        { status: 403 }
      );
    }
    return NextResponse.redirect(new URL("/dashboard?error=forbidden", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
