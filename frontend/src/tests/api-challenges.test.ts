import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/session", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    challenge: {
      findMany: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { GET, POST } from "@/app/api/challenges/route";
import { GET as GET_ONE, PATCH, DELETE } from "@/app/api/challenges/[id]/route";

const mockedUser = vi.mocked(getCurrentUser);
const db = vi.mocked(prisma.challenge, true);

const me = { id: "u1", handle: "elan", name: "E", email: "e@x.com", image: null, createdAt: new Date() };
const json = (method: string, body?: unknown) =>
  new Request("http://localhost/api/challenges", {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
const ctx = { params: Promise.resolve({ id: "c1" }) };

beforeEach(() => {
  vi.clearAllMocks();
  mockedUser.mockResolvedValue(me);
});

describe("auth", () => {
  it("returns 401 on every route when logged out", async () => {
    mockedUser.mockResolvedValue(null);
    expect((await GET(json("GET"))).status).toBe(401);
    expect((await POST(json("POST", { title: "x" }))).status).toBe(401);
    expect((await GET_ONE(json("GET"), ctx)).status).toBe(401);
    expect((await PATCH(json("PATCH", { status: "SOLVED" }), ctx)).status).toBe(401);
    expect((await DELETE(json("DELETE"), ctx)).status).toBe(401);
  });
});

describe("GET /api/challenges", () => {
  it("only queries the signed-in user's challenges", async () => {
    db.findMany.mockResolvedValue([] as never);
    const res = await GET(new Request("http://localhost/api/challenges?status=SOLVED&q=sql"));
    expect(res.status).toBe(200);
    expect(db.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "u1", status: "SOLVED", title: { contains: "sql", mode: "insensitive" } },
      })
    );
    expect(await res.json()).toEqual({ items: [], total: 0 });
  });

  it("rejects unknown filters", async () => {
    const res = await GET(new Request("http://localhost/api/challenges?status=NOPE"));
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("invalid_input");
  });
});

describe("POST /api/challenges", () => {
  it("returns 400 without a title", async () => {
    expect((await POST(json("POST", {}))).status).toBe(400);
  });

  it("creates with the userId from the session, ignoring the body", async () => {
    db.create.mockResolvedValue({ id: "c1" } as never);
    const res = await POST(json("POST", { title: "Cookies", userId: "evil" }));
    expect(res.status).toBe(201);
    const arg = db.create.mock.calls[0][0] as { data: { userId: string; solvedAt: Date | null } };
    expect(arg.data.userId).toBe("u1");
    expect(arg.data.solvedAt).toBeNull();
  });

  it("stamps solvedAt when created as SOLVED", async () => {
    db.create.mockResolvedValue({ id: "c1" } as never);
    await POST(json("POST", { title: "Cookies", status: "SOLVED" }));
    const arg = db.create.mock.calls[0][0] as { data: { solvedAt: Date | null } };
    expect(arg.data.solvedAt).toBeInstanceOf(Date);
  });
});

describe("/api/challenges/[id]", () => {
  it("GET returns 404 when the challenge isn't the user's", async () => {
    db.findFirst.mockResolvedValue(null as never);
    const res = await GET_ONE(json("GET"), ctx);
    expect(res.status).toBe(404);
    expect(db.findFirst).toHaveBeenCalledWith({ where: { id: "c1", userId: "u1" } });
  });

  it("PATCH sets solvedAt when moving to SOLVED", async () => {
    db.findFirst.mockResolvedValue({ id: "c1", status: "TODO" } as never);
    db.update.mockResolvedValue({ id: "c1", status: "SOLVED" } as never);
    const res = await PATCH(json("PATCH", { status: "SOLVED" }), ctx);
    expect(res.status).toBe(200);
    const arg = db.update.mock.calls[0][0] as { data: { solvedAt?: Date | null } };
    expect(arg.data.solvedAt).toBeInstanceOf(Date);
  });

  it("PATCH clears solvedAt when moving away from SOLVED", async () => {
    db.findFirst.mockResolvedValue({ id: "c1", status: "SOLVED" } as never);
    db.update.mockResolvedValue({ id: "c1", status: "TODO" } as never);
    await PATCH(json("PATCH", { status: "TODO" }), ctx);
    const arg = db.update.mock.calls[0][0] as { data: { solvedAt?: Date | null } };
    expect(arg.data.solvedAt).toBeNull();
  });

  it("PATCH returns 404 for a missing challenge and 400 for an empty body", async () => {
    db.findFirst.mockResolvedValue(null as never);
    expect((await PATCH(json("PATCH", { status: "SOLVED" }), ctx)).status).toBe(404);
    db.findFirst.mockResolvedValue({ id: "c1", status: "TODO" } as never);
    expect((await PATCH(json("PATCH", {}), ctx)).status).toBe(400);
  });

  it("DELETE returns 404 when nothing was deleted and 204 when it was", async () => {
    db.deleteMany.mockResolvedValue({ count: 0 } as never);
    expect((await DELETE(json("DELETE"), ctx)).status).toBe(404);
    db.deleteMany.mockResolvedValue({ count: 1 } as never);
    expect((await DELETE(json("DELETE"), ctx)).status).toBe(204);
    expect(db.deleteMany).toHaveBeenLastCalledWith({ where: { id: "c1", userId: "u1" } });
  });
});
