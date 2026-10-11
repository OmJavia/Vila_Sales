/**
 * Vila Sales — Server-Side Authentication & Role-Based Authorization
 * Enforces role permissions on server actions and API handlers.
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { Role, UserAccount } from "./db";

const AUTH_COOKIE_NAME = "vs_session_token";
const VULNERABLE_PUBLIC_SECRET = "vila-sales-secure-production-secret-2026-key-99881";

/**
 * Resolves a cryptographically secure session signing key.
 * Disallows vulnerable hardcoded public secrets.
 */
let memorySecret: string | null = null;
export function getSessionSecret(): string {
  const envSecret = process.env.SESSION_SECRET;
  if (envSecret && envSecret.trim() !== "" && envSecret !== VULNERABLE_PUBLIC_SECRET) {
    return envSecret;
  }

  if (memorySecret) return memorySecret;

  try {
    const secretPath = path.join(process.cwd(), "data", ".session_secret");
    if (fs.existsSync(secretPath)) {
      const stored = fs.readFileSync(secretPath, "utf-8").trim();
      if (stored && stored !== VULNERABLE_PUBLIC_SECRET) {
        memorySecret = stored;
        return stored;
      }
    }
    const generated = crypto.randomBytes(64).toString("hex");
    fs.mkdirSync(path.dirname(secretPath), { recursive: true });
    fs.writeFileSync(secretPath, generated, { encoding: "utf-8", mode: 0o600 });
    memorySecret = generated;
    return generated;
  } catch {
    if (!memorySecret) {
      memorySecret = crypto.randomBytes(64).toString("hex");
    }
    return memorySecret;
  }
}

export interface SessionPayload {
  userId: string;
  name: string;
  email: string;
  role: Role;
  expiresAt: number;
}

/**
 * Hash password using scrypt with random salt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

/**
 * Verify password against stored hash (scrypt or legacy fallback)
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    if (storedHash.includes(":")) {
      const [salt, hash] = storedHash.split(":");
      const derived = crypto.scryptSync(password, salt, 64).toString("hex");
      const hashBuf = Buffer.from(hash, "hex");
      const derivedBuf = Buffer.from(derived, "hex");
      if (hashBuf.length !== derivedBuf.length) return false;
      return crypto.timingSafeEqual(hashBuf, derivedBuf);
    }
    // Plaintext / legacy fallback
    const storedBuf = Buffer.from(storedHash, "utf-8");
    const passBuf = Buffer.from(password, "utf-8");
    if (storedBuf.length !== passBuf.length) return false;
    return crypto.timingSafeEqual(storedBuf, passBuf);
  } catch {
    return false;
  }
}

/**
 * Sign session token using HMAC-SHA256
 */
export function createSessionToken(user: Pick<UserAccount, "id" | "name" | "email" | "role">): string {
  const secret = getSessionSecret();
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
    .createHmac("sha256", secret)
    .update(base64Payload)
    .digest("base64url");

  return `${base64Payload}.${signature}`;
}

/**
 * Verify and parse session token with timing-safe comparison
 */
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [base64Payload, signature] = parts;
    const secret = getSessionSecret();
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(base64Payload)
      .digest("base64url");

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const jsonStr = Buffer.from(base64Payload, "base64url").toString("utf-8");
    const payload: SessionPayload = JSON.parse(jsonStr);

    if (payload.expiresAt < Date.now()) {
      return null; // Expired
    }

    return payload;
  } catch {
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
 * Server guard: requires authentication and matches role.
 * Returns either { session } or { errorResponse }.
 */
export function requireAuth(
  req: NextRequest,
  allowedRoles?: Role[]
): { session: SessionPayload; errorResponse?: never } | { session?: never; errorResponse: NextResponse } {
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
