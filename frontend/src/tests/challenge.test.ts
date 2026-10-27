import { describe, it, expect } from "vitest";
import { parseChallengeInput } from "@/lib/challenge";

describe("parseChallengeInput (create)", () => {
  it("accepts a minimal valid body", () => {
    const r = parseChallengeInput({ title: "  Cookies  " }, "create");
    expect(r).toEqual({ ok: true, data: { title: "Cookies" } });
  });

  it("requires a title", () => {
    expect(parseChallengeInput({}, "create").ok).toBe(false);
    expect(parseChallengeInput({ title: "   " }, "create").ok).toBe(false);
  });

  it("rejects bad enums, points and urls", () => {
    expect(parseChallengeInput({ title: "x", category: "NOPE" }, "create").ok).toBe(false);
    expect(parseChallengeInput({ title: "x", difficulty: "easy" }, "create").ok).toBe(false);
    expect(parseChallengeInput({ title: "x", status: "DONE" }, "create").ok).toBe(false);
    expect(parseChallengeInput({ title: "x", points: -5 }, "create").ok).toBe(false);
    expect(parseChallengeInput({ title: "x", points: 1.5 }, "create").ok).toBe(false);
    expect(parseChallengeInput({ title: "x", url: "javascript:alert(1)" }, "create").ok).toBe(false);
    expect(parseChallengeInput({ title: "x", url: "not a url" }, "create").ok).toBe(false);
  });

  it("accepts http(s) links and clears empty optional fields", () => {
    const r = parseChallengeInput(
      { title: "x", url: "https://picoctf.org/", platform: "", points: null, notes: " " },
      "create"
    );
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.url).toBe("https://picoctf.org/");
      expect(r.data.platform).toBeNull();
      expect(r.data.points).toBeNull();
      expect(r.data.notes).toBeNull();
    }
  });

  it("ignores unknown keys such as userId or solvedAt", () => {
    const r = parseChallengeInput({ title: "x", userId: "evil", solvedAt: "2020-01-01", id: "1" }, "create");
    expect(r).toEqual({ ok: true, data: { title: "x" } });
  });
});

describe("parseChallengeInput (update)", () => {
  it("only includes fields that were sent", () => {
    expect(parseChallengeInput({ status: "SOLVED" }, "update")).toEqual({
      ok: true,
      data: { status: "SOLVED" },
    });
  });

  it("rejects empty updates and non-objects", () => {
    expect(parseChallengeInput({}, "update").ok).toBe(false);
    expect(parseChallengeInput(null, "update").ok).toBe(false);
    expect(parseChallengeInput([], "update").ok).toBe(false);
  });
});
