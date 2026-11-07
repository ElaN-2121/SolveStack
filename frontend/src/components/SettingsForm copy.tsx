"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { formatHour } from "@/lib/settings";

type Settings = { timezone: string; reminderEnabled: boolean; reminderHour: number };
type LoadState = "loading" | "ready" | "error";

const HOURS = Array.from({ length: 24 }, (_, h) => h);

export default function SettingsForm() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      setLoadState("loading");
      try {
        const res = await fetch("/api/settings", { signal: controller.signal });
        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
        if (!res.ok) throw new Error("bad response");
        setSettings(await res.json());
        setLoadState("ready");
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setLoadState("error");
      }
    })();
    return () => controller.abort();
  }, [reloadKey]);

  const zones = useMemo(() => {
    const list = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : [];
    const all = new Set<string>(list);
    all.add("Africa/Addis_Ababa");
    if (settings?.timezone) all.add(settings.timezone);
    return Array.from(all).sort();
  }, [settings?.timezone]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setMessage({ kind: "error", text: data?.error?.message ?? "Something went wrong. Try again." });
        return;
      }
      setSettings(await res.json());
      window.dispatchEvent(new Event("streak:refresh")); // timezone changes can move "today"
      setMessage({ kind: "ok", text: "Saved." });
    } catch {
      setMessage({ kind: "error", text: "Network error. Check your connection and try again." });
    } finally {
      setSaving(false);
    }
  }

  if (loadState === "loading") return <p className="muted" aria-busy="true">&gt; loading settings...</p>;

  if (loadState === "error" || !settings) {
    return (
      <div className="card">
        <p className="terminal-error" role="alert">&gt; Couldn&apos;t load your settings.</p>
        <button className="btn btn-ghost btn-sm" onClick={() => setReloadKey((k) => k + 1)}>Retry</button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card stack">
      <h2>Daily reminder</h2>

      <label className="check-row">
        <input
          type="checkbox"
          checked={settings.reminderEnabled}
          onChange={(e) => setSettings({ ...settings, reminderEnabled: e.target.checked })}
        />
        <span>Remind me to practice every day</span>
      </label>

      <div className="form-grid">
        <label>
          <span className="label">Reminder time</span>
          <select
            className="input"
            value={settings.reminderHour}
            onChange={(e) => setSettings({ ...settings, reminderHour: Number(e.target.value) })}
          >
            {HOURS.map((h) => (
              <option key={h} value={h}>{formatHour(h)}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">Time zone</span>
          <select
            className="input"
            value={settings.timezone}
            onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
          >
            {zones.map((z) => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => setSettings({ ...settings, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone })}
      >
        Use my device&apos;s time zone
      </button>

      <p className="muted small">
        Your streak counts a day when you mark at least one challenge solved, using this time zone.
        Turn on notifications for each device you want reminders on, in the card below.
      </p>

      {message && (
        <p className={message.kind === "ok" ? "msg-ok" : "terminal-error"} role={message.kind === "ok" ? "status" : "alert"}>
          {message.kind === "error" ? "> " : ""}{message.text}
        </p>
      )}

      <div className="row-between">
        <span />
        <button type="submit" className="btn btn-sm" disabled={saving}>
          {saving ? "Saving..." : "Save settings"}
        </button>
      </div>
    </form>
  );
}
