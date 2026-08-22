"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { updateInquiryStatusSchema } from "@/lib/validation/adminInquiry";
import { updateContactInquiryStatusForAdmin } from "@/lib/services/contactInquiryService";
import { updateProjectInquiryStatusForAdmin } from "@/lib/services/projectInquiryService";
import {
  createService,
  updateServiceForAdmin,
  archiveServiceForAdmin,
  deleteServiceForAdmin,
} from "@/lib/services/serviceContentService";
import {
  createProject,
  updateProjectForAdmin,
  archiveProjectForAdmin,
  deleteProjectForAdmin,
} from "@/lib/services/projectContentService";
import {
  createTeamMember,
  updateTeamMemberForAdmin,
  archiveTeamMemberForAdmin,
  deleteTeamMemberForAdmin,
} from "@/lib/services/teamContentService";
import {
  createInsight,
  updateInsightForAdmin,
  archiveInsightForAdmin,
  deleteInsightForAdmin,
} from "@/lib/services/insightContentService";
import { uploadMedia, deleteMedia } from "@/lib/services/mediaService";
import type { PublicMediaBucket } from "@/lib/cms/storage";
import {
  addProjectGalleryImage,
  removeProjectGalleryImage,
  reorderProjectGallery,
} from "@/lib/services/projectMediaService";
import { updateUserRoleForAdmin, deleteUserForAdmin } from "@/lib/services/userManagementService";
import { updateUserRoleSchema, deleteUserSchema } from "@/lib/validation/adminUser";
import type { ServiceRow } from "@/lib/repositories/services";
import type { ProjectRow } from "@/lib/repositories/projects";
import type { TeamMemberRow } from "@/lib/repositories/teamMembers";
import type { InsightRow } from "@/lib/repositories/insights";
import type { ProjectMediaRow } from "@/lib/repositories/projectMedia";

export type UpdateInquiryStatusActionResult = { ok: true } | { ok: false; message: string };

/**
 * Module 7A — the only mutating path in the admin area (spec §10):
 *
 *   Admin UI → Server Action (this file) → requireAdmin() →
 *   validate inquiry ID + status → service → repository → Supabase
 *
 * `requireAdmin()` runs first and throws for anyone who isn't an
 * authenticated admin — a normal authenticated user invoking this
 * action directly (bypassing the UI) gets the same rejection a
 * browser click would, satisfying spec §10/§12's "a normal
 * authenticated user must not be able to use the server action
 * successfully." The `project_inquiries_update_admin_only`/
 * `contact_inquiries_update_admin_only` RLS policies are the second,
 * independent layer underneath this — even a bug here couldn't grant
 * a write the database itself would refuse.
 *
 * `type` selects which table/service to call; kept as a plain
 * discriminant argument rather than two separate actions so the one
 * `StatusSelect` client component (`features/admin/components/StatusSelect.tsx`)
 * can call either kind of inquiry through the same prop.
 */
export async function updateInquiryStatusAction(
  type: "contact" | "project",
  input: { id: string; status: string }
): Promise<UpdateInquiryStatusActionResult> {
  await requireAdmin();

  const parsed = updateInquiryStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid request." };
  }

  const result =
    type === "contact"
      ? await updateContactInquiryStatusForAdmin(parsed.data.id, parsed.data.status)
      : await updateProjectInquiryStatusForAdmin(parsed.data.id, parsed.data.status);

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  // Refreshes the server-rendered list/detail so the new status shows
  // without a full page reload (spec §11 — "do not require a full-page
  // reload merely to reflect the updated status").
  revalidatePath("/admin/inquiries");
  revalidatePath(`/admin/inquiries/${type}/${parsed.data.id}`);

  return { ok: true };
}

