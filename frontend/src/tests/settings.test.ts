import { describe, it, expect } from "vitest";
import { formatHour, parseSettingsInput } from "@/lib/settings";

describe("parseSettingsInput", () => {
  it("accepts any valid subset", () => {
    expect(parseSettingsInput({ reminderHour: 8 })).toEqual({ ok: true, data: { reminderHour: 8 } });
    expect(parseSettingsInput({ timezone: "UTC", reminderEnabled: true, reminderHour: 0 })).toEqual({
      ok: true,
      data: { timezone: "UTC", reminderEnabled: true, reminderHour: 0 },
    });
  });

  it("rejects bad values", () => {
    expect(parseSettingsInput({ timezone: "Nope/Nowhere" }).ok).toBe(false);
    expect(parseSettingsInput({ reminderEnabled: "yes" }).ok).toBe(false);
    expect(parseSettingsInput({ reminderHour: 24 }).ok).toBe(false);
    expect(parseSettingsInput({ reminderHour: -1 }).ok).toBe(false);
    expect(parseSettingsInput({ reminderHour: 7.5 }).ok).toBe(false);
  });

  it("rejects empty bodies and ignores unknown keys", () => {
    expect(parseSettingsInput({}).ok).toBe(false);
    expect(parseSettingsInput(null).ok).toBe(false);
    expect(parseSettingsInput({ lastReminderOn: "2026-01-01" }).ok).toBe(false);
  });
});

describe("formatHour", () => {
  it("formats 12-hour times", () => {
    expect(formatHour(0)).toBe("12:00 AM");
    expect(formatHour(8)).toBe("8:00 AM");
    expect(formatHour(12)).toBe("12:00 PM");
    expect(formatHour(20)).toBe("8:00 PM");
  });
});
