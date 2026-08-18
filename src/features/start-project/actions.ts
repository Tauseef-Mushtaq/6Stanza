"use server";

import { submitProjectInquiry } from "@/lib/services/projectInquiryService";
import type { ProjectInquiry } from "@/features/start-project/data/inquiry";

/**
 * The Server Action boundary for `/start-project` (spec §11's "UI →
 * Server Action" step). Thin on purpose — `submitProjectInquiry`
 * (`lib/services/projectInquiryService.ts`) owns validation/error
 * mapping, this just adapts that result to the shape
 * `submitInquiry.ts` (unchanged contract) expects.
 */
export async function submitProjectInquiryAction(inquiry: ProjectInquiry) {
  return submitProjectInquiry(inquiry);
}
