import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/features/admin/components/StatusBadge";
import type { InquiryListItem } from "@/features/admin/lib/inquiries";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

/**
 * Module 8 — recent-inquiries panel (spec §9/§12). A single compact
 * stacked list rather than a second full table: at 8 rows and 5
 * fields there's no readable-desktop-table-vs-unreadable-mobile-table
 * tension the way there is on the full `/admin/inquiries` list
 * (`InquiryTable.tsx`), so one layout works at every width. Each row
 * links straight to the existing detail route — no duplicate detail
 * page, no `statusQuery` to preserve, since this list isn't filtered.
 */
export function RecentInquiries({ items }: { items: InquiryListItem[] }) {
  if (items.length === 0) {
    return (
      <div
        className="rounded-[var(--radius-lg)] border p-10 text-center"
        style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
      >
        No inquiries yet.
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={`${item.type}-${item.id}`}>
          <Link
            href={`/admin/inquiries/${item.type}/${item.id}`}
            className="flex flex-col gap-2 rounded-[var(--radius-md)] border p-4 transition-colors hover:bg-[var(--color-surface)] sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            style={{ borderColor: "var(--color-border-subtle)" }}
          >
            <div className="flex min-w-0 items-center gap-3">
              <Badge variant="outline" tone={item.type === "project" ? "brand" : "neutral"}>
                {item.type === "project" ? "Project" : "Contact"}
              </Badge>
              <div className="flex min-w-0 flex-col">
                <span className="truncate" style={{ fontSize: "var(--text-small)", color: "var(--color-text-primary)" }}>
                  {item.name}
                </span>
                {item.company || item.projectTitle ? (
                  <span className="truncate" style={{ fontSize: "var(--text-caption)", color: "var(--color-text-secondary)" }}>
                    {item.company ? `${item.company} — ` : ""}
                    {item.projectTitle ?? ""}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <StatusBadge status={item.status} />
              <span className="whitespace-nowrap" style={{ fontSize: "var(--text-caption)", color: "var(--color-text-muted)" }}>
                {formatDate(item.createdAt)}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
