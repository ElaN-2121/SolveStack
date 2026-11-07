import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/session", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: { pushSubscription: { findUnique: vi.fn(), count: vi.fn(), upsert: vi.fn(), deleteMany: vi.fn() } },
}));
vi.mock("@/lib/push", () => ({ sendPushToUser: vi.fn() }));

import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { sendPushToUser } from "@/lib/push";
import { POST as SUBSCRIBE, DELETE as UNSUBSCRIBE } from "@/app/api/push/subscribe/route";
import { POST as TEST } from "@/app/api/push/test/route";

const mockedUser = vi.mocked(getCurrentUser);
const mockedSend = vi.mocked(sendPushToUser);
const db = vi.mocked(prisma.pushSubscription, true);

const me = { id: "u1", handle: "elan", name: "E", email: "e@x.com", image: null, createdAt: new Date() };
const sub = { endpoint: "https://push.example/abc", keys: { p256dh: "pk", auth: "au" } };
const req = (method: string, body?: unknown) =>
  new Request("http://localhost/api/push/subscribe", {
    method,
    headers: { "Content-Type": "application/json", "user-agent": "TestBrowser/1.0" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

beforeEach(() => {
  vi.clearAllMocks();
  mockedUser.mockResolvedValue(me);
});

describe("auth", () => {
  it("returns 401 on every push route when logged out", async () => {
    mockedUser.mockResolvedValue(null);
    expect((await SUBSCRIBE(req("POST", sub))).status).toBe(401);
    expect((await UNSUBSCRIBE(req("DELETE", { endpoint: sub.endpoint }))).status).toBe(401);
    expect((await TEST()).status).toBe(401);
  });
});

describe("POST /api/push/subscribe", () => {
  it("rejects invalid subscriptions", async () => {
    const res = await SUBSCRIBE(req("POST", { endpoint: "nope" }));
    expect(res.status).toBe(400);
    expect(db.upsert).not.toHaveBeenCalled();
  });

  it("saves a new device for the signed-in user", async () => {
    db.findUnique.mockResolvedValue(null as never);
    db.count.mockResolvedValue(0 as never);
    const res = await SUBSCRIBE(req("POST", sub));
    expect(res.status).toBe(201);
    expect(db.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { endpoint: sub.endpoint },
        create: expect.objectContaining({ userId: "u1", p256dh: "pk", auth: "au", userAgent: "TestBrowser/1.0" }),
      })
    );
  });

  it("refuses a new device once the user has too many", async () => {
    db.findUnique.mockResolvedValue(null as never);
    db.count.mockResolvedValue(10 as never);
    const res = await SUBSCRIBE(req("POST", sub));
    expect(res.status).toBe(400);
    expect(db.upsert).not.toHaveBeenCalled();
  });

  it("lets an already-registered device re-subscribe even at the limit", async () => {
    db.findUnique.mockResolvedValue({ id: "s1" } as never);
    const res = await SUBSCRIBE(req("POST", sub));
    expect(res.status).toBe(201);
    expect(db.count).not.toHaveBeenCalled();
  });
});

describe("DELETE /api/push/subscribe", () => {
  it("only deletes the signed-in user's subscription", async () => {
    const res = await UNSUBSCRIBE(req("DELETE", { endpoint: sub.endpoint }));
    expect(res.status).toBe(204);
    expect(db.deleteMany).toHaveBeenCalledWith({ where: { endpoint: sub.endpoint, userId: "u1" } });
  });

  it("rejects a missing endpoint", async () => {
    expect((await UNSUBSCRIBE(req("DELETE", {}))).status).toBe(400);
  });
});

describe("POST /api/push/test", () => {
  it("returns 503 when the server has no VAPID keys", async () => {
    mockedSend.mockResolvedValue({ configured: false, sent: 0, failed: 0, removed: 0 });
    expect((await TEST()).status).toBe(503);
  });

  it("returns the send counts", async () => {
    mockedSend.mockResolvedValue({ configured: true, sent: 1, failed: 0, removed: 0 });
    const res = await TEST();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ sent: 1, failed: 0, removed: 0 });
    expect(mockedSend).toHaveBeenCalledWith("u1", expect.objectContaining({ url: "/dashboard" }));
  });
});
