import "server-only";

import { projectInquirySchema } from "@/lib/validation/projectInquiry";
import {
  insertProjectInquiry,
  listProjectInquiries,
  getProjectInquiry,
  updateProjectInquiryStatus,
  type ProjectInquiryRow,
} from "@/lib/repositories/projectInquiries";
import type { InquiryStatus } from "@/lib/supabase/database.types";
import type { AdminListResult, AdminGetResult, AdminUpdateResult } from "./contactInquiryService";
import { sendProjectInquiryNotifications } from "@/lib/notifications/inquiryNotifications";

export type SubmitProjectInquiryResult =
  | { ok: true }
  | { ok: false; fieldErrors: Partial<Record<string, string>>; message?: undefined }
  | { ok: false; message: string; fieldErrors?: undefined };

/**
 * `UI → Server Action → validation → service → repository → Supabase`
 * (spec §11), this is the "validation → service" link: the one place
 * that decides what a validation failure vs. a database failure looks
 * like to the caller, so `ProjectForm.tsx` (unchanged by this module)
 * gets a shape it can already render — field errors map onto
 * `InquiryErrors`, top-level `message` onto the existing submit-error
 * banner.
 *
 * Never rethrows the raw Supabase/Postgres error (spec §12) — logs it
 * server-side (`console.error` here; swap for real
 * logging/monitoring in a later module) and returns a generic message
 * instead.
 */
export async function submitProjectInquiry(raw: unknown): Promise<SubmitProjectInquiryResult> {
  const parsed = projectInquirySchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !(key in fieldErrors)) fieldErrors[key] = issue.message;
    }
    return { ok: false, fieldErrors };
  }

  // Honeypot tripped — pretend success (don't tip off the bot) rather
  // than surfacing a validation error for a field real users never see.
  if (parsed.data.website) {
    return { ok: true };
  }

  let inserted: ProjectInquiryRow;
  try {
    inserted = await insertProjectInquiry(parsed.data);
  } catch (error) {
    console.error("submitProjectInquiry: insert failed", error);
    return { ok: false, message: "Unable to submit your inquiry. Please try again." };
  }

  // save inquiry → attempt notifications → log result → return successful
  // inquiry result. The insert above has already committed by this point,
  // so nothing past here can turn a successful submission into a failed
  // one: `sendProjectInquiryNotifications` never throws (see its own
  // doc comment) and its outcome is only logged, not surfaced to the
  // caller/`ProjectForm.tsx`.
  try {
    const outcome = await sendProjectInquiryNotifications(inserted);
    if (outcome.attempted && outcome.errors.length > 0) {
      console.warn("submitProjectInquiry: inquiry saved, notification had issues", {
        inquiryId: inserted.id,
        outcome,
      });
    }
  } catch (error) {
    // Belt-and-suspenders: sendProjectInquiryNotifications is written to
    // never throw, but a saved inquiry must survive even if that
    // guarantee is ever broken by a future edit.
    console.error("submitProjectInquiry: notification step threw unexpectedly", { inquiryId: inserted.id, error });
  }

  return { ok: true };
}

/** Module 7A — admin read path. Same rationale as `contactInquiryService`'s equivalents. */
export async function listProjectInquiriesForAdmin(status?: InquiryStatus): Promise<AdminListResult<ProjectInquiryRow>> {
  try {
    const data = await listProjectInquiries(status);
    return { ok: true, data };
  } catch (error) {
    console.error("listProjectInquiriesForAdmin: query failed", error);
    return { ok: false, message: "Unable to load project inquiries. Please try again." };
  }
}

export async function getProjectInquiryForAdmin(id: string): Promise<AdminGetResult<ProjectInquiryRow>> {
  try {
    const data = await getProjectInquiry(id);
    return { ok: true, data };
  } catch (error) {
    console.error("getProjectInquiryForAdmin: query failed", error);
    return { ok: false, message: "Unable to load this inquiry. Please try again." };
  }
}

export async function updateProjectInquiryStatusForAdmin(
  id: string,
  status: InquiryStatus
): Promise<AdminUpdateResult<ProjectInquiryRow>> {
  try {
    const data = await updateProjectInquiryStatus(id, status);
    return { ok: true, data };
  } catch (error) {
    console.error("updateProjectInquiryStatusForAdmin: update failed", error);
    return { ok: false, message: "Unable to update this inquiry's status. Please try again." };
  }
}
