import "server-only";

import { requireAdmin } from "@/lib/auth/session";
import { uploadMedia, deleteMedia } from "@/lib/services/mediaService";
import {
  listPublishedProjectMedia,
  listAllProjectMedia,
  insertProjectMedia,
  updateProjectMediaOrder,
  updateProjectMediaAltText,
  getProjectMediaById,
  deleteProjectMediaRow,
  type ProjectMediaRow,
} from "@/lib/repositories/projectMedia";

/**
 * Module 9K — the Project gallery's own service layer, parallel to
 * `projectContentService.ts` but for `project_media` rather than
 * `projects`. Chose "Option B: upload and persist immediately" (spec
 * §26) for gallery images specifically, unlike the single-image
 * fields on the Service/Project/Team/Insight forms themselves: a
 * gallery row needs a real `project_id` foreign key, which only
 * exists once the parent project has already been saved at least
 * once — so gallery management only appears on `/admin/projects/[id]`
 * (edit mode), never on `/admin/projects/new`. That sidesteps spec
 * §27's "upload without saving" problem entirely for this content
 * type: there is no unsaved-parent state in which a gallery row could
 * be orphaned, because the UI that creates gallery rows literally
 * cannot render until the project exists.
 */

export type PublicListResult<T> = { ok: true; data: T[] } | { ok: false; message: string };
export type AdminListResult<T> = { ok: true; data: T[] } | { ok: false; message: string };
export type AddImageResult = { ok: true; data: ProjectMediaRow } | { ok: false; message: string };
export type RemoveImageResult = { ok: true } | { ok: false; message: string };
export type ReorderResult = { ok: true; data: ProjectMediaRow[] } | { ok: false; message: string };

function toAdminErrorMessage(action: string): string {
  return `Unable to ${action}. Please try again.`;
}

export async function getPublishedProjectGallery(projectId: string): Promise<PublicListResult<ProjectMediaRow>> {
  try {
    const data = await listPublishedProjectMedia(projectId);
    return { ok: true, data };
  } catch (error) {
    console.error("getPublishedProjectGallery: query failed", error);
    return { ok: false, message: toAdminErrorMessage("load the project gallery") };
  }
}

export async function listProjectGalleryForAdmin(projectId: string): Promise<AdminListResult<ProjectMediaRow>> {
  try {
    await requireAdmin();
    const data = await listAllProjectMedia(projectId);
    return { ok: true, data };
  } catch (error) {
    console.error("listProjectGalleryForAdmin: query failed", error);
    return { ok: false, message: toAdminErrorMessage("load the project gallery") };
  }
}

/**
 * Uploads the file to the `projects` bucket under `{projectId}/...`
 * (spec §7), then immediately creates the `project_media` row —
 * placed after the next existing image's `sort_order` so new uploads
 * land at the end of the gallery by default (spec §21's determinism
 * requirement, not insertion order — the *value* just happens to be
 * chosen from the current max at add-time).
 */
export async function addProjectGalleryImage(
  projectId: string,
  file: File,
  altText?: string
): Promise<AddImageResult> {
  try {
    await requireAdmin();
  } catch (error) {
    console.error("addProjectGalleryImage: not authorized", error);
    return { ok: false, message: "You must be an admin to upload media." };
  }

  const uploadResult = await uploadMedia("projects", file, projectId);
  if (!uploadResult.ok) return uploadResult;

  try {
    const existing = await listAllProjectMedia(projectId);
    const nextSortOrder = existing.reduce((max, row) => Math.max(max, row.sort_order), -1) + 1;
    const data = await insertProjectMedia({
      projectId,
      storagePath: uploadResult.path,
      altText: altText?.trim() || null,
      sortOrder: nextSortOrder,
    });
    return { ok: true, data };
  } catch (error) {
    console.error("addProjectGalleryImage: insert failed", error);
    // The upload itself succeeded but the database row didn't — this
    // is a genuine orphaned Storage object. Best-effort cleanup so a
    // failed "add" doesn't silently leave a file with no reference
    // (spec §19's "avoid orphaned storage files where practical").
    await deleteMedia("projects", uploadResult.path);
    return { ok: false, message: toAdminErrorMessage("save this image") };
  }
}

/**
 * Removes both the database row and the Storage object (spec §19 —
 * "prefer actual cleanup if there is no revision/history system," and
 * this table has none). The database row is removed first: if Storage
 * deletion then fails, the gallery still shows the removal succeeded
 * for the admin's purposes, and the orphaned object is a documented,
 * bounded limitation (see MODULE-9K-HANDOFF.md §K) rather than a
 * blocked, confusing UI action.
 */
export async function removeProjectGalleryImage(id: string): Promise<RemoveImageResult> {
  try {
    await requireAdmin();
  } catch (error) {
    console.error("removeProjectGalleryImage: not authorized", error);
    return { ok: false, message: "You must be an admin to remove media." };
  }

  const row = await getProjectMediaById(id);
  if (!row) return { ok: false, message: "That image no longer exists." };

  try {
    await deleteProjectMediaRow(id);
  } catch (error) {
    console.error("removeProjectGalleryImage: row delete failed", error);
    return { ok: false, message: toAdminErrorMessage("remove this image") };
  }

  const storageResult = await deleteMedia("projects", row.storage_path);
  if (!storageResult.ok) {
    console.error("removeProjectGalleryImage: Storage cleanup failed", storageResult.message);
  }

  return { ok: true };
}

/**
 * Simple up/down reordering (spec §12's "a simple up/down reorder
 * control is acceptable if drag-and-drop introduces unnecessary
 * complexity" — this project has no existing DnD primitive, per spec
 * §12's own instruction not to add one just for this). `orderedIds`
 * is the full new top-to-bottom id order from the admin UI; this
 * writes `sort_order = index` for each row.
 */
export async function reorderProjectGallery(projectId: string, orderedIds: string[]): Promise<ReorderResult> {
  try {
    await requireAdmin();
  } catch (error) {
    console.error("reorderProjectGallery: not authorized", error);
    return { ok: false, message: "You must be an admin to reorder media." };
  }

  try {
    const existing = await listAllProjectMedia(projectId);
    const existingIds = new Set(existing.map((row) => row.id));
    const validIds = orderedIds.filter((id) => existingIds.has(id));

    const updated = await Promise.all(validIds.map((id, index) => updateProjectMediaOrder(id, index)));
    return { ok: true, data: updated };
  } catch (error) {
    console.error("reorderProjectGallery: update failed", error);
    return { ok: false, message: toAdminErrorMessage("reorder these images") };
  }
}

export async function updateProjectGalleryImageAlt(id: string, altText: string): Promise<AddImageResult> {
  try {
    await requireAdmin();
    const data = await updateProjectMediaAltText(id, altText.trim() || null);
    return { ok: true, data };
  } catch (error) {
    console.error("updateProjectGalleryImageAlt: update failed", error);
    return { ok: false, message: toAdminErrorMessage("update this image") };
  }
}
