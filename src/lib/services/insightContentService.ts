import "server-only";

import { requireAdmin } from "@/lib/auth/session";
import { insightSchema } from "@/lib/validation/cmsContent";
import {
  listPublishedInsights,
  getPublishedInsightBySlug,
  listAllInsights,
  getInsightById,
  insertInsight,
  updateInsight,
  archiveInsight,
  deleteInsight,
  type InsightRow,
} from "@/lib/repositories/insights";
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

/**
 * Service layer for `insights` CMS content — same conventions as
 * `serviceContentService.ts`/`teamContentService.ts`. Module 9E wires
 * this up to the `/admin/insights` admin UI (`src/features/admin/actions.ts`).
 */

// ---- public reads ----

export async function getPublishedInsights(): Promise<PublicListResult<InsightRow>> {
  try {
    const data = await listPublishedInsights();
    return { ok: true, data };
  } catch (error) {
    console.error("getPublishedInsights: query failed", error);
    return { ok: false, message: toAdminErrorMessage("load insights") };
  }
}

export async function getPublishedInsight(slug: string): Promise<PublicGetResult<InsightRow>> {
  try {
    const data = await getPublishedInsightBySlug(slug);
    return { ok: true, data };
  } catch (error) {
    console.error("getPublishedInsight: query failed", error);
    return { ok: false, message: toAdminErrorMessage("load this insight") };
  }
}

// ---- admin reads/writes ----

export async function listAllInsightsForAdmin(status?: ContentStatus): Promise<AdminListResult<InsightRow>> {
  try {
    await requireAdmin();
    const data = await listAllInsights(status);
    return { ok: true, data };
  } catch (error) {
    console.error("listAllInsightsForAdmin: query failed", error);
    return { ok: false, message: toAdminErrorMessage("load insights") };
  }
}

export async function getInsightForAdmin(id: string): Promise<AdminGetResult<InsightRow>> {
  try {
    await requireAdmin();
    const data = await getInsightById(id);
    return { ok: true, data };
  } catch (error) {
    console.error("getInsightForAdmin: query failed", error);
    return { ok: false, message: toAdminErrorMessage("load this insight") };
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

export async function createInsight(raw: unknown): Promise<AdminMutationResult<InsightRow>> {
  try {
    await requireAdmin();
  } catch (error) {
    console.error("createInsight: not authorized", error);
    return { ok: false, message: "You must be an admin to do this." };
  }

  const parsed = insightSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error) };

  try {
    const data = await insertInsight(parsed.data);
    return { ok: true, data };
  } catch (error) {
    console.error("createInsight: insert failed", error);
    if (isUniqueViolation(error)) {
      return { ok: false, fieldErrors: { slug: "An insight with this identifier already exists." } };
    }
    return { ok: false, message: toAdminErrorMessage("create this insight") };
  }
}

export async function updateInsightForAdmin(id: string, raw: unknown): Promise<AdminMutationResult<InsightRow>> {
  try {
    await requireAdmin();
  } catch (error) {
    console.error("updateInsightForAdmin: not authorized", error);
    return { ok: false, message: "You must be an admin to do this." };
  }

  const parsed = insightSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error) };

  try {
    const data = await updateInsight(id, parsed.data);
    return { ok: true, data };
  } catch (error) {
    console.error("updateInsightForAdmin: update failed", error);
    if (isUniqueViolation(error)) {
      return { ok: false, fieldErrors: { slug: "An insight with this identifier already exists." } };
    }
    return { ok: false, message: toAdminErrorMessage("update this insight") };
  }
}

export async function archiveInsightForAdmin(id: string): Promise<AdminGetResult<InsightRow>> {
  try {
    await requireAdmin();
    const data = await archiveInsight(id);
    return { ok: true, data };
  } catch (error) {
    console.error("archiveInsightForAdmin: update failed", error);
    return { ok: false, message: toAdminErrorMessage("archive this insight") };
  }
}

export type DeleteResult = { ok: true } | { ok: false; message: string };

/**
 * Module 9M — permanent deletion (spec §17/§23). Reads the row first
 * (for its `media_path`), deletes the database record, then makes a
 * best-effort attempt to remove the associated Storage object
 * (bucket `insights`) — a failed Storage cleanup is logged but never
 * reverses the already-successful database delete. After this, a
 * request for the deleted slug simply finds no matching row, so
 * `/insights/[slug]`'s existing `notFound()` path is unaffected.
 */
export async function deleteInsightForAdmin(id: string): Promise<DeleteResult> {
  try {
    await requireAdmin();
  } catch (error) {
    console.error("deleteInsightForAdmin: not authorized", error);
    return { ok: false, message: "You must be an admin to do this." };
  }

  const existing = await getInsightById(id).catch(() => null);

  try {
    await deleteInsight(id);
  } catch (error) {
    console.error("deleteInsightForAdmin: delete failed", error);
    return { ok: false, message: toAdminErrorMessage("delete this insight") };
  }

  if (existing?.media_path) {
    const cleanup = await deleteMedia("insights", existing.media_path);
    if (!cleanup.ok) {
      console.error("deleteInsightForAdmin: Storage cleanup failed", cleanup.message);
    }
  }

  return { ok: true };
}
