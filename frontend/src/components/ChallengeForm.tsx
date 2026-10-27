"use client";

import { useState, type FormEvent } from "react";
import {
  CATEGORIES, CATEGORY_LABELS, DIFFICULTIES, DIFFICULTY_LABELS, STATUSES, STATUS_LABELS,
  type Category, type Difficulty, type Status,
} from "@/lib/challenge";

export type ChallengeRecord = {
  id: string;
  title: string;
  platform: string | null;
  category: Category;
  difficulty: Difficulty;
  status: Status;
  points: number | null;
  url: string | null;
  notes: string | null;
  solvedAt: string | null;
  createdAt: string;
};

type Props = {
  onCreated: (challenge: ChallengeRecord) => void;
  onCancel: () => void;
};

export default function ChallengeForm({ onCreated, onCancel }: Props) {
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("");
  const [category, setCategory] = useState<Category>("WEB");
  const [difficulty, setDifficulty] = useState<Difficulty>("EASY");
  const [status, setStatus] = useState<Status>("TODO");
  const [points, setPoints] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          platform: platform || null,
          category,
          difficulty,
          status,
          points: points.trim() === "" ? null : Number(points),
          url: url || null,
          notes: notes || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error?.message ?? "Something went wrong. Try again.");
        return;
      }
      onCreated(await res.json());
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card stack">
      <h2>New challenge</h2>
      <div className="form-grid">
        <label className="span-all">
          <span className="label">Title *</span>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} required />
        </label>
        <label>
          <span className="label">Platform</span>
          <input className="input" value={platform} onChange={(e) => setPlatform(e.target.value)} maxLength={60} placeholder="picoCTF, HackTheBox..." />
        </label>
        <label>
          <span className="label">Points</span>
          <input className="input" type="number" min={0} max={100000} value={points} onChange={(e) => setPoints(e.target.value)} />
        </label>
        <label>
          <span className="label">Category</span>
          <select className="input" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
          </select>
        </label>
        <label>
          <span className="label">Difficulty</span>
          <select className="input" value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}>
            {DIFFICULTIES.map((d) => <option key={d} value={d}>{DIFFICULTY_LABELS[d]}</option>)}
          </select>
        </label>
        <label>
          <span className="label">Status</span>
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value as Status)}>
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
        </label>
        <label>
          <span className="label">Link</span>
          <input className="input" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
        </label>
        <label className="span-all">
          <span className="label">Notes</span>
          <textarea className="input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={5000} />
        </label>
      </div>
      {error && <p className="terminal-error" role="alert">&gt; {error}</p>}
      <div className="row-between">
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-sm" disabled={busy || !title.trim()}>
          {busy ? "Saving..." : "Add challenge"}
        </button>
      </div>
    </form>
  );
}
