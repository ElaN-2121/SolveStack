import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { apiError } from "@/lib/api-error";
import { sendPushToUser } from "@/lib/push";

export const dynamic = "force-dynamic";

// POST /api/push/test -> sends a test notification to all of the user's devices
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return apiError(401, "unauthorized", "Sign in first.");

  try {
    const result = await sendPushToUser(user.id, {
      title: "Solvestack",
      body: "Test notification: it works! 🔥",
      url: "/dashboard",
      tag: "test",
    });
    if (!result.configured) {
      return apiError(503, "internal", "Push notifications aren't configured on the server yet.");
    }
    return NextResponse.json({ sent: result.sent, failed: result.failed, removed: result.removed });
  } catch (e) {
    console.error("POST /api/push/test failed", e);
    return apiError(500, "internal", "Something went wrong. Try again.");
  }
}
