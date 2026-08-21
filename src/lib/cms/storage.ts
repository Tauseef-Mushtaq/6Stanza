import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Module 9K — raw Supabase Storage operations (spec §6/§7/§29).
 *
 * The buckets themselves were already created in Module 5
 * (`supabase/migrations/0004_storage_buckets.sql`): `team`,
 * `projects`, `insights`, `general` — all `public: true`, all with
 * `storage_admin_write`/`storage_admin_update`/`storage_admin_delete`
 * policies gated on `public.is_admin()`. No new bucket is created
 * here (spec §6's "do not create duplicate buckets unnecessarily") —
 * Services has no dedicated bucket of its own, so it reuses `general`,
 * which was already provisioned as the catch-all bucket.
 *
 * Every function here goes through `createSupabaseServerClient()` —
 * the same per-request, cookie-authenticated, anon-key client every
 * other repository uses. There is no service-role client anywhere in
 * this file (spec §29): uploads/deletes only succeed because the
 * calling user's session satisfies `public.is_admin()` inside the
 * Storage RLS policies above, not because of an elevated key.
 */

export type PublicMediaBucket = "team" | "projects" | "insights" | "general";

/**
 * `{uuid}.{ext}` for single-image fields (Services/Team/Insights/the
 * Project's own `media_path`) — no content-id folder needed, since
 * the owning row's column *is* the association; a uuid alone already
 * guarantees no collision (spec §7's "generated unique filenames").
 *
 * `{projectId}/{uuid}.{ext}` for gallery images — grouped by project
 * so an admin (or a future cleanup job) can find every image for one
 * project without a database round-trip, matching spec §7's suggested
 * `<content-type>/<content-id>/<file>` shape for the one content type
 * that actually has multiple files per record.
 *
 * Either way, the path is fully server-generated from a `crypto.randomUUID()`
 * and a MIME-derived extension — never the browser-supplied original
 * filename, so there's no path-traversal surface and no need to
 * sanitize user input into a path (spec §7).
 */
export function generateStoragePath(extension: string, folder?: string): string {
  const filename = `${crypto.randomUUID()}.${extension}`;
  return folder ? `${folder}/${filename}` : filename;
}

export type UploadResult = { ok: true; path: string } | { ok: false; message: string };

/**
 * Uploads already-validated bytes to `bucket` at `path`. Validation
 * (MIME/size) happens one layer up in `lib/services/mediaService.ts`
 * — this function trusts its caller the same way `insertService`
 * trusts `serviceSchema.safeParse` already ran.
 */
export async function uploadObject(
  bucket: PublicMediaBucket,
  path: string,
  bytes: ArrayBuffer,
  contentType: string
): Promise<UploadResult> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.storage.from(bucket).upload(path, bytes, { contentType, upsert: false });
  if (error) {
    console.error("uploadObject: Storage upload failed", { bucket, path, error });
    return { ok: false, message: "Unable to upload this image. Please try again." };
  }
  return { ok: true, path };
}

export type DeleteResult = { ok: true } | { ok: false; message: string };

/**
 * Best-effort object removal (spec §19/§20 — "if storage deletion
 * fails, do not silently claim success"). Callers that also maintain
 * a database reference (the `project_media` table, or a form's local
 * `mediaPath` state) must not treat a failed delete here as reason to
 * roll back the database change that already succeeded — see
 * `mediaService.ts` and `projectMediaService.ts` for how each caller
 * actually handles this trade-off, and MODULE-9K-HANDOFF.md §K for
 * the documented orphan-cleanup limitation.
 */
export async function removeObject(bucket: PublicMediaBucket, path: string): Promise<DeleteResult> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    console.error("removeObject: Storage delete failed", { bucket, path, error });
    return { ok: false, message: "Unable to remove the previous image, but your change was saved." };
  }
  return { ok: true };
}
