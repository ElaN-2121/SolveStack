import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getStreakForUser } from "@/lib/streak-server";
import { apiError } from "@/lib/api-error";

export const dynamic = "force-dynamic";

// GET /api/streak -> { current, longest, solvedToday, lastSolvedOn, timezone }
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return apiError(401, "unauthorized", "Sign in first.");

  try {
    return NextResponse.json(await getStreakForUser(user.id));
  } catch (e) {
    console.error("GET /api/streak failed", e);
    return apiError(500, "internal", "Something went wrong. Try again.");
  }
}
