"use client";

import { useEffect, useState } from "react";
import { isPushSupported, urlBase64ToUint8Array } from "@/lib/push-client";

type PushState = "checking" | "unsupported" | "denied" | "off" | "on";
type Message = { kind: "ok" | "error"; text: string } | null;

// Inlined at build time, so it must exist in the environment before `next build`.
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

async function readError(res: Response): Promise<string> {
  const data = await res.json().catch(() => null);
  return data?.error?.message ?? "Something went wrong. Try again.";
}

function saveSubscription(sub: PushSubscription) {
  return fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sub.toJSON()),
  });
}

export default function PushSettings() {
  const [state, setState] = useState<PushState>("checking");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  // Work out the current state of this device.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isPushSupported()) return setState("unsupported");
      if (Notification.permission === "denied") return setState("denied");
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        const sub = await reg?.pushManager.getSubscription();
        if (cancelled) return;
        if (sub) {
          setState("on");
          saveSubscription(sub).catch(() => {}); // keep the server copy in sync, silently
        } else {
          setState("off");
        }
      } catch {
        if (!cancelled) setState("off");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function enable() {
    setBusy(true);
    setMessage(null);
    try {
      if (!VAPID_PUBLIC_KEY) {
        setMessage({ kind: "error", text: "Push isn't configured yet (missing public key)." });
        return;
      }
      // Must be triggered by this click: browsers ignore permission prompts on page load.
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "off");
        return;
      }
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        }));

      const res = await saveSubscription(sub);
      if (!res.ok) {
        await sub.unsubscribe().catch(() => {});
        setMessage({ kind: "error", text: await readError(res) });
        return;
      }
      setState("on");
      setMessage({ kind: "ok", text: "Notifications are on for this device." });
    } catch {
      setMessage({ kind: "error", text: "Couldn't turn on notifications. Try again." });
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    setMessage(null);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        }).catch(() => {});
        await sub.unsubscribe();
      }
      setState("off");
      setMessage({ kind: "ok", text: "Notifications are off for this device." });
    } catch {
      setMessage({ kind: "error", text: "Couldn't turn off notifications. Try again." });
    } finally {
      setBusy(false);
    }
  }

  async function sendTest() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/push/test", { method: "POST" });
      if (!res.ok) {
        setMessage({ kind: "error", text: await readError(res) });
        return;
      }
      const data: { sent: number } = await res.json();
      setMessage(
        data.sent > 0
          ? { kind: "ok", text: "Test sent. It should appear in a few seconds." }
          : { kind: "error", text: "No active device found. Turn notifications on first." }
      );
    } catch {
      setMessage({ kind: "error", text: "Network error. Check your connection and try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card stack">
      <h2>Notifications on this device</h2>

      {state === "checking" && <p className="muted" aria-busy="true">&gt; checking this device...</p>}

      {state === "unsupported" && (
        <p className="muted small">
          This browser doesn&apos;t support push notifications. On iPhone or iPad, add Solvestack to your
          Home Screen first and open it from there.
        </p>
      )}

      {state === "denied" && (
        <p className="terminal-error" role="alert">
          &gt; Notifications are blocked for this site. Allow them in your browser&apos;s site settings, then reload.
        </p>
      )}

      {state === "off" && (
        <>
          <p className="muted small">Get a daily reminder on this device when you haven&apos;t practiced yet.</p>
          <button className="btn btn-sm" onClick={enable} disabled={busy}>
            {busy ? "Working..." : "Enable notifications"}
          </button>
        </>
      )}

      {state === "on" && (
        <>
          <p className="msg-ok">✔ Notifications are on for this device.</p>
          <div className="row-actions">
            <button className="btn btn-ghost btn-sm" onClick={sendTest} disabled={busy}>
              Send test notification
            </button>
            <button className="btn btn-ghost btn-sm btn-danger" onClick={disable} disabled={busy}>
              Turn off
            </button>
          </div>
        </>
      )}

      {message && (
        <p className={message.kind === "ok" ? "msg-ok" : "terminal-error"} role={message.kind === "ok" ? "status" : "alert"}>
          {message.kind === "error" ? "> " : ""}
          {message.text}
        </p>
      )}
    </section>
  );
}
