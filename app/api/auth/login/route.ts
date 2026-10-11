import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/server/db";
import { createSessionToken, AUTH_COOKIE_NAME } from "@/lib/server/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const db = serverDb.read();
    const user = db.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim() && u.isActive
    );

    // Verify password (for demo accounts, check against passwordHash)
    if (!user || user.passwordHash !== password) {
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
      { success: false, error: error.message || "Login failed" },
      { status: 500 }
    );
  }
}
