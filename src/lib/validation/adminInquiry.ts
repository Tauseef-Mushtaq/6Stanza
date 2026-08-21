import { z } from "zod";

/**
 * Module 7A — admin status-update validation, matching the pattern
 * established by `lib/validation/auth.ts`/`lib/validation/projectInquiry.ts`:
 * the Server Action layer (`features/admin/actions.ts`) runs this
 * before anything reaches the service/repository layer, so a status
 * value is never trusted just because it came from a `<select>` the
 * browser rendered (spec §10 — "Do not trust a status sent by the
 * browser").
 *
 * The literal tuple below is the actual `inquiry_status` Postgres enum
 * (`supabase/migrations/0002_contact_inquiries.sql`) spelled out by
 * hand rather than derived from `InquiryStatus` — zod needs a literal
 * tuple for `z.enum`, and keeping this list in sync with the migration
 * is a two-line diff if that enum ever changes.
 */
export const inquiryStatusValues = ["new", "in_progress", "resolved", "archived"] as const;

export const updateInquiryStatusSchema = z.object({
  id: z.string().uuid("Invalid inquiry id."),
  status: z.enum(inquiryStatusValues, { message: "Invalid status." }),
});

export type UpdateInquiryStatusInput = z.infer<typeof updateInquiryStatusSchema>;
