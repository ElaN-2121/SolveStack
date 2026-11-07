"use client";

import Link from "next/link";
import { useStreak } from "@/components/useStreak";

export default function StreakCard() {
  const { state, reload } = useStreak();

  if (state.status === "loading") {
    return (
      <section className="card" aria-busy="true">
        <h2>Daily streak</h2>
        <p className="muted">&gt; loading streak...</p>
      </section>
    );
  }

  if (state.status === "error") {
    return (
      <section className="card">
        <h2>Daily streak</h2>
        <p className="terminal-error" role="alert">&gt; Couldn&apos;t load your streak.</p>
        <button className="btn btn-ghost btn-sm" onClick={() => reload()}>Retry</button>
      </section>
    );
  }

  const { current, longest, solvedToday } = state.data;
  const message = solvedToday
    ? "✔ You've solved something today. Nice."
    : current > 0
      ? "Solve something today to keep your streak alive."
      : "Solve a challenge to start your streak.";

  return (
    <section className="card">
      <h2>Daily streak</h2>
      <p className="streak-number">
        🔥 {current} <span className="muted small">{current === 1 ? "day" : "days"}</span>
      </p>
      <p className="muted small">Longest: {longest} {longest === 1 ? "day" : "days"}</p>
      <p className={solvedToday ? "msg-ok" : "muted"}>{message}</p>
      <Link href="/challenges" className="btn btn-ghost btn-sm">Log a challenge</Link>
    </section>
  );
}
