import "server-only";

import { requireAdmin } from "@/lib/auth/session";
import { serviceSchema } from "@/lib/validation/cmsContent";
import {
  listPublishedServices,
  getPublishedServiceBySlug,
  listAllServices,
  getServiceById,
  insertService,
  updateService,
  archiveService,
  deleteService,
  type ServiceRow,
} from "@/lib/repositories/services";
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
 * Service-layer foundation for `services` CMS content (spec §21/§23/
 * §24). No caller yet — Module 9B+ wires these into the admin CRUD UI
 * and the public service pages migrate to `getPublishedServices()`
 * later, per spec §28 ("do not migrate the public frontend yet").
 */

// ---- public reads ----

/** Only returns published rows — RLS enforces this too, this is defense-in-depth, matching spec §7/§23. */
export async function getPublishedServices(): Promise<PublicListResult<ServiceRow>> {
  try {
    const data = await listPublishedServices();
    return { ok: true, data };
  } catch (error) {
    console.error("getPublishedServices: query failed", error);
    return { ok: false, message: toAdminErrorMessage("load services") };
  }
}

export async function getPublishedService(slug: string): Promise<PublicGetResult<ServiceRow>> {
  try {
    const data = await getPublishedServiceBySlug(slug);
    return { ok: true, data };
  } catch (error) {
    console.error("getPublishedService: query failed", error);
    return { ok: false, message: toAdminErrorMessage("load this service") };
  }
}

// ---- admin reads/writes ----

/** Module 9B — optional `status` (spec §6) filters at the repository/database level; see `repositories/services.ts`. */
export async function listAllServicesForAdmin(status?: ContentStatus): Promise<AdminListResult<ServiceRow>> {
  try {
    await requireAdmin();
    const data = await listAllServices(status);
    return { ok: true, data };
  } catch (error) {
    console.error("listAllServicesForAdmin: query failed", error);
    return { ok: false, message: toAdminErrorMessage("load services") };
  }
}

export async function getServiceForAdmin(id: string): Promise<AdminGetResult<ServiceRow>> {
  try {
    await requireAdmin();
    const data = await getServiceById(id);
    return { ok: true, data };
  } catch (error) {
    console.error("getServiceForAdmin: query failed", error);
    return { ok: false, message: toAdminErrorMessage("load this service") };
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

export async function createService(raw: unknown): Promise<AdminMutationResult<ServiceRow>> {
  try {
    await requireAdmin();
  } catch (error) {
    console.error("createService: not authorized", error);
    return { ok: false, message: "You must be an admin to do this." };
  }

  const parsed = serviceSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error) };

  try {
    const data = await insertService(parsed.data);
    return { ok: true, data };
  } catch (error) {
    console.error("createService: insert failed", error);
    if (isUniqueViolation(error)) {
      return { ok: false, fieldErrors: { slug: "A service with this slug already exists." } };
    }
    return { ok: false, message: toAdminErrorMessage("create this service") };
  }
}

export async function updateServiceForAdmin(id: string, raw: unknown): Promise<AdminMutationResult<ServiceRow>> {
  try {
    await requireAdmin();
  } catch (error) {
    console.error("updateServiceForAdmin: not authorized", error);
    return { ok: false, message: "You must be an admin to do this." };
  }

  const parsed = serviceSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error) };

  try {
    const data = await updateService(id, parsed.data);
    return { ok: true, data };
  } catch (error) {
    console.error("updateServiceForAdmin: update failed", error);
    if (isUniqueViolation(error)) {
      return { ok: false, fieldErrors: { slug: "A service with this slug already exists." } };
    }
    return { ok: false, message: toAdminErrorMessage("update this service") };
  }
}

export async function archiveServiceForAdmin(id: string): Promise<AdminGetResult<ServiceRow>> {
  try {
    await requireAdmin();
    const data = await archiveService(id);
    return { ok: true, data };
  } catch (error) {
    console.error("archiveServiceForAdmin: update failed", error);
    return { ok: false, message: toAdminErrorMessage("archive this service") };
  }
}

export type DeleteResult = { ok: true } | { ok: false; message: string };

/**
 * Module 9M — permanent deletion (spec §17/§22), distinct from
 * `archiveServiceForAdmin` above. Reads the row first (for its
 * `media_path`), deletes the database record through the repository,
 * then makes a best-effort attempt to remove the associated Storage
 * object (bucket `general`, per `MediaUploadField`'s use in
 * `ServiceForm`) — a failed Storage cleanup is logged but never
 * reverses the already-successful database delete, the same
 * failure-mode ordering `removeProjectGalleryImage` already
 * established in Module 9K.
 */
export async function deleteServiceForAdmin(id: string): Promise<DeleteResult> {
  try {
    await requireAdmin();
  } catch (error) {
    console.error("deleteServiceForAdmin: not authorized", error);
    return { ok: false, message: "You must be an admin to do this." };
  }

  const existing = await getServiceById(id).catch(() => null);

  try {
    await deleteService(id);
  } catch (error) {
    console.error("deleteServiceForAdmin: delete failed", error);
    return { ok: false, message: toAdminErrorMessage("delete this service") };
  }

  if (existing?.media_path) {
    const cleanup = await deleteMedia("general", existing.media_path);
    if (!cleanup.ok) {
      console.error("deleteServiceForAdmin: Storage cleanup failed", cleanup.message);
    }
  }

  return { ok: true };
}
