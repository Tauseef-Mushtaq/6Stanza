import Link from "next/link";
import { ContentStatusBadge } from "@/features/admin/components/ContentStatusBadge";
import { ArchiveProjectButton } from "@/features/admin/components/ArchiveProjectButton";
import type { ProjectRow } from "@/lib/repositories/projects";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

/** Same "distinguish empty from filtered-empty" treatment as `ServiceTable.tsx`'s `EmptyState`. */
function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div
      className="rounded-[var(--radius-lg)] border p-10 text-center"
      style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
    >
      {filtered ? "No projects match this status." : "No projects yet."}
    </div>
  );
}

/**
 * Module 9C — the projects list (spec §5). Fixed, scannable columns
 * (title/category/status/sort order/updated/published) rather than
 * the full case study — that lives one click away in the edit form.
 * Same responsive treatment as `ServiceTable.tsx`: stacked cards
 * below `md`, a real table at `md` and above.
 */
export function ProjectTable({
  projects,
  filtered,
  statusQuery,
}: {
  projects: ProjectRow[];
  filtered: boolean;
  statusQuery: string;
}) {
  if (projects.length === 0) {
    return <EmptyState filtered={filtered} />;
  }

  return (
    <>
      {/* Mobile: stacked cards. Hidden at md and above. */}
      <ul className="flex flex-col gap-3 md:hidden">
        {projects.map((project) => (
          <li
            key={project.id}
            className="flex flex-col gap-3 rounded-[var(--radius-lg)] border p-4"
            style={{ borderColor: "var(--color-border)" }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-1">
                <Link
                  href={`/admin/projects/${project.id}${statusQuery}`}
                  className="truncate hover:text-[var(--color-brand)]"
                  style={{ fontSize: "var(--text-body)", color: "var(--color-text-primary)" }}
                >
                  {project.title}
                </Link>
                <span className="truncate" style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
                  {project.category}
                </span>
              </div>
              <ContentStatusBadge status={project.status} />
            </div>

            <div className="flex items-center justify-between gap-3">
              <span style={{ fontSize: "var(--text-caption)", color: "var(--color-text-muted)" }}>
                Order {project.sort_order} · Updated {formatDate(project.updated_at)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/admin/projects/${project.id}${statusQuery}`}
                className="inline-flex items-center justify-center rounded-[var(--radius-pill)] px-4 py-2 font-[var(--font-sans)] font-medium transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
                style={{ fontSize: "var(--text-caption)", border: "1px solid var(--color-border)", color: "var(--color-foreground)" }}
              >
                Edit
              </Link>
              <ArchiveProjectButton id={project.id} alreadyArchived={project.status === "archived"} />
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop: table. Hidden below md. */}
      <div className="hidden overflow-x-auto rounded-[var(--radius-lg)] border md:block" style={{ borderColor: "var(--color-border)" }}>
        <table className="w-full min-w-[820px] border-collapse text-left">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
              {["Title", "Category", "Status", "Order", "Updated", "Published", ""].map((heading) => (
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
            {projects.map((project) => (
              <tr
                key={project.id}
                className="transition-colors hover:bg-[var(--color-surface)]"
                style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
              >
                <td className="max-w-[16rem] truncate px-4 py-3" style={{ fontSize: "var(--text-small)" }}>
                  <Link href={`/admin/projects/${project.id}${statusQuery}`} className="hover:text-[var(--color-brand)]">
                    {project.title}
                  </Link>
                </td>
                <td className="max-w-[10rem] truncate px-4 py-3" style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
                  {project.category}
                </td>
                <td className="px-4 py-3">
                  <ContentStatusBadge status={project.status} />
                </td>
                <td className="px-4 py-3" style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
                  {project.sort_order}
                </td>
                <td className="whitespace-nowrap px-4 py-3" style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
                  {formatDate(project.updated_at)}
                </td>
                <td className="whitespace-nowrap px-4 py-3" style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
                  {formatDate(project.published_at)}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/projects/${project.id}${statusQuery}`} className="hover:text-[var(--color-brand)]" style={{ fontSize: "var(--text-small)" }}>
                      Edit
                    </Link>
                    <ArchiveProjectButton id={project.id} alreadyArchived={project.status === "archived"} />
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
