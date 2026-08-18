import "server-only";

import { projectInquirySchema } from "@/lib/validation/projectInquiry";
import { insertProjectInquiry } from "@/lib/repositories/projectInquiries";

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

  try {
    await insertProjectInquiry(parsed.data);
    return { ok: true };
  } catch (error) {
    console.error("submitProjectInquiry: insert failed", error);
    return { ok: false, message: "Unable to submit your inquiry. Please try again." };
  }
}
