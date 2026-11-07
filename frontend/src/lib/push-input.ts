// Validation for push subscription requests (pure, easy to test).

export const MAX_DEVICES = 10;

export type SubscriptionInput = { endpoint: string; p256dh: string; auth: string };
export type SubscriptionParse = { ok: true; data: SubscriptionInput } | { ok: false; message: string };

const isText = (v: unknown, max: number): v is string => typeof v === "string" && v.length > 0 && v.length <= max;

/** Accepts the JSON a browser gives for `PushSubscription.toJSON()`. */
export function parseSubscriptionInput(body: unknown): SubscriptionParse {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, message: "Request body must be a JSON object." };
  }
  const b = body as { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } | null };

  if (!isText(b.endpoint, 2000) || !b.endpoint.startsWith("https://")) {
    return { ok: false, message: "Invalid push endpoint." };
  }
  const keys = b.keys;
  if (!keys || typeof keys !== "object" || !isText(keys.p256dh, 200) || !isText(keys.auth, 200)) {
    return { ok: false, message: "Invalid push keys." };
  }
  return { ok: true, data: { endpoint: b.endpoint, p256dh: keys.p256dh, auth: keys.auth } };
}

export function parseEndpointInput(body: unknown): string | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const endpoint = (body as { endpoint?: unknown }).endpoint;
  return isText(endpoint, 2000) ? endpoint : null;
}
