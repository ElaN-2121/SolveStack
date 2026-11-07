import { describe, it, expect } from "vitest";
import { computeStreak, dayKey, isValidTimeZone } from "@/lib/streak";

const TZ = "Africa/Addis_Ababa"; // UTC+3, no daylight saving
const at = (iso: string) => new Date(iso);

describe("dayKey", () => {
  it("uses the user's timezone, not UTC", () => {
    // 21:30 UTC on Jan 1 is 00:30 on Jan 2 in Addis Ababa
    expect(dayKey(at("2026-01-01T21:30:00Z"), TZ)).toBe("2026-01-02");
    expect(dayKey(at("2026-01-01T21:30:00Z"), "UTC")).toBe("2026-01-01");
  });
});

describe("computeStreak", () => {
  const now = at("2026-03-10T09:00:00Z"); // March 10, midday in Addis

  it("is empty with no solves", () => {
    expect(computeStreak([], TZ, now)).toEqual({ current: 0, longest: 0, solvedToday: false, lastSolvedOn: null });
  });

  it("counts a solve today as a 1-day streak", () => {
    const r = computeStreak([at("2026-03-10T06:00:00Z")], TZ, now);
    expect(r).toMatchObject({ current: 1, longest: 1, solvedToday: true, lastSolvedOn: "2026-03-10" });
  });

  it("keeps the streak alive when the last solve was yesterday", () => {
    const r = computeStreak([at("2026-03-08T10:00:00Z"), at("2026-03-09T10:00:00Z")], TZ, now);
    expect(r).toMatchObject({ current: 2, solvedToday: false });
  });

  it("resets after a missed day", () => {
    const r = computeStreak([at("2026-03-05T10:00:00Z"), at("2026-03-06T10:00:00Z"), at("2026-03-07T10:00:00Z")], TZ, now);
    expect(r.current).toBe(0);
    expect(r.longest).toBe(3);
  });

  it("counts several solves on one day once", () => {
    const r = computeStreak([at("2026-03-10T05:00:00Z"), at("2026-03-10T07:00:00Z"), at("2026-03-09T07:00:00Z")], TZ, now);
    expect(r).toMatchObject({ current: 2, longest: 2 });
  });

  it("finds the longest run in the past separately from the current one", () => {
    const days = ["2026-02-01", "2026-02-02", "2026-02-03", "2026-02-04", "2026-03-09", "2026-03-10"];
    const r = computeStreak(days.map((d) => at(`${d}T09:00:00Z`)), TZ, now);
    expect(r).toMatchObject({ current: 2, longest: 4 });
  });

  it("assigns a late-night UTC solve to the user's next local day", () => {
    // 21:30 UTC on March 9 is 00:30 on March 10 in Addis: that's "today"
    const r = computeStreak([at("2026-03-09T21:30:00Z")], TZ, now);
    expect(r).toMatchObject({ solvedToday: true, lastSolvedOn: "2026-03-10" });
  });
});

describe("isValidTimeZone", () => {
  it("accepts real zones and rejects junk", () => {
    expect(isValidTimeZone("Africa/Addis_Ababa")).toBe(true);
    expect(isValidTimeZone("UTC")).toBe(true);
    expect(isValidTimeZone("Mars/Olympus")).toBe(false);
    expect(isValidTimeZone("")).toBe(false);
    expect(isValidTimeZone(42)).toBe(false);
  });
});
