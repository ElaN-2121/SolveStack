import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "unauthorized"
  | "invalid_handle"
  | "handle_taken"
  | "invalid_input"
  | "not_found"
  | "internal";

export function apiError(status: number, code: ApiErrorCode, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}
