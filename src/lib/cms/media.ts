import "server-only";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

/**
 * Module 9H — centralized public Storage URL builder (spec §11).
 *
 * `path` is the storage-relative object path stored in a CMS `*_path`
 * column (e.g. `team_members.image_path`) — no scheme, no leading
 * slash, matching `mediaPathSchema` in `lib/validation/cmsContent.ts`.
 * `bucket` is one of the public buckets created in
 * `supabase/migrations/0004_storage_buckets.sql` (`team`, `projects`,
 * `insights`, `general`) — all four are `public: true`, so a plain
 * `storage/v1/object/public/...` URL is sufficient; no signed URL is
 * needed.
 *
 * This is the single place that assembles this URL shape — no
 * component or adapter should build one by hand (spec §11).
 */
export function getPublicMediaUrl(bucket: string, path: string | null | undefined): string | undefined {
  if (!SUPABASE_URL || !path) return undefined;
  const cleanPath = path.trim().replace(/^\/+/, "");
  if (!cleanPath) return undefined;
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${cleanPath}`;
}
