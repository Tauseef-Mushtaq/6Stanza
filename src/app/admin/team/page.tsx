import type { Metadata } from "next";
import Link from "next/link";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { listAllTeamMembersForAdmin } from "@/lib/services/teamContentService";
import { TeamMemberStatusFilterTabs } from "@/features/admin/components/TeamMemberStatusFilterTabs";
import { TeamMemberTable } from "@/features/admin/components/TeamMemberTable";
import { contentStatusValues } from "@/features/admin/lib/services";
import type { ContentStatus } from "@/lib/supabase/database.types";

export const metadata: Metadata = { title: "Team" };

function parseStatus(raw: string | undefined): ContentStatus | undefined {
  if (!raw) return undefined;
  return (contentStatusValues as readonly string[]).includes(raw) ? (raw as ContentStatus) : undefined;
}

/**
 * Module 9D — the team list (spec §5/§6). Server Component: the
 * query runs through `listAllTeamMembersForAdmin`
 * (`lib/services/teamContentService.ts`), which is `requireAdmin()`-
 * gated and RLS-respecting — nothing here talks to Supabase directly,
 * matching the `AdminServicesPage`/`AdminProjectsPage` pattern. The
 * status filter comes from the URL (`?status=...`) and is applied at
 * the database query level via the service's optional `status`
 * argument.
 */
export default async function AdminTeamPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: rawStatus } = await searchParams;
  const status = parseStatus(rawStatus);

  const result = await listAllTeamMembersForAdmin(status);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel>Admin</TechnicalLabel>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-[var(--font-display)]" style={{ fontSize: "var(--text-h2)", color: "var(--color-text-primary)" }}>
            Team
          </h1>
          <Link
            href="/admin/team/new"
            className="inline-flex items-center justify-center rounded-[var(--radius-pill)] px-5 py-2.5 font-[var(--font-sans)] font-medium transition-[filter] hover:brightness-110 active:brightness-95"
            style={{ fontSize: "var(--text-small)", background: "var(--color-brand)", color: "var(--stz-white)" }}
          >
            Create Team Member
          </Link>
        </div>
      </div>

      <TeamMemberStatusFilterTabs active={status ?? "all"} />

      {!result.ok ? (
        <div
          role="alert"
          className="rounded-[var(--radius-lg)] border p-6"
          style={{ borderColor: "var(--color-error)", color: "var(--color-error)" }}
        >
          {result.message}
        </div>
      ) : (
        <TeamMemberTable members={result.data} filtered={status !== undefined} statusQuery={status ? `?status=${status}` : ""} />
      )}
    </div>
  );
}
