import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { apiError } from "@/lib/api-error";
import { isValidHandle, normalizeHandle } from "@/lib/handle";

export const dynamic = "force-dynamic";

const select = {
  id: true,
  handle: true,
  name: true,
  email: true,
  image: true,
  createdAt: true,
} as const;

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return apiError(401, "unauthorized", "Sign in first.");

  return NextResponse.json({ ...user, onboarded: Boolean(user.handle) });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return apiError(401, "unauthorized", "Sign in first.");

  const body = await req.json().catch(() => null);
  const handle = normalizeHandle(body?.handle);

  if (!isValidHandle(handle)) {
    return apiError(
      400,
      "invalid_handle",
      "Handle must be 3-20 characters: lowercase letters, numbers or underscore."
    );
  }

  try {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { handle },
      select,
    });
    return NextResponse.json({ ...updated, onboarded: true });
  } catch (e) {
    // P2002 = unique constraint violation (handle already taken)
    if ((e as { code?: string })?.code === "P2002") {
      return apiError(409, "handle_taken", "That handle is already in use.");
    }
    console.error("PATCH /api/me failed", e);
    return apiError(500, "internal", "Something went wrong. Try again.");
  }
}
