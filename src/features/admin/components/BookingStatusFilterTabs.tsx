import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { inquiryStatusValues } from "@/lib/validation/adminInquiry";
import type { InquiryStatus } from "@/lib/supabase/database.types";

const FILTER_LABEL: Record<InquiryStatus, string> = {
  new: "New",
  in_progress: "In Progress",
  resolved: "Resolved",
  archived: "Archived",
};

/**
 * Module Consultation Booking 2 — status filtering for the booking
 * list, same shape as `InquiryFilterTabs.tsx`: a plain link list so
 * the filter is a real navigation (`?status=...`) that
 * `app/admin/consultation-bookings/page.tsx` reads to build its
 * database query. `consultation_bookings.status` reuses the same
 * `inquiry_status` Postgres enum as inquiries
 * (`supabase/migrations/0010_consultation_bookings.sql`), so this
 * reuses `inquiryStatusValues` rather than declaring a second copy.
 */
export function BookingStatusFilterTabs({ active }: { active: InquiryStatus | "all" }) {
  const tabs: Array<{ value: InquiryStatus | "all"; label: string }> = [
    { value: "all", label: "All" },
    ...inquiryStatusValues.map((value) => ({ value, label: FILTER_LABEL[value] })),
  ];

  return (
    <nav aria-label="Filter bookings by status" className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const isActive = tab.value === active;
        const href = tab.value === "all" ? "/admin/consultation-bookings" : `/admin/consultation-bookings?status=${tab.value}`;
        return (
          <Link
            key={tab.value}
            href={href}
            className={cn(
              "rounded-[var(--radius-pill)] px-4 py-1.5 font-[var(--font-mono)] uppercase transition-colors"
            )}
            style={{
              fontSize: "var(--text-label)",
              letterSpacing: "var(--tracking-label)",
              background: isActive ? "var(--color-brand)" : "transparent",
              color: isActive ? "var(--stz-white)" : "var(--color-text-secondary)",
              border: `1px solid ${isActive ? "var(--color-brand)" : "var(--color-border)"}`,
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
