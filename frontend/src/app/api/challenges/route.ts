import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { apiError } from "@/lib/api-error";
import {
  CATEGORIES,
  STATUSES,
  parseChallengeInput,
  type Category,
  type Status,
} from "@/lib/challenge";

export const dynamic = "force-dynamic";

// GET /api/challenges?status=SOLVED&category=WEB&q=sql
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return apiError(401, "unauthorized", "Sign in first.");

  const params = new URL(req.url).searchParams;
  const status = params.get("status");
  const category = params.get("category");
  const q = params.get("q")?.trim();

  const where: {
    userId: string;
    status?: Status;
    category?: Category;
    title?: { contains: string; mode: "insensitive" };
  } = { userId: user.id };

  if (status) {
    if (!(STATUSES as readonly string[]).includes(status)) {
      return apiError(400, "invalid_input", "Unknown status filter.");
    }
    where.status = status as Status;
  }
  if (category) {
    if (!(CATEGORIES as readonly string[]).includes(category)) {
      return apiError(400, "invalid_input", "Unknown category filter.");
    }
    where.category = category as Category;
  }
  if (q) where.title = { contains: q, mode: "insensitive" };

  try {
    // Capped at 200 for now; add pagination when lists get long.
    const items = await prisma.challenge.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return NextResponse.json({ items, total: items.length });
  } catch (e) {
    console.error("GET /api/challenges failed", e);
    return apiError(500, "internal", "Something went wrong. Try again.");
  }
}

// POST /api/challenges
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return apiError(401, "unauthorized", "Sign in first.");

  const body = await req.json().catch(() => null);
  const parsed = parseChallengeInput(body, "create");
  if (!parsed.ok) return apiError(400, "invalid_input", parsed.message);

  const { data } = parsed;
  try {
    const challenge = await prisma.challenge.create({
      data: {
        ...data,
        title: data.title as string,
        userId: user.id, // always from the session, never from the request body
        solvedAt: data.status === "SOLVED" ? new Date() : null,
      },
    });
    return NextResponse.json(challenge, { status: 201 });
  } catch (e) {
    console.error("POST /api/challenges failed", e);
    return apiError(500, "internal", "Something went wrong. Try again.");
  }
}
