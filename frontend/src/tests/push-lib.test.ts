import { describe, it, expect } from "vitest";
import { urlBase64ToUint8Array } from "@/lib/push-client";
import { parseEndpointInput, parseSubscriptionInput } from "@/lib/push-input";

describe("urlBase64ToUint8Array", () => {
  it("decodes URL-safe base64 without padding", () => {
    expect(Array.from(urlBase64ToUint8Array("SGVsbG8"))).toEqual([72, 101, 108, 108, 111]); // "Hello"
  });

  it("handles the - and _ characters", () => {
    // standard base64 "+/+/" is "-_-_" in URL-safe form
    expect(Array.from(urlBase64ToUint8Array("-_-_"))).toEqual(Array.from(urlBase64ToUint8Array("-_-_")));
    expect(urlBase64ToUint8Array("-_8").length).toBe(2);
  });
});

describe("parseSubscriptionInput", () => {
  const valid = { endpoint: "https://fcm.googleapis.com/fcm/send/abc", keys: { p256dh: "pk", auth: "au" } };

  it("accepts a browser PushSubscription JSON", () => {
    expect(parseSubscriptionInput({ ...valid, expirationTime: null })).toEqual({
      ok: true,
      data: { endpoint: valid.endpoint, p256dh: "pk", auth: "au" },
    });
  });

  it("rejects missing keys, non-https endpoints and non-objects", () => {
    expect(parseSubscriptionInput({ endpoint: valid.endpoint }).ok).toBe(false);
    expect(parseSubscriptionInput({ ...valid, endpoint: "http://insecure.example/x" }).ok).toBe(false);
    expect(parseSubscriptionInput({ ...valid, keys: { p256dh: "pk" } }).ok).toBe(false);
    expect(parseSubscriptionInput(null).ok).toBe(false);
    expect(parseSubscriptionInput([]).ok).toBe(false);
  });
});

describe("parseEndpointInput", () => {
  it("returns the endpoint or null", () => {
    expect(parseEndpointInput({ endpoint: "https://x.example/1" })).toBe("https://x.example/1");
    expect(parseEndpointInput({})).toBeNull();
    expect(parseEndpointInput(null)).toBeNull();
  });
});
