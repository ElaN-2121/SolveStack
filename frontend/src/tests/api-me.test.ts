import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/session", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { user: { update: vi.fn() } } }));

import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { GET, PATCH } from "@/app/api/me/route";

const mockedUser = vi.mocked(getCurrentUser);
const mockedUpdate = vi.mocked(prisma.user.update);

const user = {
  id: "u1",
  handle: null,
  name: "Test",
  email: "t@example.com",
  image: null,
  createdAt: new Date("2026-01-01"),
};

const patch = (body: unknown) =>
  new Request("http://localhost/api/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

beforeEach(() => vi.clearAllMocks());

describe("GET /api/me", () => {
  it("returns 401 when logged out", async () => {
    mockedUser.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
    expect((await res.json()).error.code).toBe("unauthorized");
  });

  it("returns the user with onboarded=false when there is no handle", async () => {
    mockedUser.mockResolvedValue(user);
    const res = await GET();
    expect(res.status).toBe(200);
    expect((await res.json()).onboarded).toBe(false);
  });
});

describe("PATCH /api/me", () => {
  it("returns 401 when logged out", async () => {
    mockedUser.mockResolvedValue(null);
    expect((await PATCH(patch({ handle: "elan" }))).status).toBe(401);
  });

  it("returns 400 for an invalid handle", async () => {
    mockedUser.mockResolvedValue(user);
    const res = await PATCH(patch({ handle: "no spaces!" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("invalid_handle");
  });

  it("saves a valid handle", async () => {
    mockedUser.mockResolvedValue(user);
    mockedUpdate.mockResolvedValue({ ...user, handle: "elan" } as never);
    const res = await PATCH(patch({ handle: "Elan" }));
    expect(res.status).toBe(200);
    expect(mockedUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: { handle: "elan" } })
    );
    expect((await res.json()).onboarded).toBe(true);
  });

  it("returns 409 when the handle is taken", async () => {
    mockedUser.mockResolvedValue(user);
    mockedUpdate.mockRejectedValue({ code: "P2002" });
    const res = await PATCH(patch({ handle: "elan" }));
    expect(res.status).toBe(409);
    expect((await res.json()).error.code).toBe("handle_taken");
  });
});
