import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest, AUTH_COOKIE_NAME } from "@/lib/server/auth";

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      userId: session.userId,
      name: session.name,
      email: session.email,
      role: session.role,
    },
  });
}