// ---------------------------------------------------------------------
// Module 9B — Services CMS Server Actions.
//
//   Admin UI (ServiceForm/ArchiveServiceButton)
//     ↓
//   Server Action (this file)
//     ↓ requireAdmin() — happens again inside the service layer too;
//       this call here is the same defense-in-depth relationship
//       updateInquiryStatusAction already has with RLS above, just
//       for the CMS write paths (spec §13/§14).
//   src/lib/services/serviceContentService.ts (validation + requireAdmin)
//     ↓
//   src/lib/repositories/services.ts
//     ↓
//   Supabase + RLS (services_insert_admin_only / _update_admin_only)
//
// None of these accept a `FormData` — the client form (`ServiceForm`)
// keeps its fields as plain React state (same pattern as the existing
// `ProjectForm`) and passes a plain object, so array fields
// (tags/capabilities/architecture/principles) don't need any
// FormData-specific parsing.
// ---------------------------------------------------------------------

export type ServiceActionResult =
  | { ok: true; data: ServiceRow }
  | { ok: false; fieldErrors: Record<string, string>; message?: undefined }
  | { ok: false; message: string; fieldErrors?: undefined };

function revalidateServicePaths(id?: string) {
  revalidatePath("/admin/services");
  if (id) revalidatePath(`/admin/services/${id}`);
}

// Note: `createService`/`updateServiceForAdmin`/`archiveServiceForAdmin`
// each already call `requireAdmin()` themselves (see
// `serviceContentService.ts`) — these wrappers don't call it a second
// time, they just add the `revalidatePath` step the service layer
// itself has no reason to know about.

export async function createServiceAction(raw: unknown): Promise<ServiceActionResult> {
  const result = await createService(raw);
  if (result.ok) revalidateServicePaths(result.data.id);
  return result;
}

export async function updateServiceAction(id: string, raw: unknown): Promise<ServiceActionResult> {
  const result = await updateServiceForAdmin(id, raw);
  if (result.ok) revalidateServicePaths(id);
  return result;
}

export type ArchiveServiceActionResult = { ok: true; data: ServiceRow | null } | { ok: false; message: string };

export async function archiveServiceAction(id: string): Promise<ArchiveServiceActionResult> {
  const result = await archiveServiceForAdmin(id);
  if (result.ok) revalidateServicePaths(id);
  return result;
}

export type DeleteServiceActionResult = { ok: true } | { ok: false; message: string };

/**
 * Module 9M — permanent deletion (spec §17–§19), distinct from
 * `archiveServiceAction`. Revalidates the list page (so the deleted
 * row disappears immediately) but not the now-gone detail page —
 * the admin UI navigates away from it right after this succeeds.
 */
export async function deleteServiceAction(id: string): Promise<DeleteServiceActionResult> {
  const result = await deleteServiceForAdmin(id);
  if (result.ok) revalidateServicePaths();
  return result;
}

// ---------------------------------------------------------------------
// Module 9C — Projects CMS Server Actions. Same chain as the Services
// actions above:
//
//   Admin UI (ProjectForm/ArchiveProjectButton)
//     ↓
//   Server Action (this file)
//     ↓ requireAdmin() happens inside the service layer (defense-in-depth)
//   src/lib/services/projectContentService.ts (validation + requireAdmin)
//     ↓
//   src/lib/repositories/projects.ts
//     ↓
//   Supabase + RLS (projects_insert_admin_only / _update_admin_only)
// ---------------------------------------------------------------------

export type ProjectActionResult =
  | { ok: true; data: ProjectRow }
  | { ok: false; fieldErrors: Record<string, string>; message?: undefined }
  | { ok: false; message: string; fieldErrors?: undefined };

function revalidateProjectPaths(id?: string) {
  revalidatePath("/admin/projects");
  if (id) revalidatePath(`/admin/projects/${id}`);
}

export async function createProjectAction(raw: unknown): Promise<ProjectActionResult> {
  const result = await createProject(raw);
  if (result.ok) revalidateProjectPaths(result.data.id);
  return result;
}

export async function updateProjectAction(id: string, raw: unknown): Promise<ProjectActionResult> {
  const result = await updateProjectForAdmin(id, raw);
  if (result.ok) revalidateProjectPaths(id);
  return result;
}

