/**
 * Module 10B — shared public-CMS-boundary helpers (spec §4/§24).
 *
 * The Module 9F/9G/9H/9I data files originally collapsed every read
 * failure into an empty array (`[]`), which made "zero published
 * rows" and "the query failed" indistinguishable to every public
 * page/section — an empty CMS collection and a database outage both
 * rendered the same "nothing here" copy. This file adds the smallest
 * shared shape needed to keep that distinction all the way to the
 * public UI, without introducing a new state-management layer.
 */

/** Result of a public collection read: `ok` distinguishes "the query ran and returned these rows" (possibly zero) from "the query failed". `data` is always an array so existing `.map()`/`.length` call sites keep working even when `ok` is false. */
export interface PublicCollectionResult<T> {
  ok: boolean;
  data: T[];
}

/**
 * Detail-route lookups (`/services/[slug]`, `/projects/[slug]`,
 * `/insights/[slug]`) have a third outcome beyond found/empty: the
 * slug may simply not resolve to any published record. `notFound`
 * must only ever mean "no such published resource"; a database/
 * network failure must resolve to `error`, never `notFound` (spec §10/§18).
 */
export type PublicDetailResult<T> =
  | { status: "found"; value: T }
  | { status: "not-found" }
  | { status: "error" };

/**
 * Throws an `Error` carrying the `safeMessage` marker that
 * `getSafeErrorMessage` (Module 10A) looks for, so the root
 * `error.tsx` boundary shows safe, generic copy instead of any
 * backend/Supabase detail. Used only where a public *detail* route's
 * data is unavailable due to an infrastructure failure — a case the
 * route's `notFound()` call must never absorb (spec §10/§18/§21).
 */
export function throwPublicCmsError(safeMessage = "We couldn't load this content right now. Please try again."): never {
  throw Object.assign(new Error("Public CMS read failed"), { safeMessage });
}
