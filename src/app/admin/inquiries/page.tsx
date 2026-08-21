import type { Metadata } from "next";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { listContactInquiriesForAdmin } from "@/lib/services/contactInquiryService";
import { listProjectInquiriesForAdmin } from "@/lib/services/projectInquiryService";
import { toListItems } from "@/features/admin/lib/inquiries";
import { InquiryFilterTabs } from "@/features/admin/components/InquiryFilterTabs";
import { InquiryTable } from "@/features/admin/components/InquiryTable";
import { inquiryStatusValues } from "@/lib/validation/adminInquiry";
import type { InquiryStatus } from "@/lib/supabase/database.types";

export const metadata: Metadata = { title: "Inquiries" };

function parseStatus(raw: string | undefined): InquiryStatus | undefined {
  if (!raw) return undefined;
  return (inquiryStatusValues as readonly string[]).includes(raw) ? (raw as InquiryStatus) : undefined;
}

/**
 * Module 7A — the inquiry list (spec §7/§8). Server Component: both
 * queries run through `requireAdmin()`-gated, RLS-respecting services
 * (`lib/services/{contact,project}InquiryService.ts`) — nothing here
 * talks to Supabase directly (spec §4 — "Do NOT place Supabase queries
 * directly inside React components"). The status filter comes from
 * the URL (`?status=...`, set by `InquiryFilterTabs`) and is applied
 * at the database query level via each service's optional `status`
 * argument, not by fetching everything and filtering in the browser.
 */
export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: rawStatus } = await searchParams;
  const status = parseStatus(rawStatus);

  const [contactResult, projectResult] = await Promise.all([
    listContactInquiriesForAdmin(status),
    listProjectInquiriesForAdmin(status),
  ]);

  const errorMessage = !contactResult.ok ? contactResult.message : !projectResult.ok ? projectResult.message : null;

  const items =
    contactResult.ok && projectResult.ok ? toListItems(contactResult.data, projectResult.data) : [];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel>Admin</TechnicalLabel>
        </div>
        <h1 className="font-[var(--font-display)]" style={{ fontSize: "var(--text-h2)", color: "var(--color-text-primary)" }}>
          Inquiries
        </h1>
      </div>

      <InquiryFilterTabs active={status ?? "all"} />

      {errorMessage ? (
        <div
          role="alert"
          className="rounded-[var(--radius-lg)] border p-6"
          style={{ borderColor: "var(--color-error)", color: "var(--color-error)" }}
        >
          {errorMessage}
        </div>
      ) : (
        <InquiryTable items={items} filtered={status !== undefined} statusQuery={status ? `?status=${status}` : ""} />
      )}
    </div>
  );
}
