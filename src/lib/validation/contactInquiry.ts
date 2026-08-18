import { z } from "zod";

/**
 * Server-side validation for `contact_inquiries` (spec §8/§10).
 *
 * IMPORTANT — there is currently no contact form in this codebase's
 * frontend to validate against: `/contact` (`ContactDetails.tsx`)
 * explicitly documents, in its own comment, that it deliberately has
 * no form and instead points visitors to `/start-project`. See
 * MODULE-5-HANDOFF.md's "Forms" section for the full explanation of
 * why this schema/table/repository/service exist without a form
 * calling them yet, rather than this module fabricating a new form UI
 * (out of scope per spec §23 — "preserve the frontend").
 */
export const contactInquirySchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(200),
  email: z.string().trim().min(1, "Enter your email.").email("Enter a valid email address.").max(320),
  message: z.string().trim().min(1, "Enter a message.").max(5000),
  // Honeypot — see projectInquiry.ts's identical field for rationale.
  website: z.string().max(0, "Submission rejected.").optional().or(z.literal("")),
});

export type ContactInquiryInput = z.infer<typeof contactInquirySchema>;
