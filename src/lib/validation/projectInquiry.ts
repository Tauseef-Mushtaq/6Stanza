import { z } from "zod";
import { services } from "@/features/home/data/services";
import { projectStages, timelines, budgetRanges } from "@/features/start-project/data/inquiry";

/**
 * Server-side validation for `/start-project` (spec §10) — mirrors
 * `features/start-project/data/inquiry.ts`'s client-side
 * `validateInquiry` exactly (same required fields, same 20-char
 * message minimum) but is the one that actually matters: this runs in
 * the Server Action (`src/lib/services/projectInquiryService.ts`),
 * server-only, and the client-side check is never trusted alone.
 *
 * Enum fields (`services`, `stage`, `timeline`, `budget`) are
 * validated against the *current* canonical lists — imported directly
 * from the same frontend data files the form itself renders its
 * options from, rather than a hand-duplicated copy that could drift.
 */
const validServiceSlugs = services.map((s) => s.slug) as [string, ...string[]];

export const projectInquirySchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(200),
  email: z.string().trim().min(1, "Enter your email.").email("Enter a valid email address.").max(320),
  company: z.string().trim().max(200).optional().or(z.literal("")),
  projectTitle: z.string().trim().min(1, "Tell us what you're looking to build.").max(200),
  services: z
    .array(z.enum(validServiceSlugs))
    .min(1, "Select at least one service.")
    .max(validServiceSlugs.length),
  stage: z.enum(projectStages).optional(),
  timeline: z.enum(timelines).optional(),
  budget: z.enum(budgetRanges).optional(),
  message: z
    .string()
    .trim()
    .min(20, "Give us a bit more detail — at least a couple of sentences.")
    .max(5000),
  // Honeypot (spec §14): a field no real visitor fills in because it's
  // hidden from the rendered form entirely. Present in the schema so a
  // filled value fails validation cleanly instead of the server
  // needing a separate bot-check branch. No UI currently sets this —
  // wiring a hidden input to it is a one-line addition for whichever
  // module next touches `ProjectForm.tsx`.
  website: z.string().max(0, "Submission rejected.").optional().or(z.literal("")),
});

export type ProjectInquiryInput = z.infer<typeof projectInquirySchema>;
