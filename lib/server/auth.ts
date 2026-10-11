/**
 * Vila Sales — Server-Side Authentication & Role-Based Authorization
 * Enforces role permissions on server actions and API handlers.
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Role, UserAccount, serverDb } from "./db";

const AUTH_COOKIE_NAME = "vs_session_token";
const SESSION_SECRET = process.env.SESSION_SECRET || "vila-sales-secure-production-secret-2026-key-99881";

export interface SessionPayload {
  userId: string;
  name: string;
  email: string;
  role: Role;
  expiresAt: number;
}

/**
 * Sign session token using HMAC-SHA256
 */
export function createSessionToken(user: UserAccount): string {
  const payload: SessionPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  const jsonStr = JSON.stringify(payload);
  const base64Payload = Buffer.from(jsonStr).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(base64Payload)
    .digest("base64url");

  return `${base64Payload}.${signature}`;
}

/**
 * Verify and parse session token
 */
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [base64Payload, signature] = parts;
    const expectedSig = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(base64Payload)
      .digest("base64url");

    if (signature !== expectedSig) return null;

    const jsonStr = Buffer.from(base64Payload, "base64url").toString("utf-8");
    const payload: SessionPayload = JSON.parse(jsonStr);

    if (payload.expiresAt < Date.now()) {
      return null; // Expired
    }

    return payload;
  } catch (e) {
    return null;
  }
}

/**
 * Extracts session from NextRequest cookies or Authorization header
 */
export function getSessionFromRequest(req: NextRequest): SessionPayload | null {
  // Check cookie first
  const cookie = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (cookie) {
    const session = verifySessionToken(cookie);
    if (session) return session;
  }

  // Check Bearer authorization header
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    return verifySessionToken(token);
  }

  return null;
}

/**
 * Server guard: requires authentication and matches role
 */
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

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
    return {
      errorResponse: NextResponse.json(
        {
          success: false,
          error: `Forbidden: Role '${session.role}' is not authorized for this action. Required: ${allowedRoles.join(", ")}`,
        },
        { status: 403 }
      ),
    };
  }

  return { session };
}

export { AUTH_COOKIE_NAME };
