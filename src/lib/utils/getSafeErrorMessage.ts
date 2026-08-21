/**
 * Module 10A — safe error message utility (spec §14). Server Actions
 * across the app already return their own safe, validated `message`
 * strings (see `ArchiveProjectActionResult` and siblings in
 * `features/admin/actions.ts`) — that pattern is not touched here.
 *
 * This helper is for the one place that previously had no equivalent:
 * App Router error boundaries (`error.tsx`, `global-error.tsx`),
 * which receive a raw `Error` thrown anywhere in the tree and must
 * never surface its `message` (stack traces, Postgres/PGRST codes,
 * RLS policy names, etc.) directly to the user.
 */
export function getSafeErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  // Only ever return a message we put on the error ourselves via a
  // known-safe marker; anything else (including `error.message` from
  // Supabase/Postgres/unknown throws) falls back to the generic copy.
  if (
    error &&
    typeof error === "object" &&
    "safeMessage" in error &&
    typeof (error as { safeMessage?: unknown }).safeMessage === "string"
  ) {
    return (error as { safeMessage: string }).safeMessage;
  }

  return fallback;
}
