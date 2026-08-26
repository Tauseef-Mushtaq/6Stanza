import "server-only";

import { requireAdmin } from "@/lib/auth/session";
import { testimonialSchema } from "@/lib/validation/cmsContent";
import {
  listPublishedTestimonials,
  listAllTestimonials,
  getTestimonialById,
  insertTestimonial,
  updateTestimonial,
  archiveTestimonial,
  deleteTestimonial,
  type TestimonialRow,
} from "@/lib/repositories/testimonials";
import { deleteMedia } from "@/lib/services/mediaService";
import type { ContentStatus } from "@/lib/supabase/database.types";
import type { PublicListResult, AdminListResult, AdminGetResult, AdminMutationResult } from "./cmsContentTypes";
import { toAdminErrorMessage } from "./cmsContentTypes";

/**
 * MODULE-TESTIMONIAL-1 — service layer for `testimonials`, same
 * layering as `serviceContentService.ts`: UI → Server Action →
 * validation/`requireAdmin` (here) → repository → Supabase + RLS.
 * No `isUniqueViolation` handling — unlike Services/Projects/Team/
 * Insights, testimonials have no unique `slug` constraint to collide on.
 */

// ---- public reads ----

export async function getPublishedTestimonials(): Promise<PublicListResult<TestimonialRow>> {
  try {
    const data = await listPublishedTestimonials();
    return { ok: true, data };
  } catch (error) {
    console.error("getPublishedTestimonials: query failed", error);
    return { ok: false, message: toAdminErrorMessage("load testimonials") };
  }
}

// ---- admin reads/writes ----

export async function listAllTestimonialsForAdmin(status?: ContentStatus): Promise<AdminListResult<TestimonialRow>> {
  try {
    await requireAdmin();
    const data = await listAllTestimonials(status);
    return { ok: true, data };
  } catch (error) {
    console.error("listAllTestimonialsForAdmin: query failed", error);
    return { ok: false, message: toAdminErrorMessage("load testimonials") };
  }
}

export async function getTestimonialForAdmin(id: string): Promise<AdminGetResult<TestimonialRow>> {
  try {
    await requireAdmin();
    const data = await getTestimonialById(id);
    return { ok: true, data };
  } catch (error) {
    console.error("getTestimonialForAdmin: query failed", error);
    return { ok: false, message: toAdminErrorMessage("load this testimonial") };
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

export async function createTestimonial(raw: unknown): Promise<AdminMutationResult<TestimonialRow>> {
  try {
    await requireAdmin();
  } catch (error) {
    console.error("createTestimonial: not authorized", error);
    return { ok: false, message: "You must be an admin to do this." };
  }

  const parsed = testimonialSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error) };

  try {
    const data = await insertTestimonial(parsed.data);
    return { ok: true, data };
  } catch (error) {
    console.error("createTestimonial: insert failed", error);
    return { ok: false, message: toAdminErrorMessage("create this testimonial") };
  }
}

export async function updateTestimonialForAdmin(id: string, raw: unknown): Promise<AdminMutationResult<TestimonialRow>> {
  try {
    await requireAdmin();
  } catch (error) {
    console.error("updateTestimonialForAdmin: not authorized", error);
    return { ok: false, message: "You must be an admin to do this." };
  }

  const parsed = testimonialSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error) };

  try {
    const data = await updateTestimonial(id, parsed.data);
    return { ok: true, data };
  } catch (error) {
    console.error("updateTestimonialForAdmin: update failed", error);
    return { ok: false, message: toAdminErrorMessage("update this testimonial") };
  }
}

export async function archiveTestimonialForAdmin(id: string): Promise<AdminGetResult<TestimonialRow>> {
  try {
    await requireAdmin();
    const data = await archiveTestimonial(id);
    return { ok: true, data };
  } catch (error) {
    console.error("archiveTestimonialForAdmin: update failed", error);
    return { ok: false, message: toAdminErrorMessage("archive this testimonial") };
  }
}

export type DeleteResult = { ok: true } | { ok: false; message: string };

/**
 * Permanent deletion, mirrors `deleteServiceForAdmin`: reads the row
 * first (for `image_path`), deletes the database record, then makes a
 * best-effort attempt to remove the associated Storage object from the
 * `general` bucket — a failed Storage cleanup is logged but never
 * reverses the already-successful database delete.
 */
export async function deleteTestimonialForAdmin(id: string): Promise<DeleteResult> {
  try {
    await requireAdmin();
  } catch (error) {
    console.error("deleteTestimonialForAdmin: not authorized", error);
    return { ok: false, message: "You must be an admin to do this." };
  }

  const existing = await getTestimonialById(id).catch(() => null);

  try {
    await deleteTestimonial(id);
  } catch (error) {
    console.error("deleteTestimonialForAdmin: delete failed", error);
    return { ok: false, message: toAdminErrorMessage("delete this testimonial") };
  }

  if (existing?.image_path) {
    const cleanup = await deleteMedia("general", existing.image_path);
    if (!cleanup.ok) {
      console.error("deleteTestimonialForAdmin: Storage cleanup failed", cleanup.message);
    }
  }

  return { ok: true };
}
