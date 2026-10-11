/**
 * Vila Sales — Server-side session verification and password helpers.
 *
 * Production must configure SESSION_SECRET with a unique random value of at least
 * 32 characters. This module deliberately has no hard-coded fallback secret.
 */
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Role, UserAccount } from "./db";

const AUTH_COOKIE_NAME = "vs_session_token";
const ROLES = new Set<Role>(["ADMIN", "SALES", "ACCOUNTS", "WAREHOUSE", "DISPATCH", "BUYER"]);

export interface SessionPayload {
  userId: string;
  name: string;
  email: string;
  role: Role;
  expiresAt: number;
}

function getSessionSecret(): string | null {
  const secret = process.env.SESSION_SECRET;
  return secret && secret.length >= 32 ? secret : null;
}

export function createSessionToken(user: UserAccount): string {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error("Authentication is not configured: set SESSION_SECRET to a unique random value of at least 32 characters.");
  }

  const payload: SessionPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(base64Payload).digest("base64url");
  return `${base64Payload}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const secret = getSessionSecret();
    if (!secret || typeof token !== "string") return null;

    const parts = token.split(".");
    if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
    const [base64Payload, signature] = parts;
    const expected = crypto.createHmac("sha256", secret).update(base64Payload).digest();
    const actual = Buffer.from(signature, "base64url");
    if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return null;

    const payload = JSON.parse(Buffer.from(base64Payload, "base64url").toString("utf8")) as Partial<SessionPayload>;
    if (
      typeof payload.userId !== "string" || !payload.userId ||
      typeof payload.name !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.role !== "string" || !ROLES.has(payload.role as Role) ||
      typeof payload.expiresAt !== "number" || !Number.isFinite(payload.expiresAt) ||
      payload.expiresAt <= Date.now()
    ) return null;

    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export function getSessionFromRequest(req: NextRequest): SessionPayload | null {
  const cookie = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (cookie) {
    const session = verifySessionToken(cookie);
    if (session) return session;
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return verifySessionToken(authHeader.slice(7));
  }
  return null;
}

/**
 * Password hashes use: scrypt$<32-char-salt-hex>$<128-char-derived-key-hex>.
 * Plain-text legacy/demo passwords are intentionally rejected.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [algorithm, saltHex, expectedHex, extra] = (storedHash || "").split("$");
    if (algorithm !== "scrypt" || extra !== undefined ||
        !/^[a-f0-9]{32}$/i.test(saltHex || "") ||
        !/^[a-f0-9]{128}$/i.test(expectedHex || "")) return false;
    const actual = crypto.scryptSync(password, Buffer.from(saltHex, "hex"), 64);
    const expected = Buffer.from(expectedHex, "hex");
    return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export function requireAuth(
  req: NextRequest,
  allowedRoles?: Role[]
): { session: SessionPayload } | { errorResponse: NextResponse } {
  const session = getSessionFromRequest(req);
  if (!session) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: "Unauthorized: Active session required" },
        { status: 401 }
      ),
    };
  }

  if (allowedRoles?.length && !allowedRoles.includes(session.role)) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: "Forbidden: your role is not authorized for this action" },
        { status: 403 }
      ),
    };
  }
  return { session };
}

export { AUTH_COOKIE_NAME };
