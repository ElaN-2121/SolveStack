// Pure streak logic (no database, no React): easy to test.
// A day counts when at least one challenge was marked SOLVED on that calendar day
// in the user's own timezone.

export const DEFAULT_TIME_ZONE = "Africa/Addis_Ababa";

export type StreakResult = {
  current: number;
  longest: number;
  solvedToday: boolean;
  lastSolvedOn: string | null; // "YYYY-MM-DD" in the user's timezone
};

export function isValidTimeZone(tz: unknown): tz is string {
  if (typeof tz !== "string" || tz.length === 0) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** "YYYY-MM-DD" for a moment in time, as seen in the given timezone. */
export function dayKey(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function toDayNumber(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86_400_000);
}

export function computeStreak(solvedAt: Date[], timeZone: string, now: Date = new Date()): StreakResult {
  // Unique local days; ISO date strings sort correctly as plain strings.
  const keys = Array.from(new Set(solvedAt.map((d) => dayKey(d, timeZone)))).sort();
  if (keys.length === 0) {
    return { current: 0, longest: 0, solvedToday: false, lastSolvedOn: null };
  }
  const days = keys.map(toDayNumber);

  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    run = days[i] === days[i - 1] + 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }

  const today = toDayNumber(dayKey(now, timeZone));
  const last = days[days.length - 1];
  const solvedToday = last >= today;

  // The streak stays alive until the end of the day after the last solve.
  let current = 0;
  if (last >= today - 1) {
    current = 1;
    for (let i = days.length - 2; i >= 0 && days[i] === days[i + 1] - 1; i--) current++;
  }

  return { current, longest, solvedToday, lastSolvedOn: keys[keys.length - 1] };
}
