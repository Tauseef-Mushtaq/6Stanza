import "server-only";

import { countContactInquiries, listContactInquiries } from "@/lib/repositories/contactInquiries";
import { countProjectInquiries, listProjectInquiries } from "@/lib/repositories/projectInquiries";
import { toListItems, type InquiryListItem } from "@/features/admin/lib/inquiries";

export type AdminDashboardSummary = {
  total: number;
  new: number;
  inProgress: number;
  resolved: number;
};

/**
 * Module 8 — distinct from the 7A services' `AdminGetResult<T>`
 * (`data: T | null`, used for "this single row may not exist"). A
 * dashboard summary and a recent-inquiries list are never "not
 * found" — only "loaded" or "failed to load" — so `data` here is
 * never null on success.
 */
export type AdminDashboardResult<T> = { ok: true; data: T } | { ok: false; message: string };

const RECENT_INQUIRIES_LIMIT = 8;

/**
 * Module 8 — dashboard metric counts (spec §5/§7/§8). One `count`
 * query per status per table (`{ count: "exact", head: true }` in the
 * repositories) rather than fetching every row and counting in
 * memory — `total` combines both tables, per-status counts are summed
 * across `contact_inquiries` and `project_inquiries` the same way
 * (spec §6 — treat them as one operational inquiry system without
 * touching the schema).
 *
 * Uses the `AdminDashboardResult`-style discriminated result (like
 * 7A services: a Supabase failure never reaches the page as a raw
 * error (spec §16), it's logged server-side and surfaced as a single
 * safe message.
 */
export async function getAdminDashboardSummary(): Promise<AdminDashboardResult<AdminDashboardSummary>> {
  try {
    const [contactTotal, contactNew, contactInProgress, contactResolved, projectTotal, projectNew, projectInProgress, projectResolved] =
      await Promise.all([
        countContactInquiries(),
        countContactInquiries("new"),
        countContactInquiries("in_progress"),
        countContactInquiries("resolved"),
        countProjectInquiries(),
        countProjectInquiries("new"),
        countProjectInquiries("in_progress"),
        countProjectInquiries("resolved"),
      ]);

    return {
      ok: true,
      data: {
        total: contactTotal + projectTotal,
        new: contactNew + projectNew,
        inProgress: contactInProgress + projectInProgress,
        resolved: contactResolved + projectResolved,
      },
    };
  } catch (error) {
    console.error("getAdminDashboardSummary: query failed", error);
    return { ok: false, message: "Unable to load the dashboard summary. Please try again." };
  }
}

/**
 * Module 8 — recent-inquiries panel (spec §9). Pulls the latest
 * `RECENT_INQUIRIES_LIMIT` rows from each table (already the cheapest
 * possible per-table query — indexed on `created_at`), merges them
 * with the existing `toListItems` projection (`features/admin/lib/inquiries.ts`,
 * built for the 7A/7B list view) so this reuses the same row shape
 * instead of inventing a second one, then re-sorts the combined,
 * smaller set and trims to the display limit.
 */
export async function getRecentInquiries(): Promise<AdminDashboardResult<InquiryListItem[]>> {
  try {
    const [contact, project] = await Promise.all([
      listContactInquiries(undefined, RECENT_INQUIRIES_LIMIT),
      listProjectInquiries(undefined, RECENT_INQUIRIES_LIMIT),
    ]);

    const merged = toListItems(contact, project).slice(0, RECENT_INQUIRIES_LIMIT);
    return { ok: true, data: merged };
  } catch (error) {
    console.error("getRecentInquiries: query failed", error);
    return { ok: false, message: "Unable to load recent inquiries. Please try again." };
  }
}
