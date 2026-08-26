import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { ContentStatusBadge } from "@/features/admin/components/ContentStatusBadge";
import { ArchiveTestimonialButton } from "@/features/admin/components/ArchiveTestimonialButton";
import type { TestimonialRow } from "@/lib/repositories/testimonials";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

/**
 * MODULE-TESTIMONIAL-1 — the testimonials list. Same responsive
 * treatment (stacked cards below `md`, real table at `md`+) and same
 * fixed-column approach as `TeamMemberTable.tsx`.
 */
export function TestimonialTable({
  testimonials,
  filtered,
  statusQuery,
}: {
  testimonials: TestimonialRow[];
  filtered: boolean;
  statusQuery: string;
}) {
  if (testimonials.length === 0) {
    return (
      <EmptyState
        title={filtered ? "No testimonials match this status." : "No testimonials yet."}
        action={
          filtered ? undefined : (
            <Link
              href="/admin/testimonials/new"
              className="inline-flex items-center justify-center rounded-[var(--radius-pill)] px-5 py-2.5 font-[var(--font-sans)] font-medium transition-[filter] hover:brightness-110 active:brightness-95"
              style={{ fontSize: "var(--text-small)", background: "var(--color-brand)", color: "var(--stz-white)" }}
            >
              Add Testimonial
            </Link>
          )
        }
      />
    );
  }

  return (
    <>
      {/* Mobile: stacked cards. Hidden at md and above. */}
      <ul className="flex flex-col gap-3 md:hidden">
        {testimonials.map((testimonial) => (
          <li
            key={testimonial.id}
            className="flex flex-col gap-3 rounded-[var(--radius-lg)] border p-4"
            style={{ borderColor: "var(--color-border)" }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-1">
                <Link
                  href={`/admin/testimonials/${testimonial.id}${statusQuery}`}
                  className="truncate hover:text-[var(--color-brand)]"
                  style={{ fontSize: "var(--text-body)", color: "var(--color-text-primary)" }}
                >
                  {testimonial.name}
                </Link>
                <span className="truncate" style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
                  {testimonial.company || "—"}
                </span>
              </div>
              <ContentStatusBadge status={testimonial.status} />
            </div>

            <div className="flex items-center justify-between gap-3">
              <span style={{ fontSize: "var(--text-caption)", color: "var(--color-text-muted)" }}>
                Order {testimonial.sort_order} · Updated {formatDate(testimonial.updated_at)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/admin/testimonials/${testimonial.id}${statusQuery}`}
                className="inline-flex items-center justify-center rounded-[var(--radius-pill)] px-4 py-2 font-[var(--font-sans)] font-medium transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
                style={{ fontSize: "var(--text-caption)", border: "1px solid var(--color-border)", color: "var(--color-foreground)" }}
              >
                Edit
              </Link>
              <ArchiveTestimonialButton id={testimonial.id} alreadyArchived={testimonial.status === "archived"} />
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop: table. Hidden below md. */}
      <div className="hidden overflow-x-auto rounded-[var(--radius-lg)] border md:block" style={{ borderColor: "var(--color-border)" }}>
        <table className="w-full min-w-[820px] border-collapse text-left">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
              {["Name", "Company", "Status", "Order", "Updated", "Published", ""].map((heading) => (
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
            {testimonials.map((testimonial) => (
              <tr
                key={testimonial.id}
                className="transition-colors hover:bg-[var(--color-surface)]"
                style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
              >
                <td className="max-w-[16rem] truncate px-4 py-3" style={{ fontSize: "var(--text-small)" }}>
                  <Link href={`/admin/testimonials/${testimonial.id}${statusQuery}`} className="hover:text-[var(--color-brand)]">
                    {testimonial.name}
                  </Link>
                </td>
                <td className="max-w-[12rem] truncate px-4 py-3" style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
                  {testimonial.company || "—"}
                </td>
                <td className="px-4 py-3">
                  <ContentStatusBadge status={testimonial.status} />
                </td>
                <td className="px-4 py-3" style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
                  {testimonial.sort_order}
                </td>
                <td className="whitespace-nowrap px-4 py-3" style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
                  {formatDate(testimonial.updated_at)}
                </td>
                <td className="whitespace-nowrap px-4 py-3" style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
                  {formatDate(testimonial.published_at)}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/testimonials/${testimonial.id}${statusQuery}`} className="hover:text-[var(--color-brand)]" style={{ fontSize: "var(--text-small)" }}>
                      Edit
                    </Link>
                    <ArchiveTestimonialButton id={testimonial.id} alreadyArchived={testimonial.status === "archived"} />
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
