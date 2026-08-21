import "server-only";

import { requireAdmin } from "@/lib/auth/session";
import { validateImageFile } from "@/lib/validation/media";
import { uploadObject, removeObject, generateStoragePath, type PublicMediaBucket } from "@/lib/cms/storage";

/**
 * Module 9K — the authorization + validation boundary in front of
 * `lib/cms/storage.ts` (spec §9):
 *
 *   Admin UI (MediaUploadField / ProjectGalleryManager)
 *     ↓
 *   Server Action (features/admin/actions.ts)
 *     ↓
 *   uploadMedia() / deleteMedia()  ← this file: requireAdmin() + validateImageFile()
 *     ↓
 *   lib/cms/storage.ts             ← raw Supabase Storage calls
 *     ↓
 *   Supabase Storage + RLS (storage_admin_write / _admin_delete)
 *
 * `requireAdmin()` here is the same defense-in-depth relationship the
 * rest of the CMS service layer has with RLS (see
 * `serviceContentService.ts`'s header comment) — Storage RLS is the
 * actual, independent authority underneath it.
 */

export type UploadMediaResult = { ok: true; path: string } | { ok: false; message: string };

/**
 * `folder` is optional and only ever used for the Project gallery
 * (`{projectId}/{uuid}.{ext}` — see `generateStoragePath`'s header).
 * Every other caller (Services/Team/Insights/a Project's own single
 * `media_path`) omits it and gets a flat `{uuid}.{ext}` path.
 */
export async function uploadMedia(bucket: PublicMediaBucket, file: File, folder?: string): Promise<UploadMediaResult> {
  try {
    await requireAdmin();
  } catch (error) {
    console.error("uploadMedia: not authorized", error);
    return { ok: false, message: "You must be an admin to upload media." };
  }

  const validation = validateImageFile({ type: file.type, size: file.size });
  if (!validation.ok) {
    return { ok: false, message: validation.message };
  }

  const path = generateStoragePath(validation.extension, folder);
  const bytes = await file.arrayBuffer();
  const result = await uploadObject(bucket, path, bytes, file.type);
  if (!result.ok) return result;

  return { ok: true, path: result.path };
}

export type DeleteMediaResult = { ok: true } | { ok: false; message: string };

export async function deleteMedia(bucket: PublicMediaBucket, path: string): Promise<DeleteMediaResult> {
  try {
    await requireAdmin();
  } catch (error) {
    console.error("deleteMedia: not authorized", error);
    return { ok: false, message: "You must be an admin to remove media." };
  }

  if (!path || path.trim().length === 0) {
    return { ok: false, message: "No image to remove." };
  }

  return removeObject(bucket, path.trim());
}
