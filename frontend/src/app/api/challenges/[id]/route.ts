import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { apiError } from "@/lib/api-error";
import { parseChallengeInput, type ChallengeInput } from "@/lib/challenge";

export const dynamic = "force-dynamic";

// `params` is a plain object in Next 14 and a Promise in Next 15+; awaiting handles both.
type Ctx = { params: Promise<{ id: string }> | { id: string } };

const notFound = () => apiError(404, "not_found", "Challenge not found.");

export async function GET(_req: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user) return apiError(401, "unauthorized", "Sign in first.");
  const { id } = await ctx.params;

  // Scoping by userId means other people's challenges look like they don't exist.
  const challenge = await prisma.challenge.findFirst({ where: { id, userId: user.id } });
  if (!challenge) return notFound();
  return NextResponse.json(challenge);
}

export async function PATCH(req: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user) return apiError(401, "unauthorized", "Sign in first.");
  const { id } = await ctx.params;

  const existing = await prisma.challenge.findFirst({ where: { id, userId: user.id } });
  if (!existing) return notFound();

  const body = await req.json().catch(() => null);
  const parsed = parseChallengeInput(body, "update");
  if (!parsed.ok) return apiError(400, "invalid_input", parsed.message);

  const data: ChallengeInput & { solvedAt?: Date | null } = { ...parsed.data };
  // Keep solvedAt in sync with status changes.
  if (parsed.data.status && parsed.data.status !== existing.status) {
    data.solvedAt = parsed.data.status === "SOLVED" ? new Date() : null;
  }

  try {
    const updated = await prisma.challenge.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (e) {
    console.error("PATCH /api/challenges/[id] failed", e);
    return apiError(500, "internal", "Something went wrong. Try again.");
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user) return apiError(401, "unauthorized", "Sign in first.");
  const { id } = await ctx.params;

  const result = await prisma.challenge.deleteMany({ where: { id, userId: user.id } });
  if (result.count === 0) return notFound();
  return new NextResponse(null, { status: 204 });
}
