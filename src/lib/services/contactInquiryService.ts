import "server-only";

import { contactInquirySchema } from "@/lib/validation/contactInquiry";
import { insertContactInquiry } from "@/lib/repositories/contactInquiries";
import type { SubmitProjectInquiryResult } from "./projectInquiryService";

export type SubmitContactInquiryResult = SubmitProjectInquiryResult;

/** Same shape/behavior as `submitProjectInquiry` — see that file's doc comment. No caller yet; see `lib/validation/contactInquiry.ts`. */
export async function submitContactInquiry(raw: unknown): Promise<SubmitContactInquiryResult> {
  const parsed = contactInquirySchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !(key in fieldErrors)) fieldErrors[key] = issue.message;
    }
    return { ok: false, fieldErrors };
  }

  if (parsed.data.website) {
    return { ok: true };
  }

  try {
    await insertContactInquiry(parsed.data);
    return { ok: true };
  } catch (error) {
    console.error("submitContactInquiry: insert failed", error);
    return { ok: false, message: "Unable to send your message. Please try again." };
  }
}
