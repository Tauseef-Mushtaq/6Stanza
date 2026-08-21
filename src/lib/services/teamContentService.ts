import "server-only";

import { requireAdmin } from "@/lib/auth/session";
import { teamMemberSchema } from "@/lib/validation/cmsContent";
import {
  listPublishedTeamMembers,
  getPublishedTeamMemberBySlug,
  listAllTeamMembers,
  getTeamMemberById,
  insertTeamMember,
  updateTeamMember,
  archiveTeamMember,
  deleteTeamMember,
  type TeamMemberRow,
} from "@/lib/repositories/teamMembers";
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

/** Service-layer foundation for `team_members` CMS content — same conventions as `serviceContentService.ts`. No caller yet; see that file's header comment. */

// ---- public reads ----

export async function getPublishedTeamMembers(): Promise<PublicListResult<TeamMemberRow>> {
  try {
    const data = await listPublishedTeamMembers();
    return { ok: true, data };
  } catch (error) {
    console.error("getPublishedTeamMembers: query failed", error);
    return { ok: false, message: toAdminErrorMessage("load the team") };
  }
}

export async function getPublishedTeamMember(slug: string): Promise<PublicGetResult<TeamMemberRow>> {
  try {
    const data = await getPublishedTeamMemberBySlug(slug);
    return { ok: true, data };
  } catch (error) {
    console.error("getPublishedTeamMember: query failed", error);
    return { ok: false, message: toAdminErrorMessage("load this team member") };
  }
}

// ---- admin reads/writes ----

export async function listAllTeamMembersForAdmin(status?: ContentStatus): Promise<AdminListResult<TeamMemberRow>> {
  try {
    await requireAdmin();
    const data = await listAllTeamMembers(status);
    return { ok: true, data };
  } catch (error) {
    console.error("listAllTeamMembersForAdmin: query failed", error);
    return { ok: false, message: toAdminErrorMessage("load the team") };
  }
}

export async function getTeamMemberForAdmin(id: string): Promise<AdminGetResult<TeamMemberRow>> {
  try {
    await requireAdmin();
    const data = await getTeamMemberById(id);
    return { ok: true, data };
  } catch (error) {
    console.error("getTeamMemberForAdmin: query failed", error);
    return { ok: false, message: toAdminErrorMessage("load this team member") };
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

export async function createTeamMember(raw: unknown): Promise<AdminMutationResult<TeamMemberRow>> {
  try {
    await requireAdmin();
  } catch (error) {
    console.error("createTeamMember: not authorized", error);
    return { ok: false, message: "You must be an admin to do this." };
  }

  const parsed = teamMemberSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error) };

  try {
    const data = await insertTeamMember(parsed.data);
    return { ok: true, data };
  } catch (error) {
    console.error("createTeamMember: insert failed", error);
    if (isUniqueViolation(error)) {
      return { ok: false, fieldErrors: { slug: "A team member with this slug already exists." } };
    }
    return { ok: false, message: toAdminErrorMessage("create this team member") };
  }
}

export async function updateTeamMemberForAdmin(id: string, raw: unknown): Promise<AdminMutationResult<TeamMemberRow>> {
  try {
    await requireAdmin();
  } catch (error) {
    console.error("updateTeamMemberForAdmin: not authorized", error);
    return { ok: false, message: "You must be an admin to do this." };
  }

  const parsed = teamMemberSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error) };

  try {
    const data = await updateTeamMember(id, parsed.data);
    return { ok: true, data };
  } catch (error) {
    console.error("updateTeamMemberForAdmin: update failed", error);
    if (isUniqueViolation(error)) {
      return { ok: false, fieldErrors: { slug: "A team member with this slug already exists." } };
    }
    return { ok: false, message: toAdminErrorMessage("update this team member") };
  }
}

export async function archiveTeamMemberForAdmin(id: string): Promise<AdminGetResult<TeamMemberRow>> {
  try {
    await requireAdmin();
    const data = await archiveTeamMember(id);
    return { ok: true, data };
  } catch (error) {
    console.error("archiveTeamMemberForAdmin: update failed", error);
    return { ok: false, message: toAdminErrorMessage("archive this team member") };
  }
}

export type DeleteResult = { ok: true } | { ok: false; message: string };

/**
 * Module 9M — permanent deletion (spec §17/§21). Reads the row first
 * (for its `image_path`), deletes the database record, then makes a
 * best-effort attempt to remove the associated Storage object
 * (bucket `team`) — a failed Storage cleanup is logged but never
 * reverses the already-successful database delete.
 */
export async function deleteTeamMemberForAdmin(id: string): Promise<DeleteResult> {
  try {
    await requireAdmin();
  } catch (error) {
    console.error("deleteTeamMemberForAdmin: not authorized", error);
    return { ok: false, message: "You must be an admin to do this." };
  }

  const existing = await getTeamMemberById(id).catch(() => null);

  try {
    await deleteTeamMember(id);
  } catch (error) {
    console.error("deleteTeamMemberForAdmin: delete failed", error);
    return { ok: false, message: toAdminErrorMessage("delete this team member") };
  }

  if (existing?.image_path) {
    const cleanup = await deleteMedia("team", existing.image_path);
    if (!cleanup.ok) {
      console.error("deleteTeamMemberForAdmin: Storage cleanup failed", cleanup.message);
    }
  }

  return { ok: true };
}
