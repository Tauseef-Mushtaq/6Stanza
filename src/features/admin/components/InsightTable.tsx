import Link from "next/link";
import { ContentStatusBadge } from "@/features/admin/components/ContentStatusBadge";
import { ArchiveInsightButton } from "@/features/admin/components/ArchiveInsightButton";
import type { InsightRow } from "@/lib/repositories/insights";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

/** Same "distinguish empty from filtered-empty" treatment as `TeamMemberTable.tsx`'s `EmptyState`. */
function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div
      className="rounded-[var(--radius-lg)] border p-10 text-center"
      style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
    >
      {filtered ? "No insights match this status." : "No insights yet."}
    </div>
  );
}

/**
 * Module 9E — the insights list (spec §5/§6). Fixed, scannable
 * columns (title/category/status/updated/published) rather than every
 * database column — excerpt and content live one click away in the
 * edit form. No sort-order column: `insights` has no `sort_order`
 * (ordered by `published_at` instead, per `0005_cms_content.sql`).
 * Same responsive treatment as `TeamMemberTable.tsx`/`ServiceTable.tsx`
 * / `ProjectTable.tsx`: stacked cards below `md`, a real table at `md`
 * and above.
 */
export function InsightTable({
  insights,
  filtered,
  statusQuery,
}: {
  insights: InsightRow[];
  filtered: boolean;
  statusQuery: string;
}) {
  if (insights.length === 0) {
    return <EmptyState filtered={filtered} />;
  }

  return (
    <>
      {/* Mobile: stacked cards. Hidden at md and above. */}
      <ul className="flex flex-col gap-3 md:hidden">
        {insights.map((insight) => (
          <li
            key={insight.id}
            className="flex flex-col gap-3 rounded-[var(--radius-lg)] border p-4"
            style={{ borderColor: "var(--color-border)" }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-1">
                <Link
                  href={`/admin/insights/${insight.id}${statusQuery}`}
                  className="truncate hover:text-[var(--color-brand)]"
                  style={{ fontSize: "var(--text-body)", color: "var(--color-text-primary)" }}
                >
                  {insight.title}
                </Link>
                <span className="truncate" style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
                  {insight.category}
                </span>
              </div>
              <ContentStatusBadge status={insight.status} />
            </div>

            <div className="flex items-center justify-between gap-3">
              <span style={{ fontSize: "var(--text-caption)", color: "var(--color-text-muted)" }}>
                Updated {formatDate(insight.updated_at)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/admin/insights/${insight.id}${statusQuery}`}
                className="inline-flex items-center justify-center rounded-[var(--radius-pill)] px-4 py-2 font-[var(--font-sans)] font-medium transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
                style={{ fontSize: "var(--text-caption)", border: "1px solid var(--color-border)", color: "var(--color-foreground)" }}
              >
                Edit
              </Link>
              <ArchiveInsightButton id={insight.id} alreadyArchived={insight.status === "archived"} />
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop: table. Hidden below md. */}
      <div className="hidden overflow-x-auto rounded-[var(--radius-lg)] border md:block" style={{ borderColor: "var(--color-border)" }}>
        <table className="w-full min-w-[820px] border-collapse text-left">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
              {["Title", "Category", "Status", "Updated", "Published", ""].map((heading) => (
                <th
                  key={heading}
                  className="whitespace-nowrap px-4 py-3 font-[var(--font-mono)] uppercase"
                  style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-secondary)" }}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {insights.map((insight) => (
              <tr
                key={insight.id}
                className="transition-colors hover:bg-[var(--color-surface)]"
                style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
              >
                <td className="max-w-[20rem] truncate px-4 py-3" style={{ fontSize: "var(--text-small)" }}>
                  <Link href={`/admin/insights/${insight.id}${statusQuery}`} className="hover:text-[var(--color-brand)]">
                    {insight.title}
                  </Link>
                </td>
                <td className="max-w-[10rem] truncate px-4 py-3" style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
                  {insight.category}
                </td>
                <td className="px-4 py-3">
                  <ContentStatusBadge status={insight.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-3" style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
                  {formatDate(insight.updated_at)}
                </td>
                <td className="whitespace-nowrap px-4 py-3" style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
                  {formatDate(insight.published_at)}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/insights/${insight.id}${statusQuery}`} className="hover:text-[var(--color-brand)]" style={{ fontSize: "var(--text-small)" }}>
                      Edit
                    </Link>
                    <ArchiveInsightButton id={insight.id} alreadyArchived={insight.status === "archived"} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
