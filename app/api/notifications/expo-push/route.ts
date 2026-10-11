import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

/**
 * Validates if the token matches Expo push token syntax
 */
function isExpoPushToken(token: string): boolean {
  return (
    typeof token === "string" &&
    (/^(Expo(nent)?PushToken(\[.*\])|[a-zA-Z0-9_-]{22,})$/.test(token) ||
      token.startsWith("ExponentPushToken["))
  );
}

export async function POST(req: NextRequest) {
  const access = requireAuth(req, ["ADMIN"]);
  if ("errorResponse" in access) return access.errorResponse;
  try {
    const body = await req.json();
    const { to, title, body: messageBody, data, sound = "default", priority = "high" } = body;

    if (!to || !title || !messageBody) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: to, title, or body" },
        { status: 400 }
      );
    }

    // A simulated ticket must never be represented as a delivered notification.
    if (!isExpoPushToken(to)) {
      return NextResponse.json(
        { success: false, error: "A valid Expo push token is required; demo tokens are not sent." },
        { status: 400 }
      );
    }

    // Real Expo Push Notification request
    try {
      const response = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to,
          title,
          body: messageBody,
          data: data || {},
          sound,
          priority,
        }),
      });

      const result = await response.json();

      if (result.errors) {
        return NextResponse.json(
          { success: false, error: result.errors[0]?.message || "Expo API error" },
          { status: 502 }
        );
      }

      return NextResponse.json({
        success: true,
        simulated: false,
        ticket: result.data,
      });
    } catch (networkErr: any) {
      return NextResponse.json(
        { success: false, error: "Expo push service is unreachable; no notification was confirmed as delivered." },
        { status: 502 }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