export type ArchiveProjectActionResult = { ok: true; data: ProjectRow | null } | { ok: false; message: string };

export async function archiveProjectAction(id: string): Promise<ArchiveProjectActionResult> {
  const result = await archiveProjectForAdmin(id);
  if (result.ok) revalidateProjectPaths(id);
  return result;
}

export type DeleteProjectActionResult = { ok: true } | { ok: false; message: string };

/**
 * Module 9M — permanent deletion (spec §17/§20). `deleteProjectForAdmin`
 * already handles the `project_media` cascade + gallery/single-image
 * Storage cleanup; this wrapper only adds the revalidation step.
 */
export async function deleteProjectAction(id: string): Promise<DeleteProjectActionResult> {
  const result = await deleteProjectForAdmin(id);
  if (result.ok) revalidateProjectPaths();
  return result;
}

// ---------------------------------------------------------------------
// Module 9D — Team CMS Server Actions. Same chain as Services/Projects:
//
//   Admin UI (TeamMemberForm/ArchiveTeamMemberButton)
//     ↓
//   Server Action (this file)
//     ↓ requireAdmin() happens inside the service layer (defense-in-depth)
//   src/lib/services/teamContentService.ts (validation + requireAdmin)
//     ↓
//   src/lib/repositories/teamMembers.ts
//     ↓
//   Supabase + RLS (team_members_insert_admin_only / _update_admin_only)
// ---------------------------------------------------------------------

export type TeamMemberActionResult =
  | { ok: true; data: TeamMemberRow }
  | { ok: false; fieldErrors: Record<string, string>; message?: undefined }
  | { ok: false; message: string; fieldErrors?: undefined };

function revalidateTeamMemberPaths(id?: string) {
  revalidatePath("/admin/team");
  if (id) revalidatePath(`/admin/team/${id}`);
}

export async function createTeamMemberAction(raw: unknown): Promise<TeamMemberActionResult> {
  const result = await createTeamMember(raw);
  if (result.ok) revalidateTeamMemberPaths(result.data.id);
  return result;
}

export async function updateTeamMemberAction(id: string, raw: unknown): Promise<TeamMemberActionResult> {
  const result = await updateTeamMemberForAdmin(id, raw);
  if (result.ok) revalidateTeamMemberPaths(id);
  return result;
}

export type ArchiveTeamMemberActionResult = { ok: true; data: TeamMemberRow | null } | { ok: false; message: string };

export async function archiveTeamMemberAction(id: string): Promise<ArchiveTeamMemberActionResult> {
  const result = await archiveTeamMemberForAdmin(id);
  if (result.ok) revalidateTeamMemberPaths(id);
  return result;
}

export type DeleteTeamMemberActionResult = { ok: true } | { ok: false; message: string };

/**
 * Module 9M — permanent deletion (spec §17/§19/§21), distinct from
 * `archiveTeamMemberAction`. Only revalidates the admin list, not any
 * public path: every public route already reads through
 * `createSupabaseServerClient()`, which calls `cookies()` per
 * request — that alone opts Next.js out of static rendering for
 * those routes (confirmed by the "Dynamic server usage... used
 * cookies" build output already present since Module 9K), so they
 * re-fetch fresh data on every request with no cache to invalidate.
 * No other create/update/archive action in this file revalidates a
 * public path either, for the same reason (spec §27's "verify
 * whether an explicit invalidation is actually necessary before
 * adding one").
 */
export async function deleteTeamMemberAction(id: string): Promise<DeleteTeamMemberActionResult> {
  const result = await deleteTeamMemberForAdmin(id);
  if (result.ok) revalidateTeamMemberPaths();
  return result;
}

// ---------------------------------------------------------------------
// Module 9E — Insights CMS Server Actions. Same chain as Services/
// Projects/Team:
//
//   Admin UI (InsightForm/ArchiveInsightButton)
//     ↓
//   Server Action (this file)
//     ↓ requireAdmin() happens inside the service layer (defense-in-depth)
//   src/lib/services/insightContentService.ts (validation + requireAdmin)
//     ↓
//   src/lib/repositories/insights.ts
//     ↓
//   Supabase + RLS (insights_insert_admin_only / _update_admin_only)
// ---------------------------------------------------------------------

