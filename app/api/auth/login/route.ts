import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/server/db";
import { createSessionToken, verifyPassword, AUTH_COOKIE_NAME } from "@/lib/server/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password || email.length > 254 || password.length > 1024) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const db = serverDb.read();
    const user = db.users.find(
      (u) => u.email.toLowerCase() === email && u.isActive
    );

    // Only modern salted scrypt hashes are accepted; plain-text legacy credentials fail closed.
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = createSessionToken(user);
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
      message: `Welcome back, ${user.name}!`,
    });

    // Set secure cookie
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Login is temporarily unavailable. Check server authentication and storage configuration." },
      { status: 500 }
    );
  }
}
