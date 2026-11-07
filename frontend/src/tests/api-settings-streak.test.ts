import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/session", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { user: { findUnique: vi.fn(), update: vi.fn() } } }));
vi.mock("@/lib/streak-server", () => ({ getStreakForUser: vi.fn() }));

import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getStreakForUser } from "@/lib/streak-server";
import { GET as GET_STREAK } from "@/app/api/streak/route";
import { GET as GET_SETTINGS, PATCH as PATCH_SETTINGS } from "@/app/api/settings/route";

const mockedUser = vi.mocked(getCurrentUser);
const mockedStreak = vi.mocked(getStreakForUser);
const db = vi.mocked(prisma.user, true);

const me = { id: "u1", handle: "elan", name: "E", email: "e@x.com", image: null, createdAt: new Date() };
const patch = (body: unknown) =>
  new Request("http://localhost/api/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  vi.clearAllMocks();
  mockedUser.mockResolvedValue(me);
});

describe("GET /api/streak", () => {
  it("returns 401 when logged out", async () => {
    mockedUser.mockResolvedValue(null);
    expect((await GET_STREAK()).status).toBe(401);
  });

  it("returns the user's streak", async () => {
    const streak = { current: 3, longest: 5, solvedToday: true, lastSolvedOn: "2026-03-10", timezone: "Africa/Addis_Ababa" };
    mockedStreak.mockResolvedValue(streak);
    const res = await GET_STREAK();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(streak);
    expect(mockedStreak).toHaveBeenCalledWith("u1");
  });

  it("returns 500 with the standard error shape when the lookup fails", async () => {
    mockedStreak.mockRejectedValue(new Error("db down"));
    const res = await GET_STREAK();
    expect(res.status).toBe(500);
    expect((await res.json()).error.code).toBe("internal");
  });
});

describe("/api/settings", () => {
  it("returns 401 when logged out", async () => {
    mockedUser.mockResolvedValue(null);
    expect((await GET_SETTINGS()).status).toBe(401);
    expect((await PATCH_SETTINGS(patch({ reminderHour: 9 }))).status).toBe(401);
  });

  it("GET returns the saved settings", async () => {
    const s = { timezone: "Africa/Addis_Ababa", reminderEnabled: false, reminderHour: 20 };
    db.findUnique.mockResolvedValue(s as never);
    const res = await GET_SETTINGS();
    expect(await res.json()).toEqual(s);
  });

  it("PATCH rejects invalid input with 400", async () => {
    const res = await PATCH_SETTINGS(patch({ timezone: "Mars/Olympus" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("invalid_input");
    expect(db.update).not.toHaveBeenCalled();
  });

  it("PATCH saves valid settings for the signed-in user only", async () => {
    db.update.mockResolvedValue({ timezone: "UTC", reminderEnabled: true, reminderHour: 7 } as never);
    const res = await PATCH_SETTINGS(patch({ timezone: "UTC", reminderEnabled: true, reminderHour: 7, id: "someone-else" }));
    expect(res.status).toBe(200);
    expect(db.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "u1" },
        data: { timezone: "UTC", reminderEnabled: true, reminderHour: 7 },
      })
    );
  });
});
