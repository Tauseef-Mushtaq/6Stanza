/**
 * Module 9K — a client-safe counterpart to `lib/cms/media.ts`'s
 * `getPublicMediaUrl` (which is `server-only` and used by the public
 * adapters). This one has no `server-only` guard so `MediaUploadField`
 * (a client component) can build the same URL shape for an instant
 * preview immediately after upload, without waiting for a server
 * round-trip.
 *
 * Deliberately not a single shared implementation with
 * `lib/cms/media.ts` — that file's `server-only` import is a real
 * build-time guard against accidentally bundling other server-only
 * code into the client, and this function has nothing server-only in
 * it (just string interpolation against `NEXT_PUBLIC_SUPABASE_URL`,
 * which is already inlined into client bundles by Next.js), so
 * duplicating these ~4 lines is safer than loosening that guard.
 */
export function buildPublicMediaUrl(bucket: string, path: string | null | undefined): string | undefined {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || !path) return undefined;
  const cleanPath = path.trim().replace(/^\/+/, "");
  if (!cleanPath) return undefined;
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${cleanPath}`;
}
