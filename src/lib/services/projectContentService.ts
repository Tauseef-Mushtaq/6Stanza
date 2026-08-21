import "server-only";

import { requireAdmin } from "@/lib/auth/session";
import { projectSchema } from "@/lib/validation/cmsContent";
import {
  listPublishedProjects,
  getPublishedProjectBySlug,
  listAllProjects,
  getProjectById,
  insertProject,
  updateProject,
  archiveProject,
  deleteProject,
  type ProjectRow,
} from "@/lib/repositories/projects";
import { listAllProjectMedia } from "@/lib/repositories/projectMedia";
import { deleteMedia } from "@/lib/services/mediaService";
import type { ContentStatus } from "@/lib/supabase/database.types";
import type {
  PublicListResult,
  PublicGetResult,
  AdminListResult,
  AdminGetResult,
  AdminMutationResult,
} from "./cmsContentTypes";
import { toAdminErrorMessage, isUniqueViolation } from "./cmsContentTypes";

/** Service-layer foundation for `projects` CMS content — same conventions as `serviceContentService.ts`. No caller yet; see that file's header comment. */

// ---- public reads ----

export async function getPublishedProjects(): Promise<PublicListResult<ProjectRow>> {
  try {
    const data = await listPublishedProjects();
    return { ok: true, data };
  } catch (error) {
    console.error("getPublishedProjects: query failed", error);
    return { ok: false, message: toAdminErrorMessage("load projects") };
  }
}

export async function getPublishedProject(slug: string): Promise<PublicGetResult<ProjectRow>> {
  try {
    const data = await getPublishedProjectBySlug(slug);
    return { ok: true, data };
  } catch (error) {
    console.error("getPublishedProject: query failed", error);
    return { ok: false, message: toAdminErrorMessage("load this project") };
  }
}

// ---- admin reads/writes ----

export async function listAllProjectsForAdmin(status?: ContentStatus): Promise<AdminListResult<ProjectRow>> {
  try {
    await requireAdmin();
    const data = await listAllProjects(status);
    return { ok: true, data };
  } catch (error) {
    console.error("listAllProjectsForAdmin: query failed", error);
    return { ok: false, message: toAdminErrorMessage("load projects") };
  }
}

export async function getProjectForAdmin(id: string): Promise<AdminGetResult<ProjectRow>> {
  try {
    await requireAdmin();
    const data = await getProjectById(id);
    return { ok: true, data };
  } catch (error) {
    console.error("getProjectForAdmin: query failed", error);
    return { ok: false, message: toAdminErrorMessage("load this project") };
  }
}

function fieldErrorsFrom(error: import("zod").ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in fieldErrors)) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

export async function createProject(raw: unknown): Promise<AdminMutationResult<ProjectRow>> {
  try {
    await requireAdmin();
  } catch (error) {
    console.error("createProject: not authorized", error);
    return { ok: false, message: "You must be an admin to do this." };
  }

  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error) };

  try {
    const data = await insertProject(parsed.data);
    return { ok: true, data };
  } catch (error) {
    console.error("createProject: insert failed", error);
    if (isUniqueViolation(error)) {
      return { ok: false, fieldErrors: { slug: "A project with this slug already exists." } };
    }
    return { ok: false, message: toAdminErrorMessage("create this project") };
  }
}

export async function updateProjectForAdmin(id: string, raw: unknown): Promise<AdminMutationResult<ProjectRow>> {
  try {
    await requireAdmin();
  } catch (error) {
    console.error("updateProjectForAdmin: not authorized", error);
    return { ok: false, message: "You must be an admin to do this." };
  }

  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error) };

  try {
    const data = await updateProject(id, parsed.data);
    return { ok: true, data };
  } catch (error) {
    console.error("updateProjectForAdmin: update failed", error);
    if (isUniqueViolation(error)) {
      return { ok: false, fieldErrors: { slug: "A project with this slug already exists." } };
    }
    return { ok: false, message: toAdminErrorMessage("update this project") };
  }
}

export async function archiveProjectForAdmin(id: string): Promise<AdminGetResult<ProjectRow>> {
  try {
    await requireAdmin();
    const data = await archiveProject(id);
    return { ok: true, data };
  } catch (error) {
    console.error("archiveProjectForAdmin: update failed", error);
    return { ok: false, message: toAdminErrorMessage("archive this project") };
  }
}

export type DeleteResult = { ok: true } | { ok: false; message: string };

/**
 * Module 9M — permanent deletion (spec §17/§20), the special case
 * every other content type's delete doesn't have: a project can own
 * both its own single `media_path` *and* a whole `project_media`
 * gallery. Order of operations:
 *
 *   1. Read the project row (`media_path`) and its full gallery
 *      (`storage_path` per image) *before* anything is deleted.
 *   2. Delete the `projects` row. The existing FK
 *      (`project_media.project_id references projects(id) on delete
 *      cascade`, `0006_project_media.sql`) removes every
 *      `project_media` database row automatically — no manual
 *      gallery-row deletion needed here.
 *   3. Only after the database delete succeeds, best-effort delete
 *      every Storage object the cascade doesn't and can't touch: the
 *      project's own `media_path` plus every gallery image's
 *      `storage_path`. A failed individual cleanup is logged and
 *      does not block the others or reverse the database delete —
 *      same documented, bounded orphan-object semantics as
 *      `removeProjectGalleryImage` (Module 9K) and every other
 *      delete in this module.
 */
export async function deleteProjectForAdmin(id: string): Promise<DeleteResult> {
  try {
    await requireAdmin();
  } catch (error) {
    console.error("deleteProjectForAdmin: not authorized", error);
    return { ok: false, message: "You must be an admin to do this." };
  }

  const existing = await getProjectById(id).catch(() => null);
  const gallery = await listAllProjectMedia(id).catch(() => []);

  try {
    await deleteProject(id);
  } catch (error) {
    console.error("deleteProjectForAdmin: delete failed", error);
    return { ok: false, message: toAdminErrorMessage("delete this project") };
  }

  if (existing?.media_path) {
    const cleanup = await deleteMedia("projects", existing.media_path);
    if (!cleanup.ok) {
      console.error("deleteProjectForAdmin: single-image Storage cleanup failed", cleanup.message);
    }
  }

  for (const media of gallery) {
    const cleanup = await deleteMedia("projects", media.storage_path);
    if (!cleanup.ok) {
      console.error("deleteProjectForAdmin: gallery Storage cleanup failed", { path: media.storage_path, message: cleanup.message });
    }
  }

  return { ok: true };
}
