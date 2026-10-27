"use client";

import { useEffect, useState } from "react";
import {
  CATEGORY_LABELS, DIFFICULTY_LABELS, STATUSES, STATUS_LABELS, type Status,
} from "@/lib/challenge";
import ChallengeForm, { type ChallengeRecord } from "@/components/ChallengeForm";

type LoadState = "loading" | "ready" | "error";

async function readError(res: Response): Promise<string> {
  const data = await res.json().catch(() => null);
  return data?.error?.message ?? "Something went wrong. Try again.";
}

export default function ChallengesClient() {
  const [items, setItems] = useState<ChallengeRecord[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [status, setStatus] = useState<"" | Status>("");
  const [q, setQ] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Load (and reload) whenever filters change; small delay so typing doesn't spam the API.
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setState("loading");
      try {
        const params = new URLSearchParams();
        if (status) params.set("status", status);
        if (q.trim()) params.set("q", q.trim());
        const res = await fetch(`/api/challenges?${params.toString()}`, { signal: controller.signal });
        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
        if (!res.ok) throw new Error("bad response");
        const data = await res.json();
        setItems(data.items);
        setState("ready");
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setState("error");
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [status, q, reloadKey]);

  async function changeStatus(item: ChallengeRecord, next: Status) {
    setActionError(null);
    try {
      const res = await fetch(`/api/challenges/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        setActionError(await readError(res));
        return;
      }
      const updated: ChallengeRecord = await res.json();
      setItems((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } catch {
      setActionError("Network error. Check your connection and try again.");
    }
  }

  async function remove(item: ChallengeRecord) {
    if (!window.confirm(`Delete "${item.title}"? This can't be undone.`)) return;
    setActionError(null);
    try {
      const res = await fetch(`/api/challenges/${item.id}`, { method: "DELETE" });
      if (!res.ok) {
        setActionError(await readError(res));
        return;
      }
      setItems((prev) => prev.filter((c) => c.id !== item.id));
    } catch {
      setActionError("Network error. Check your connection and try again.");
    }
  }

  const filtering = Boolean(status || q.trim());

  return (
    <div className="stack">
      <div className="toolbar">
        <div className="toolbar-filters">
          <input
            className="input"
            placeholder="Search titles..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search challenges"
          />
          <select
            className="input"
            value={status}
            onChange={(e) => setStatus(e.target.value as "" | Status)}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
        {!showForm && (
          <button className="btn btn-sm" onClick={() => setShowForm(true)}>+ Add challenge</button>
        )}
      </div>

      {showForm && (
        <ChallengeForm
          onCancel={() => setShowForm(false)}
          onCreated={(created) => {
            setShowForm(false);
            // Re-fetch so the new item respects the current filters and ordering.
            setItems((prev) => [created, ...prev]);
            setReloadKey((k) => k + 1);
          }}
        />
      )}

      {actionError && <p className="terminal-error" role="alert">&gt; {actionError}</p>}

      {state === "loading" && <p className="muted" aria-busy="true">&gt; loading challenges...</p>}

      {state === "error" && (
        <div className="card">
          <p className="terminal-error" role="alert">&gt; Couldn&apos;t load your challenges.</p>
          <button className="btn btn-ghost btn-sm" onClick={() => setReloadKey((k) => k + 1)}>Retry</button>
        </div>
      )}

      {state === "ready" && items.length === 0 && (
        <div className="empty">
          {filtering ? (
            <p>No challenges match your filters.</p>
          ) : (
            <>
              <p>No challenges logged yet.</p>
              <p className="muted small">Add the first one you&apos;re working on or just solved.</p>
            </>
          )}
        </div>
      )}

      {state === "ready" && items.length > 0 && (
        <ul className="challenge-list">
          {items.map((c) => (
            <li key={c.id} className="challenge">
              <div className="row-between">
                <div>
                  {c.url ? (
                    <a href={c.url} target="_blank" rel="noopener noreferrer" className="challenge-title">{c.title}</a>
                  ) : (
                    <span className="challenge-title">{c.title}</span>
                  )}
                  <div className="tags">
                    {c.platform && <span className="tag">{c.platform}</span>}
                    <span className="tag">{CATEGORY_LABELS[c.category]}</span>
                    <span className={`tag diff-${c.difficulty}`}>{DIFFICULTY_LABELS[c.difficulty]}</span>
                    {c.points !== null && <span className="tag tag-points">{c.points} pts</span>}
                  </div>
                </div>
                <div className="row-actions">
                  <select
                    className={`input status-${c.status}`}
                    value={c.status}
                    onChange={(e) => changeStatus(c, e.target.value as Status)}
                    aria-label={`Status for ${c.title}`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                  <button className="btn btn-ghost btn-sm btn-danger" onClick={() => remove(c)}>Delete</button>
                </div>
              </div>
              {c.notes && <p className="muted small notes">{c.notes}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
