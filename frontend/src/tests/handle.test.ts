import { describe, it, expect } from "vitest";
import { isValidHandle, normalizeHandle } from "@/lib/handle";

describe("handle validation", () => {
  it("accepts lowercase letters, numbers and underscore (3-20 chars)", () => {
    expect(isValidHandle("elan")).toBe(true);
    expect(isValidHandle("ctf_player_01")).toBe(true);
  });

  it("rejects too short, too long, bad characters and reserved names", () => {
    expect(isValidHandle("ab")).toBe(false);
    expect(isValidHandle("a".repeat(21))).toBe(false);
    expect(isValidHandle("has space")).toBe(false);
    expect(isValidHandle("UPPER")).toBe(false);
    expect(isValidHandle("admin")).toBe(false);
  });

  it("normalizes input", () => {
    expect(normalizeHandle("  Elan ")).toBe("elan");
    expect(normalizeHandle(undefined)).toBe("");
  });
});
