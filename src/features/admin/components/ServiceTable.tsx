import Link from "next/link";
import { ContentStatusBadge } from "@/features/admin/components/ContentStatusBadge";
import { ArchiveServiceButton } from "@/features/admin/components/ArchiveServiceButton";
import type { ServiceRow } from "@/lib/repositories/services";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

/** Same "distinguish empty from filtered-empty" treatment as `InquiryTable.tsx`'s `EmptyState`. */
function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div
      className="rounded-[var(--radius-lg)] border p-10 text-center"
      style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
    >
      {filtered ? "No services match this status." : "No services yet."}
    </div>
  );
}

/**
 * Module 9B — the services list (spec §5). Deliberately a fixed,
 * scannable column set (name/category/status/sort order/updated,
 * published only when set) rather than every database field — full
 * detail lives one click away in the edit form. Same responsive
 * treatment as `InquiryTable.tsx`: stacked cards below `md`, a real
 * table at `md` and above.
 */
export function ServiceTable({
  services,
  filtered,
  statusQuery,
}: {
  services: ServiceRow[];
  filtered: boolean;
  statusQuery: string;
}) {
  if (services.length === 0) {
    return <EmptyState filtered={filtered} />;
  }

  return (
    <>
      {/* Mobile: stacked cards. Hidden at md and above. */}
      <ul className="flex flex-col gap-3 md:hidden">
        {services.map((service) => (
          <li
            key={service.id}
            className="flex flex-col gap-3 rounded-[var(--radius-lg)] border p-4"
            style={{ borderColor: "var(--color-border)" }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-1">
                <Link
                  href={`/admin/services/${service.id}${statusQuery}`}
                  className="truncate hover:text-[var(--color-brand)]"
                  style={{ fontSize: "var(--text-body)", color: "var(--color-text-primary)" }}
                >
                  {service.name}
                </Link>
                <span className="truncate" style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
                  {service.category}
                </span>
              </div>
              <ContentStatusBadge status={service.status} />
            </div>

            <div className="flex items-center justify-between gap-3">
              <span style={{ fontSize: "var(--text-caption)", color: "var(--color-text-muted)" }}>
                Order {service.sort_order} · Updated {formatDate(service.updated_at)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/admin/services/${service.id}${statusQuery}`}
                className="inline-flex items-center justify-center rounded-[var(--radius-pill)] px-4 py-2 font-[var(--font-sans)] font-medium transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
                style={{ fontSize: "var(--text-caption)", border: "1px solid var(--color-border)", color: "var(--color-foreground)" }}
              >
                Edit
              </Link>
              <ArchiveServiceButton id={service.id} alreadyArchived={service.status === "archived"} />
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop: table. Hidden below md. */}
      <div className="hidden overflow-x-auto rounded-[var(--radius-lg)] border md:block" style={{ borderColor: "var(--color-border)" }}>
        <table className="w-full min-w-[820px] border-collapse text-left">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
              {["Name", "Category", "Status", "Order", "Updated", "Published", ""].map((heading) => (
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
            {services.map((service) => (
              <tr
                key={service.id}
                className="transition-colors hover:bg-[var(--color-surface)]"
                style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
              >
                <td className="max-w-[16rem] truncate px-4 py-3" style={{ fontSize: "var(--text-small)" }}>
                  <Link href={`/admin/services/${service.id}${statusQuery}`} className="hover:text-[var(--color-brand)]">
                    {service.name}
                  </Link>
                </td>
                <td className="max-w-[10rem] truncate px-4 py-3" style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
                  {service.category}
                </td>
                <td className="px-4 py-3">
                  <ContentStatusBadge status={service.status} />
                </td>
                <td className="px-4 py-3" style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
                  {service.sort_order}
                </td>
                <td className="whitespace-nowrap px-4 py-3" style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
                  {formatDate(service.updated_at)}
                </td>
                <td className="whitespace-nowrap px-4 py-3" style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
                  {formatDate(service.published_at)}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/services/${service.id}${statusQuery}`} className="hover:text-[var(--color-brand)]" style={{ fontSize: "var(--text-small)" }}>
                      Edit
                    </Link>
                    <ArchiveServiceButton id={service.id} alreadyArchived={service.status === "archived"} />
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
