import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { contentStatusValues } from "@/features/admin/lib/services";
import type { ContentStatus } from "@/lib/supabase/database.types";

const FILTER_LABEL: Record<ContentStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

/**
 * Module 9B — status filtering for `/admin/services` (spec §6), same
 * shape as `InquiryFilterTabs.tsx`: a plain link list so the filter is
 * a real `?status=...` navigation the server-rendered list page reads
 * to build its database query, not client-side state filtering
 * records that were already fetched.
 */
export function ServiceStatusFilterTabs({ active }: { active: ContentStatus | "all" }) {
  const tabs: Array<{ value: ContentStatus | "all"; label: string }> = [
    { value: "all", label: "All" },
    ...contentStatusValues.map((value) => ({ value, label: FILTER_LABEL[value] })),
  ];

  return (
    <nav aria-label="Filter services by status" className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const isActive = tab.value === active;
        const href = tab.value === "all" ? "/admin/services" : `/admin/services?status=${tab.value}`;
        return (
          <Link
            key={tab.value}
            href={href}
            className={cn("rounded-[var(--radius-pill)] px-4 py-1.5 font-[var(--font-mono)] uppercase transition-colors")}
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
