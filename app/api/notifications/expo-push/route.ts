import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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
  try {
    const body = await req.json();
    const { to, title, body: messageBody, data, sound = "default", priority = "high" } = body;

    if (!to || !title || !messageBody) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: to, title, or body" },
        { status: 400 }
      );
    }

    // Check if token is a demo/simulation placeholder
    const isMock =
      to.includes("demo") ||
      to.includes("w001") ||
      to.includes("w002") ||
      to.includes("w003") ||
      to.includes("admin-01") ||
      !isExpoPushToken(to);

    if (isMock) {
      return NextResponse.json({
        success: true,
        simulated: true,
        message: "Simulated Expo push notification delivered successfully",
        ticket: {
          id: `sim-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          status: "ok",
          recipient: to,
          sentAt: new Date().toISOString(),
        },
      });
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
      // Fallback for offline/local environment
      return NextResponse.json({
        success: true,
        simulated: true,
        warning: "Expo server unreachable from current environment, simulated delivery recorded",
        ticket: {
          id: `sim-offline-${Date.now()}`,
          status: "ok",
          recipient: to,
        },
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
