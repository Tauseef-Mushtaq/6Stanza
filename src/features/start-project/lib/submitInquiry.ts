import type { ProjectInquiry } from "@/features/start-project/data/inquiry";
import { submitProjectInquiryAction } from "@/features/start-project/actions";

/**
 * Submission boundary for the project-intake form.
 *
 * Module 5: now calls the real `submitProjectInquiryAction` Server
 * Action (`UI → Server Action → validation → service → repository →
 * Supabase`, spec §11) instead of the simulated stub this file used
 * to contain. The contract is unchanged on purpose — `ProjectForm.tsx`
 * (and its loading/error/success states) did not need to change at
 * all for this module, per spec §9/§13's "the backend must adapt to
 * the existing form."
 *
 * Field-level validation errors from the server are surfaced as a
 * generic thrown error here rather than routed back into
 * `InquiryErrors` — `ProjectForm.tsx`'s own client-side
 * `validateInquiry` already runs first and blocks submission before
 * this function is ever called with invalid data, so a server-side
 * field error at this point would mean the two validators have
 * drifted, which is itself the bug to surface (loudly, via the
 * generic error path) rather than silently reconcile.
 */
export async function submitInquiry(inquiry: ProjectInquiry): Promise<void> {
  const result = await submitProjectInquiryAction(inquiry);

  if (!result.ok) {
    throw new Error(result.message ?? "Submission failed — please check the form and try again.");
  }
}
