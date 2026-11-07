"use client";

import Link from "next/link";
import { useStreak } from "@/components/useStreak";

export default function StreakChip() {
  const { state } = useStreak();
  const ready = state.status === "ready";
  const count = ready ? state.data.current : null;
  const solvedToday = ready && state.data.solvedToday;

  return (
    <Link
      href="/dashboard"
      className={`chip chip-streak${solvedToday ? " chip-streak-on" : ""}`}
      title={solvedToday ? "You've solved something today" : "Solve a challenge today to keep your streak"}
    >
      🔥 {count ?? "–"}
    </Link>
  );
}
