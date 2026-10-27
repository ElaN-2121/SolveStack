export const HANDLE_PATTERN = /^[a-z0-9_]{3,20}$/;

const RESERVED = new Set([
  "admin", "root", "support", "solvestack", "system", "null", "undefined", "me", "api",
]);

export function normalizeHandle(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function isValidHandle(handle: string): boolean {
  return HANDLE_PATTERN.test(handle) && !RESERVED.has(handle);
}
