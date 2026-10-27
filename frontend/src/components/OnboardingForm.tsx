"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingForm() {
  const router = useRouter();
  const [handle, setHandle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error?.message ?? "Something went wrong. Try again.");
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="stack">
      <label className="field">
        <span className="at">@</span>
        <input
          value={handle}
          onChange={(e) => setHandle(e.target.value.toLowerCase())}
          placeholder="your_handle"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          maxLength={20}
          aria-label="Handle"
          required
        />
      </label>
      <button type="submit" className="btn" disabled={busy || handle.length < 3}>
        {busy ? "Saving..." : "Start mission"}
      </button>
      {error && (
        <p className="terminal-error" role="alert">
          &gt; {error}
        </p>
      )}
    </form>
  );
}
