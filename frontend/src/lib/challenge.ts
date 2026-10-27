// Pure helpers: no database or server imports, so client components can use them too.

export const CATEGORIES = ["WEB", "CRYPTO", "PWN", "REVERSE", "FORENSICS", "OSINT", "MISC"] as const;
export const DIFFICULTIES = ["EASY", "MEDIUM", "HARD", "INSANE"] as const;
export const STATUSES = ["TODO", "IN_PROGRESS", "SOLVED"] as const;

export type Category = (typeof CATEGORIES)[number];
export type Difficulty = (typeof DIFFICULTIES)[number];
export type Status = (typeof STATUSES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  WEB: "Web", CRYPTO: "Crypto", PWN: "Pwn", REVERSE: "Reverse",
  FORENSICS: "Forensics", OSINT: "OSINT", MISC: "Misc",
};
export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  EASY: "Easy", MEDIUM: "Medium", HARD: "Hard", INSANE: "Insane",
};
export const STATUS_LABELS: Record<Status, string> = {
  TODO: "To do", IN_PROGRESS: "In progress", SOLVED: "Solved",
};

export type ChallengeInput = {
  title?: string;
  platform?: string | null;
  category?: Category;
  difficulty?: Difficulty;
  status?: Status;
  points?: number | null;
  url?: string | null;
  notes?: string | null;
};

export type ParseResult = { ok: true; data: ChallengeInput } | { ok: false; message: string };

const fail = (message: string): ParseResult => ({ ok: false, message });

function isOneOf<T extends string>(list: readonly T[], value: unknown): value is T {
  return typeof value === "string" && (list as readonly string[]).includes(value);
}

/**
 * Validates a create/update body. Only known fields are copied, so extra keys
 * (like userId or id) sent by a client are ignored.
 * Dates (solvedAt) are managed by the server, never by the client.
 */
export function parseChallengeInput(body: unknown, mode: "create" | "update"): ParseResult {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return fail("Request body must be a JSON object.");
  }
  const b = body as Record<string, unknown>;
  const data: ChallengeInput = {};

  if (mode === "create" || "title" in b) {
    const title = typeof b.title === "string" ? b.title.trim() : "";
    if (!title) return fail("Title is required.");
    if (title.length > 120) return fail("Title must be 120 characters or fewer.");
    data.title = title;
  }

  // Optional free-text fields: absent = untouched, ""/null = cleared.
  const textFields: Array<["platform" | "notes", number, string]> = [
    ["platform", 60, "Platform"],
    ["notes", 5000, "Notes"],
  ];
  for (const [key, max, label] of textFields) {
    if (!(key in b)) continue;
    const v = b[key];
    if (v === null || v === undefined || v === "") {
      data[key] = null;
    } else if (typeof v === "string") {
      const t = v.trim();
      if (t.length > max) return fail(`${label} must be ${max} characters or fewer.`);
      data[key] = t || null;
    } else {
      return fail(`${label} must be text.`);
    }
  }

  if ("category" in b) {
    if (!isOneOf(CATEGORIES, b.category)) return fail("Unknown category.");
    data.category = b.category;
  }
  if ("difficulty" in b) {
    if (!isOneOf(DIFFICULTIES, b.difficulty)) return fail("Unknown difficulty.");
    data.difficulty = b.difficulty;
  }
  if ("status" in b) {
    if (!isOneOf(STATUSES, b.status)) return fail("Unknown status.");
    data.status = b.status;
  }

  if ("points" in b) {
    const v = b.points;
    if (v === null || v === undefined || v === "") {
      data.points = null;
    } else if (typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= 100000) {
      data.points = v;
    } else {
      return fail("Points must be a whole number between 0 and 100000.");
    }
  }

  if ("url" in b) {
    const v = b.url;
    if (v === null || v === undefined || v === "") {
      data.url = null;
    } else if (typeof v === "string" && v.trim().length <= 500) {
      try {
        const u = new URL(v.trim());
        if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error("protocol");
        data.url = u.toString();
      } catch {
        return fail("URL must be a valid http(s) link.");
      }
    } else {
      return fail("URL must be a valid http(s) link under 500 characters.");
    }
  }

  if (mode === "update" && Object.keys(data).length === 0) return fail("Nothing to update.");
  return { ok: true, data };
}
