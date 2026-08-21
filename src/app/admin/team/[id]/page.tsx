import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { getTeamMemberForAdmin } from "@/lib/services/teamContentService";
import { TeamMemberForm } from "@/features/admin/components/TeamMemberForm";
import { ArchiveTeamMemberButton } from "@/features/admin/components/ArchiveTeamMemberButton";
import { DeleteTeamMemberButton } from "@/features/admin/components/DeleteTeamMemberButton";
import { ContentStatusBadge } from "@/features/admin/components/ContentStatusBadge";

export const metadata: Metadata = { title: "Edit Team Member" };

/**
 * Module 9D — `/admin/team/[id]` (spec §16). Fetches through
 * `getTeamMemberForAdmin` (`lib/services/teamContentService.ts`),
 * itself `requireAdmin()`-gated and RLS-backed — same shape as the
 * existing `EditServicePage`/`EditProjectPage`. Handles a genuinely
 * missing or invalid id with `notFound()` rather than crashing into
 * the generic error boundary.
 */
export default async function EditTeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getTeamMemberForAdmin(id);

  if (!result.ok) {
    return (
      <div role="alert" className="rounded-[var(--radius-lg)] border p-6" style={{ borderColor: "var(--color-error)", color: "var(--color-error)" }}>
        {result.message}
      </div>
    );
  }

  const member = result.data;
  if (!member) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Link
          href="/admin/team"
          className="font-[var(--font-mono)] uppercase transition-colors hover:text-[var(--color-brand)]"
          style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-secondary)" }}
        >
          ← Team
        </Link>
        <div className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel>Edit Team Member</TechnicalLabel>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-[var(--font-display)]" style={{ fontSize: "var(--text-h2)", color: "var(--color-text-primary)" }}>
            {member.name}
          </h1>
          <div className="flex items-center gap-3">
            <ContentStatusBadge status={member.status} />
            <ArchiveTeamMemberButton id={member.id} alreadyArchived={member.status === "archived"} />
            <DeleteTeamMemberButton id={member.id} />
          </div>
        </div>
      </div>

      <TeamMemberForm member={member} />
    </div>
  );
}
