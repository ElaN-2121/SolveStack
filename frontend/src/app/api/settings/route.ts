import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { apiError } from "@/lib/api-error";
import { parseSettingsInput } from "@/lib/settings";

export const dynamic = "force-dynamic";

const select = { timezone: true, reminderEnabled: true, reminderHour: true } as const;

// GET /api/settings -> { timezone, reminderEnabled, reminderHour }
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return apiError(401, "unauthorized", "Sign in first.");

  try {
    const settings = await prisma.user.findUnique({ where: { id: user.id }, select });
    if (!settings) return apiError(401, "unauthorized", "Sign in first.");
    return NextResponse.json(settings);
  } catch (e) {
    console.error("GET /api/settings failed", e);
    return apiError(500, "internal", "Something went wrong. Try again.");
  }
}

// PATCH /api/settings with any of { timezone, reminderEnabled, reminderHour }
export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return apiError(401, "unauthorized", "Sign in first.");

  const body = await req.json().catch(() => null);
  const parsed = parseSettingsInput(body);
  if (!parsed.ok) return apiError(400, "invalid_input", parsed.message);

  try {
    const updated = await prisma.user.update({ where: { id: user.id }, data: parsed.data, select });
    return NextResponse.json(updated);
  } catch (e) {
    console.error("PATCH /api/settings failed", e);
    return apiError(500, "internal", "Something went wrong. Try again.");
  }
}
