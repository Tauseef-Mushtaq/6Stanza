import type { Metadata } from "next";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { listConsultationBookingsForAdmin } from "@/lib/services/consultationBookingService";
import { BookingStatusFilterTabs } from "@/features/admin/components/BookingStatusFilterTabs";
import { ConsultationBookingTable } from "@/features/admin/components/ConsultationBookingTable";
import { inquiryStatusValues } from "@/lib/validation/adminInquiry";
import type { InquiryStatus } from "@/lib/supabase/database.types";

export const metadata: Metadata = { title: "Consultation Bookings" };

function parseStatus(raw: string | undefined): InquiryStatus | undefined {
  if (!raw) return undefined;
  return (inquiryStatusValues as readonly string[]).includes(raw) ? (raw as InquiryStatus) : undefined;
}

/**
 * Module Consultation Booking 2 — the booking list. Server Component:
 * the query runs through `requireAdmin()`-gated (via
 * `app/admin/layout.tsx`), RLS-respecting
 * `listConsultationBookingsForAdmin` (`lib/services/consultationBookingService.ts`)
 * — nothing here talks to Supabase directly, matching
 * `app/admin/inquiries/page.tsx`'s shape. The status filter comes from
 * the URL (`?status=...`, set by `BookingStatusFilterTabs`) and is
 * applied at the database query level, not by fetching everything and
 * filtering in the browser.
 */
export default async function AdminConsultationBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: rawStatus } = await searchParams;
  const status = parseStatus(rawStatus);

  const result = await listConsultationBookingsForAdmin(status);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel>Admin</TechnicalLabel>
        </div>
        <h1 className="font-[var(--font-display)]" style={{ fontSize: "var(--text-h2)", color: "var(--color-text-primary)" }}>
          Consultation Bookings
        </h1>
      </div>

      <BookingStatusFilterTabs active={status ?? "all"} />

      {!result.ok ? (
        <div
          role="alert"
          className="rounded-[var(--radius-lg)] border p-6"
          style={{ borderColor: "var(--color-error)", color: "var(--color-error)" }}
        >
          {result.message}
        </div>
      ) : (
        <ConsultationBookingTable
          items={result.data}
          filtered={status !== undefined}
          statusQuery={status ? `?status=${status}` : ""}
        />
      )}
    </div>
  );
}
