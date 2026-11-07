import webpush from "web-push";
import { prisma } from "@/lib/prisma";

export type PushPayload = { title: string; body: string; url?: string; tag?: string };
export type PushResult = { configured: boolean; sent: number; failed: number; removed: number };

let configured = false;

/** Reads the VAPID env vars once. Returns false when push isn't set up on this server. */
function configure(): boolean {
  if (configured) return true;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) return false;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

/** Sends a notification to every device the user has enabled, and prunes dead subscriptions. */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<PushResult> {
  if (!configure()) return { configured: false, sent: 0, failed: 0, removed: 0 };

  const subscriptions = await prisma.pushSubscription.findMany({ where: { userId } });
  let sent = 0;
  let failed = 0;
  const dead: string[] = [];

  await Promise.all(
    subscriptions.map(async (s: { id: string; endpoint: string; p256dh: string; auth: string }) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify(payload),
          { TTL: 60 * 60 }
        );
        sent++;
      } catch (e) {
        const status = (e as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          dead.push(s.id); // the browser says this subscription is gone for good
        } else {
          failed++;
          console.error("Push send failed", status ?? e);
        }
      }
    })
  );

  if (dead.length > 0) {
    await prisma.pushSubscription.deleteMany({ where: { id: { in: dead } } });
  }
  return { configured: true, sent, failed, removed: dead.length };
}
