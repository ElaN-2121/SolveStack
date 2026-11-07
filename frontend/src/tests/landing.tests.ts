import { describe, it, expect } from "vitest";
import { FEATURES, getCta } from "@/lib/landing";

describe("landing page data", () => {
  it("has features, each with a title, description and valid status", () => {
    expect(FEATURES.length).toBeGreaterThanOrEqual(3);
    for (const f of FEATURES) {
      expect(f.title.length).toBeGreaterThan(0);
      expect(f.description.length).toBeGreaterThan(0);
      expect(["live", "soon"]).toContain(f.status);
    }
  });

  it("has unique feature titles and at least one live feature", () => {
    const titles = FEATURES.map((f) => f.title);
    expect(new Set(titles).size).toBe(titles.length);
    expect(FEATURES.some((f) => f.status === "live")).toBe(true);
  });
});

describe("getCta", () => {
  it("shows the sign-in button to signed-out visitors", () => {
    expect(getCta(false)).toEqual({ kind: "signin", label: "Continue with Google" });
  });

  it("links signed-in users to the dashboard", () => {
    expect(getCta(true)).toEqual({ kind: "dashboard", label: "Open dashboard", href: "/dashboard" });
  });
});
