import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/features/admin/components/StatusBadge";
import {
  getConsultationBookingForAdmin,
} from "@/lib/services/consultationBookingService";
import { getProjectInquiryForAdmin } from "@/lib/services/projectInquiryService";

export const metadata: Metadata = { title: "Consultation Booking" };

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

/**
 * Module Consultation Booking 2 — booking detail (mirrors
 * `app/admin/inquiries/contact/[id]/page.tsx`'s shape). Fetches
 * through `getConsultationBookingForAdmin`
 * (`lib/services/consultationBookingService.ts`), gated by RLS on the
 * repository call underneath — a non-admin visiting this URL directly
 * still can't read the row (the admin layout's own role check is the
 * first gate, RLS is the second, independent one).
 *
 * `starts_at`/`ends_at` are stored as UTC timestamptz
 * (`0010_consultation_bookings.sql`) with no separate timezone column
 * — `toLocaleString` below renders them in the admin's own browser
 * timezone, which is the closest available reading without inventing
 * a field the schema doesn't have (see handoff "known limitations").
 *
 * When `project_inquiry_id` is set, the related project inquiry is
 * loaded through the existing `getProjectInquiryForAdmin` (Module 7A)
 * rather than duplicating that read here — same repository/service
 * layer, no second inquiry data path.
 */
export default async function ConsultationBookingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { id } = await params;
  const { status: statusFromList } = await searchParams;
  const backHref = statusFromList ? `/admin/consultation-bookings?status=${statusFromList}` : "/admin/consultation-bookings";

  const result = await getConsultationBookingForAdmin(id);

  if (!result.ok) {
    return (
      <div role="alert" className="rounded-[var(--radius-lg)] border p-6" style={{ borderColor: "var(--color-error)", color: "var(--color-error)" }}>
        {result.message}
      </div>
    );
  }

  const booking = result.data;
  if (!booking) notFound();

  const relatedInquiryResult = booking.project_inquiry_id
    ? await getProjectInquiryForAdmin(booking.project_inquiry_id)
    : null;
  const relatedInquiry = relatedInquiryResult?.ok ? relatedInquiryResult.data : null;
  const relatedInquiryLoadFailed = relatedInquiryResult !== null && !relatedInquiryResult.ok;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Link
          href={backHref}
          className="font-[var(--font-mono)] uppercase transition-colors hover:text-[var(--color-brand)]"
          style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-secondary)" }}
        >
          ← Consultation Bookings
        </Link>
        <div className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel>Consultation Booking</TechnicalLabel>
        </div>
        <h1 className="font-[var(--font-display)]" style={{ fontSize: "var(--text-h2)", color: "var(--color-text-primary)" }}>
          {booking.attendee_name}
        </h1>
      </div>

      <Card variant="bordered" className="gap-6">
        <dl className="flex flex-col gap-4">
          <Row label="Email" value={booking.attendee_email} />
          <Row label="Consultation start" value={formatDateTime(booking.starts_at)} />
          <Row label="Consultation end" value={formatDateTime(booking.ends_at)} />
          <Row label="Event type" value={booking.event_type_slug} />
          <Row label="Cal.com reference" value={booking.cal_booking_uid} mono />
          <Row label="Created" value={formatDateTime(booking.created_at)} />
        </dl>

        <div className="flex flex-col gap-2">
          <span
            className="font-[var(--font-mono)] uppercase"
            style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-secondary)" }}
          >
            Status
          </span>
          <div>
            <StatusBadge status={booking.status} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span
            className="font-[var(--font-mono)] uppercase"
            style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-secondary)" }}
          >
            Related inquiry
          </span>
          {relatedInquiryLoadFailed ? (
            <span style={{ fontSize: "var(--text-small)", color: "var(--color-error)" }}>
              Unable to load the related inquiry.
            </span>
          ) : relatedInquiry ? (
            <Link
              href={`/admin/inquiries/project/${relatedInquiry.id}`}
              className="hover:text-[var(--color-brand)]"
              style={{ fontSize: "var(--text-small)" }}
            >
              {relatedInquiry.project_title} — {relatedInquiry.name}
            </Link>
          ) : (
            <span style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
              No related inquiry.
            </span>
          )}
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-1 border-b pb-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3" style={{ borderColor: "var(--color-border)" }}>
      <dt style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-small)" }}>{label}</dt>
      <dd className={mono ? "break-all font-[var(--font-mono)] sm:text-right" : "break-words sm:text-right"} style={{ fontSize: "var(--text-small)" }}>
        {value}
      </dd>
    </div>
  );
}
