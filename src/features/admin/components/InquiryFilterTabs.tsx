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
 * Module 7A — basic status filtering (spec §8), a plain link list so
 * the filter is a real navigation (`?status=...`) the server-rendered
 * list page (`app/admin/inquiries/page.tsx`) reads to build its
 * database query — no client-side state, no loading every record into
 * the browser just to filter it there.
 */
export function InquiryFilterTabs({ active }: { active: InquiryStatus | "all" }) {
  const tabs: Array<{ value: InquiryStatus | "all"; label: string }> = [
    { value: "all", label: "All" },
    ...inquiryStatusValues.map((value) => ({ value, label: FILTER_LABEL[value] })),
  ];

  return (
    <nav aria-label="Filter inquiries by status" className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const isActive = tab.value === active;
        const href = tab.value === "all" ? "/admin/inquiries" : `/admin/inquiries?status=${tab.value}`;
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
