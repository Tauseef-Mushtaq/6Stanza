/**
 * Shared result shapes for the four CMS content services (spec §21/§25).
 * Same discriminated-result pattern as `contactInquiryService.ts`'s
 * `AdminListResult`/`AdminGetResult`/`AdminUpdateResult` — defined once
 * here instead of copy-pasted four times, since all four entities
 * (services/projects/team/insights) share the same read/write shapes.
 */

export type PublicListResult<T> = { ok: true; data: T[] } | { ok: false; message: string };
export type PublicGetResult<T> = { ok: true; data: T | null } | { ok: false; message: string };

export type AdminListResult<T> = { ok: true; data: T[] } | { ok: false; message: string };
export type AdminGetResult<T> = { ok: true; data: T | null } | { ok: false; message: string };
export type AdminMutationResult<T> =
  | { ok: true; data: T }
  | { ok: false; fieldErrors: Record<string, string>; message?: undefined }
  | { ok: false; message: string; fieldErrors?: undefined };

/** Maps a caught error to the safe, generic admin-facing message (spec §25 — never expose raw Postgres/Supabase errors). */
export function toAdminErrorMessage(action: string): string {
  return `Unable to ${action}. Please try again.`;
}

/**
 * Module 9B — detects a Postgres unique-constraint violation (error
 * code `23505`, e.g. the `services_slug_key` constraint from
 * `0005_cms_content.sql`) so the service layer can surface a specific
 * "this slug already exists" field error instead of the generic
 * catch-all message (spec §10/§15 — never silently overwrite another
 * row, and never leak the raw Postgres error in the process).
 */
export function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "23505";
}
