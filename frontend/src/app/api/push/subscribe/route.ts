import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { apiError } from "@/lib/api-error";
import { MAX_DEVICES, parseEndpointInput, parseSubscriptionInput } from "@/lib/push-input";

export const dynamic = "force-dynamic";

// POST /api/push/subscribe  body: PushSubscription JSON from the browser
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return apiError(401, "unauthorized", "Sign in first.");

  const body = await req.json().catch(() => null);
  const parsed = parseSubscriptionInput(body);
  if (!parsed.ok) return apiError(400, "invalid_input", parsed.message);
  const { endpoint, p256dh, auth } = parsed.data;

  try {
    const existing = await prisma.pushSubscription.findUnique({ where: { endpoint }, select: { id: true } });
    if (!existing) {
      const count = await prisma.pushSubscription.count({ where: { userId: user.id } });
      if (count >= MAX_DEVICES) {
        return apiError(400, "invalid_input", `You can enable up to ${MAX_DEVICES} devices. Disable one first.`);
      }
    }

    const userAgent = req.headers.get("user-agent")?.slice(0, 200) ?? null;
    // If this browser was previously signed in as someone else, the subscription moves to the current user.
    await prisma.pushSubscription.upsert({
      where: { endpoint },
      create: { userId: user.id, endpoint, p256dh, auth, userAgent },
      update: { userId: user.id, p256dh, auth, userAgent },
    });
    return NextResponse.json({ subscribed: true }, { status: 201 });
  } catch (e) {
    console.error("POST /api/push/subscribe failed", e);
    return apiError(500, "internal", "Something went wrong. Try again.");
  }
}

// DELETE /api/push/subscribe  body: { endpoint }
export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return apiError(401, "unauthorized", "Sign in first.");

  const endpoint = parseEndpointInput(await req.json().catch(() => null));
  if (!endpoint) return apiError(400, "invalid_input", "Invalid push endpoint.");

  try {
    await prisma.pushSubscription.deleteMany({ where: { endpoint, userId: user.id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error("DELETE /api/push/subscribe failed", e);
    return apiError(500, "internal", "Something went wrong. Try again.");
  }
}
