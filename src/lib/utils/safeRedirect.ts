/**
 * Validates a `?redirect=` param is a safe, internal, same-origin path
 * before it's ever used in a `redirect()` call (spec §17/§20 — "the
 * redirect destination must be validated as an internal/safe path...
 * do not trust arbitrary open redirect URLs").
 *
 * Rejects anything that isn't a plain path starting with a single `/`:
 * absolute URLs (`https://evil.com`), protocol-relative URLs
 * (`//evil.com` — a classic open-redirect bypass, since browsers treat
 * a leading `//` as "same protocol, different host"), and anything
 * containing a `://` scheme separator. Falls back to `fallback` (the
 * caller decides what "no redirect requested" means for that flow).
 */
export function safeRedirectPath(raw: string | null | undefined, fallback: string): string {
  if (!raw) return fallback;
  if (!raw.startsWith("/")) return fallback;
  if (raw.startsWith("//")) return fallback;
  if (raw.includes("://")) return fallback;
  return raw;
}
