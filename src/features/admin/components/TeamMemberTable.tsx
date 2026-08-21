import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { ContentStatusBadge } from "@/features/admin/components/ContentStatusBadge";
import { ArchiveTeamMemberButton } from "@/features/admin/components/ArchiveTeamMemberButton";
import type { TeamMemberRow } from "@/lib/repositories/teamMembers";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

/**
 * Module 9D — the team list (spec §5). Fixed, scannable columns
 * (name/role/status/sort order/updated/published) rather than every
 * database column — biography and social links live one click away
 * in the edit form. Same responsive treatment as `ServiceTable.tsx`
 * / `ProjectTable.tsx`: stacked cards below `md`, a real table at
 * `md` and above.
 */
export function TeamMemberTable({
  members,
  filtered,
  statusQuery,
}: {
  members: TeamMemberRow[];
  filtered: boolean;
  statusQuery: string;
}) {
  if (members.length === 0) {
    return (
      <EmptyState
        title={filtered ? "No team members match this status." : "No team members found."}
        action={
          filtered ? undefined : (
            <Link
              href="/admin/team/new"
              className="inline-flex items-center justify-center rounded-[var(--radius-pill)] px-5 py-2.5 font-[var(--font-sans)] font-medium transition-[filter] hover:brightness-110 active:brightness-95"
              style={{ fontSize: "var(--text-small)", background: "var(--color-brand)", color: "var(--stz-white)" }}
            >
              Add Team Member
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
        {members.map((member) => (
          <li
            key={member.id}
            className="flex flex-col gap-3 rounded-[var(--radius-lg)] border p-4"
            style={{ borderColor: "var(--color-border)" }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-1">
                <Link
                  href={`/admin/team/${member.id}${statusQuery}`}
                  className="truncate hover:text-[var(--color-brand)]"
                  style={{ fontSize: "var(--text-body)", color: "var(--color-text-primary)" }}
                >
                  {member.name}
                </Link>
                <span className="truncate" style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
                  {member.role}
                </span>
              </div>
              <ContentStatusBadge status={member.status} />
            </div>

            <div className="flex items-center justify-between gap-3">
              <span style={{ fontSize: "var(--text-caption)", color: "var(--color-text-muted)" }}>
                Order {member.sort_order} · Updated {formatDate(member.updated_at)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/admin/team/${member.id}${statusQuery}`}
                className="inline-flex items-center justify-center rounded-[var(--radius-pill)] px-4 py-2 font-[var(--font-sans)] font-medium transition-colors hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
                style={{ fontSize: "var(--text-caption)", border: "1px solid var(--color-border)", color: "var(--color-foreground)" }}
              >
                Edit
              </Link>
              <ArchiveTeamMemberButton id={member.id} alreadyArchived={member.status === "archived"} />
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop: table. Hidden below md. */}
      <div className="hidden overflow-x-auto rounded-[var(--radius-lg)] border md:block" style={{ borderColor: "var(--color-border)" }}>
        <table className="w-full min-w-[820px] border-collapse text-left">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
              {["Name", "Role", "Status", "Order", "Updated", "Published", ""].map((heading) => (
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
            {members.map((member) => (
              <tr
                key={member.id}
                className="transition-colors hover:bg-[var(--color-surface)]"
                style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
              >
                <td className="max-w-[16rem] truncate px-4 py-3" style={{ fontSize: "var(--text-small)" }}>
                  <Link href={`/admin/team/${member.id}${statusQuery}`} className="hover:text-[var(--color-brand)]">
                    {member.name}
                  </Link>
                </td>
                <td className="max-w-[12rem] truncate px-4 py-3" style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
                  {member.role}
                </td>
                <td className="px-4 py-3">
                  <ContentStatusBadge status={member.status} />
                </td>
                <td className="px-4 py-3" style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
                  {member.sort_order}
                </td>
                <td className="whitespace-nowrap px-4 py-3" style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
                  {formatDate(member.updated_at)}
                </td>
                <td className="whitespace-nowrap px-4 py-3" style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
                  {formatDate(member.published_at)}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/team/${member.id}${statusQuery}`} className="hover:text-[var(--color-brand)]" style={{ fontSize: "var(--text-small)" }}>
                      Edit
                    </Link>
                    <ArchiveTeamMemberButton id={member.id} alreadyArchived={member.status === "archived"} />
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
