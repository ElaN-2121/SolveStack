// Pure helpers for the settings screen and API (no server imports).
import { isValidTimeZone } from "@/lib/streak";

export type SettingsInput = {
  timezone?: string;
  reminderEnabled?: boolean;
  reminderHour?: number;
};

export type SettingsParse = { ok: true; data: SettingsInput } | { ok: false; message: string };

export function parseSettingsInput(body: unknown): SettingsParse {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, message: "Request body must be a JSON object." };
  }
  const b = body as Record<string, unknown>;
  const data: SettingsInput = {};

  if ("timezone" in b) {
    if (!isValidTimeZone(b.timezone)) return { ok: false, message: "Unknown time zone." };
    data.timezone = b.timezone;
  }
  if ("reminderEnabled" in b) {
    if (typeof b.reminderEnabled !== "boolean") return { ok: false, message: "reminderEnabled must be true or false." };
    data.reminderEnabled = b.reminderEnabled;
  }
  if ("reminderHour" in b) {
    const h = b.reminderHour;
    if (typeof h !== "number" || !Number.isInteger(h) || h < 0 || h > 23) {
      return { ok: false, message: "Reminder hour must be a whole number from 0 to 23." };
    }
    data.reminderHour = h;
  }

  if (Object.keys(data).length === 0) return { ok: false, message: "Nothing to update." };
  return { ok: true, data };
}

/** 0 -> "12:00 AM", 20 -> "8:00 PM" */
export function formatHour(hour: number): string {
  const suffix = hour < 12 ? "AM" : "PM";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:00 ${suffix}`;
}