export type InsightActionResult =
  | { ok: true; data: InsightRow }
  | { ok: false; fieldErrors: Record<string, string>; message?: undefined }
  | { ok: false; message: string; fieldErrors?: undefined };

function revalidateInsightPaths(id?: string) {
  revalidatePath("/admin/insights");
  if (id) revalidatePath(`/admin/insights/${id}`);
}

export async function createInsightAction(raw: unknown): Promise<InsightActionResult> {
  const result = await createInsight(raw);
  if (result.ok) revalidateInsightPaths(result.data.id);
  return result;
}

export async function updateInsightAction(id: string, raw: unknown): Promise<InsightActionResult> {
  const result = await updateInsightForAdmin(id, raw);
  if (result.ok) revalidateInsightPaths(id);
  return result;
}

export type ArchiveInsightActionResult = { ok: true; data: InsightRow | null } | { ok: false; message: string };

export async function archiveInsightAction(id: string): Promise<ArchiveInsightActionResult> {
  const result = await archiveInsightForAdmin(id);
  if (result.ok) revalidateInsightPaths(id);
  return result;
}

export type DeleteInsightActionResult = { ok: true } | { ok: false; message: string };

/**
 * Module 9M — permanent deletion (spec §17/§19/§23). Only
 * revalidates the admin list — see `deleteTeamMemberAction`'s comment
 * above for why public paths don't need it here either.
 */
export async function deleteInsightAction(id: string): Promise<DeleteInsightActionResult> {
  const result = await deleteInsightForAdmin(id);
  if (result.ok) revalidateInsightPaths();
  return result;
}

// ---------------------------------------------------------------------
// Module 9K — CMS media upload Server Actions (spec §9/§29).
//
//   MediaUploadField (client)
//     ↓ FormData({ bucket, file })
//   uploadMediaAction (this file)
//     ↓ validates `bucket` against the fixed allow-list below —
//       never trusts the string the client sent beyond that check
//   lib/services/mediaService.ts (requireAdmin() + validateImageFile())
//     ↓
//   lib/cms/storage.ts
//     ↓
//   Supabase Storage + RLS (storage_admin_write / _admin_delete)
//
// `File` objects can only cross a Server Action boundary inside
// `FormData` (a plain object argument can't carry binary data the way
// the CMS content actions above carry arrays/strings), so these two
// actions are the one place in this module that takes `FormData`
// instead of a plain object.
// ---------------------------------------------------------------------

const UPLOADABLE_BUCKETS = ["team", "projects", "insights", "general"] as const;

function parseBucket(value: FormDataEntryValue | null): PublicMediaBucket | null {
  if (typeof value !== "string") return null;
  return (UPLOADABLE_BUCKETS as readonly string[]).includes(value) ? (value as PublicMediaBucket) : null;
}

export type UploadMediaActionResult = { ok: true; path: string } | { ok: false; message: string };

/**
 * Single-image upload used by `MediaUploadField` for the Service/
 * Project/Team/Insight forms' own `mediaPath`/`imagePath` field. Does
 * NOT write any database row — the resulting `path` is handed back to
 * the calling form's local state and only persisted when the admin
 * saves that CMS record through its normal `create*Action`/
 * `update*Action` (spec §26 Option A: "upload immediately, then save
 * the media reference when the CMS form is saved" — chosen here
 * because these fields belong to a record that may not exist yet in
 * create mode, unlike the Project gallery below).
 */
export async function uploadMediaAction(formData: FormData): Promise<UploadMediaActionResult> {
  const bucket = parseBucket(formData.get("bucket"));
  if (!bucket) return { ok: false, message: "Invalid upload target." };

  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, message: "No file was provided." };

  return uploadMedia(bucket, file);
}

export type DeleteMediaActionResult = { ok: true } | { ok: false; message: string };

