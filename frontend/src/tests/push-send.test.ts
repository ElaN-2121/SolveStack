import { describe, it, expect, vi, beforeEach } from "vitest";

const sendNotification = vi.fn();
const setVapidDetails = vi.fn();
vi.mock("web-push", () => ({ default: { sendNotification, setVapidDetails } }));

const findMany = vi.fn();
const deleteMany = vi.fn();
vi.mock("@/lib/prisma", () => ({ prisma: { pushSubscription: { findMany, deleteMany } } }));

const subs = [
  { id: "s1", endpoint: "https://push.example/1", p256dh: "k1", auth: "a1" },
  { id: "s2", endpoint: "https://push.example/2", p256dh: "k2", auth: "a2" },
];
const payload = { title: "Hi", body: "There" };

async function load() {
  vi.resetModules(); // push.ts remembers whether it has been configured
  return (await import("@/lib/push")).sendPushToUser;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("sendPushToUser", () => {
  it("reports not configured when VAPID env vars are missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_VAPID_PUBLIC_KEY", "");
    vi.stubEnv("VAPID_PRIVATE_KEY", "");
    vi.stubEnv("VAPID_SUBJECT", "");
    const send = await load();
    expect(await send("u1", payload)).toEqual({ configured: false, sent: 0, failed: 0, removed: 0 });
    expect(findMany).not.toHaveBeenCalled();
  });

  describe("when configured", () => {
    beforeEach(() => {
      vi.stubEnv("NEXT_PUBLIC_VAPID_PUBLIC_KEY", "pub");
      vi.stubEnv("VAPID_PRIVATE_KEY", "priv");
      vi.stubEnv("VAPID_SUBJECT", "mailto:me@example.com");
    });

    it("sends to every device the user has", async () => {
      findMany.mockResolvedValue(subs);
      sendNotification.mockResolvedValue({});
      const send = await load();
      const result = await send("u1", payload);
      expect(result).toEqual({ configured: true, sent: 2, failed: 0, removed: 0 });
      expect(findMany).toHaveBeenCalledWith({ where: { userId: "u1" } });
      expect(sendNotification).toHaveBeenCalledTimes(2);
    });

    it("deletes subscriptions the push service reports as gone (404/410)", async () => {
      findMany.mockResolvedValue(subs);
      sendNotification.mockResolvedValueOnce({}).mockRejectedValueOnce({ statusCode: 410 });
      const send = await load();
      const result = await send("u1", payload);
      expect(result).toMatchObject({ sent: 1, removed: 1, failed: 0 });
      expect(deleteMany).toHaveBeenCalledWith({ where: { id: { in: ["s2"] } } });
    });

    it("counts other errors as failed and keeps the subscription", async () => {
      findMany.mockResolvedValue([subs[0]]);
      sendNotification.mockRejectedValue({ statusCode: 500 });
      vi.spyOn(console, "error").mockImplementation(() => {});
      const send = await load();
      expect(await send("u1", payload)).toMatchObject({ sent: 0, failed: 1, removed: 0 });
      expect(deleteMany).not.toHaveBeenCalled();
    });
  });
});
