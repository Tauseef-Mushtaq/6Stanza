import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/features/admin/components/StatusBadge";
import type { InquiryListItem } from "@/features/admin/lib/inquiries";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

/**
 * Module 7B — empty state (spec §9). Distinguishes "nothing has ever
 * come in" from "nothing matches the current filter" so an admin who
 * filters to e.g. Archived and sees nothing isn't left wondering
 * whether the whole system is empty.
 */
function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div
      className="rounded-[var(--radius-lg)] border p-10 text-center"
      style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
    >
      {filtered ? "No inquiries match this status." : "No inquiries yet."}
    </div>
  );
}

/**
 * Module 7A — the admin inquiry list (spec §7). Deliberately shows a
 * fixed, minimal column set (Type/Name/Email/Status/Created, plus
 * Company/Project for project inquiries) rather than every database
 * column — the full record is one click away in the detail view.
 *
 * Module 7B — responsive treatment (spec §11): below `md` this
 * renders as a stacked card list instead of shrinking the table,
 * since a 6-column table has no readable narrow form. `statusQuery`
 * (the current `?status=...`, or `""` for "all") is appended to each
 * detail link so returning from a detail page preserves the active
 * filter (spec §14) without the table needing any client-side state.
 */
export function InquiryTable({
  items,
  filtered,
  statusQuery,
}: {
  items: InquiryListItem[];
  filtered: boolean;
  statusQuery: string;
}) {
  if (items.length === 0) {
    return <EmptyState filtered={filtered} />;
  }

  return (
    <>
      {/* Mobile: stacked cards. Hidden at md and above. */}
      <ul className="flex flex-col gap-3 md:hidden">
        {items.map((item) => (
          <li key={`${item.type}-${item.id}`}>
            <Link
              href={`/admin/inquiries/${item.type}/${item.id}${statusQuery}`}
              className="flex flex-col gap-3 rounded-[var(--radius-lg)] border p-4 transition-colors hover:bg-[var(--color-surface)]"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="truncate" style={{ fontSize: "var(--text-body)", color: "var(--color-text-primary)" }}>
                    {item.name}
                  </span>
                  <span className="truncate" style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
                    {item.email}
                  </span>
                </div>
                <Badge variant="outline" tone={item.type === "project" ? "brand" : "neutral"}>
                  {item.type === "project" ? "Project" : "Contact"}
                </Badge>
              </div>

              {item.company || item.projectTitle ? (
                <span className="truncate" style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
                  {item.company ? `${item.company} — ` : ""}
                  {item.projectTitle ?? ""}
                </span>
              ) : null}

              <div className="flex items-center justify-between gap-3">
                <StatusBadge status={item.status} />
                <span style={{ fontSize: "var(--text-caption)", color: "var(--color-text-muted)" }}>
                  {formatDate(item.createdAt)}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* Desktop: table. Hidden below md. */}
      <div className="hidden overflow-x-auto rounded-[var(--radius-lg)] border md:block" style={{ borderColor: "var(--color-border)" }}>
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
              {["Type", "Name", "Email", "Company / Project", "Status", "Created"].map((heading) => (
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
            {items.map((item) => (
              <tr
                key={`${item.type}-${item.id}`}
                className="transition-colors hover:bg-[var(--color-surface)]"
                style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
              >
                <td className="px-4 py-3" style={{ fontSize: "var(--text-small)" }}>
                  <Badge variant="outline" tone={item.type === "project" ? "brand" : "neutral"}>
                    {item.type === "project" ? "Project" : "Contact"}
                  </Badge>
                </td>
                <td className="max-w-[16rem] truncate px-4 py-3" style={{ fontSize: "var(--text-small)" }}>
                  <Link href={`/admin/inquiries/${item.type}/${item.id}${statusQuery}`} className="hover:text-[var(--color-brand)]">
                    {item.name}
                  </Link>
                </td>
                <td className="max-w-[14rem] truncate px-4 py-3" style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
                  {item.email}
                </td>
                <td className="max-w-[14rem] truncate px-4 py-3" style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
                  {item.company ? `${item.company} — ` : ""}
                  {item.projectTitle ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={item.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-3" style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
                  {formatDate(item.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