/**
 * Best-effort single-object removal, used by `MediaUploadField`'s
 * Replace/Remove controls to clean up the *previous* file before (or
 * after) a new one takes its place in form state. Never fails the
 * calling form's save if this returns `ok: false` — see
 * `MediaUploadField.tsx` and MODULE-9K-HANDOFF.md §K.
 */
export async function deleteMediaAction(bucket: string, path: string): Promise<DeleteMediaActionResult> {
  const parsedBucket = parseBucket(bucket);
  if (!parsedBucket) return { ok: false, message: "Invalid upload target." };
  return deleteMedia(parsedBucket, path);
}

// ---------------------------------------------------------------------
// Module 9K — Project gallery Server Actions (spec §12/§13/§21).
//
// Unlike the single-image actions above, these DO persist immediately
// (spec §26 Option B) — see `projectMediaService.ts`'s header comment
// for why that's safe here specifically (gallery rows require an
// already-saved project, so there's no unsaved-parent edge case to
// worry about).
// ---------------------------------------------------------------------

export type AddProjectGalleryImageActionResult = { ok: true; data: ProjectMediaRow } | { ok: false; message: string };

export async function addProjectGalleryImageAction(
  projectId: string,
  formData: FormData
): Promise<AddProjectGalleryImageActionResult> {
  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, message: "No file was provided." };
  const altText = formData.get("altText");

  const result = await addProjectGalleryImage(projectId, file, typeof altText === "string" ? altText : undefined);
  if (result.ok) revalidateProjectPaths(projectId);
  return result;
}

export type RemoveProjectGalleryImageActionResult = { ok: true } | { ok: false; message: string };

export async function removeProjectGalleryImageAction(
  projectId: string,
  mediaId: string
): Promise<RemoveProjectGalleryImageActionResult> {
  const result = await removeProjectGalleryImage(mediaId);
  if (result.ok) revalidateProjectPaths(projectId);
  return result;
}

export type ReorderProjectGalleryActionResult = { ok: true; data: ProjectMediaRow[] } | { ok: false; message: string };

export async function reorderProjectGalleryAction(
  projectId: string,
  orderedIds: string[]
): Promise<ReorderProjectGalleryActionResult> {
  const result = await reorderProjectGallery(projectId, orderedIds);
  if (result.ok) revalidateProjectPaths(projectId);
  return result;
}

// ---------------------------------------------------------------------
// User Management Server Actions.
//
//   Admin UI (UserRoleSelect/DeleteUserButton) → Server Action (below)
//   → requireAdmin() → validate → userManagementService → Supabase
//
// Same shape/authorization pattern as every action above: `requireAdmin()`
// runs first and throws for anyone who isn't an authenticated admin,
// then the input is validated with zod before it ever reaches the
// service layer (spec — "never trust a role/id sent by the browser").
// `profile.id` from that same `requireAdmin()` call is threaded through
// as `actingAdminId` so the service layer can refuse a self-role-change
// or self-delete (see `userManagementService.ts` for why that matters).
// ---------------------------------------------------------------------

export type UpdateUserRoleActionResult = { ok: true } | { ok: false; message: string };

export async function updateUserRoleAction(input: { userId: string; role: string }): Promise<UpdateUserRoleActionResult> {
  const profile = await requireAdmin();

  const parsed = updateUserRoleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid request." };
  }

  const result = await updateUserRoleForAdmin(profile.id, parsed.data.userId, parsed.data.role);
  if (!result.ok) return result;

  revalidatePath("/admin/users");
  return { ok: true };
}

export type DeleteUserActionResult = { ok: true } | { ok: false; message: string };

export async function deleteUserAction(input: { userId: string }): Promise<DeleteUserActionResult> {
  const profile = await requireAdmin();

  const parsed = deleteUserSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid request." };
  }

  const result = await deleteUserForAdmin(profile.id, parsed.data.userId);
  if (!result.ok) return result;

  revalidatePath("/admin/users");
  return { ok: true };
}
