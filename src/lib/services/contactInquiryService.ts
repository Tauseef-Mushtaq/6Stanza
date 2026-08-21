import "server-only";

import { contactInquirySchema } from "@/lib/validation/contactInquiry";
import {
  insertContactInquiry,
  listContactInquiries,
  getContactInquiry,
  updateContactInquiryStatus,
  type ContactInquiryRow,
} from "@/lib/repositories/contactInquiries";
import type { InquiryStatus } from "@/lib/supabase/database.types";
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

/**
 * Module 7A — admin read path. Never rethrows the raw Supabase/Postgres
 * error to a Server Component (spec §11 — "never expose raw PostgreSQL
 * errors ... to the browser"): logs server-side and returns a
 * discriminated result the page renders as its error state instead.
 */
export type AdminListResult<T> = { ok: true; data: T[] } | { ok: false; message: string };
export type AdminGetResult<T> = { ok: true; data: T | null } | { ok: false; message: string };
export type AdminUpdateResult<T> = { ok: true; data: T } | { ok: false; message: string };

export async function listContactInquiriesForAdmin(status?: InquiryStatus): Promise<AdminListResult<ContactInquiryRow>> {
  try {
    const data = await listContactInquiries(status);
    return { ok: true, data };
  } catch (error) {
    console.error("listContactInquiriesForAdmin: query failed", error);
    return { ok: false, message: "Unable to load contact inquiries. Please try again." };
  }
}

export async function getContactInquiryForAdmin(id: string): Promise<AdminGetResult<ContactInquiryRow>> {
  try {
    const data = await getContactInquiry(id);
    return { ok: true, data };
  } catch (error) {
    console.error("getContactInquiryForAdmin: query failed", error);
    return { ok: false, message: "Unable to load this inquiry. Please try again." };
  }
}

export async function updateContactInquiryStatusForAdmin(
  id: string,
  status: InquiryStatus
): Promise<AdminUpdateResult<ContactInquiryRow>> {
  try {
    const data = await updateContactInquiryStatus(id, status);
    return { ok: true, data };
  } catch (error) {
    console.error("updateContactInquiryStatusForAdmin: update failed", error);
    return { ok: false, message: "Unable to update this inquiry's status. Please try again." };
  }
}
