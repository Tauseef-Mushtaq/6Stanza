import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { getInsightForAdmin } from "@/lib/services/insightContentService";
import { InsightForm } from "@/features/admin/components/InsightForm";
import { ArchiveInsightButton } from "@/features/admin/components/ArchiveInsightButton";
import { DeleteInsightButton } from "@/features/admin/components/DeleteInsightButton";
import { ContentStatusBadge } from "@/features/admin/components/ContentStatusBadge";
import { AdminErrorState } from "@/features/admin/components/AdminErrorState";

export const metadata: Metadata = { title: "Edit Insight" };

/**
 * Module 9E — `/admin/insights/[id]` (spec §20). Fetches through
 * `getInsightForAdmin` (`lib/services/insightContentService.ts`),
 * itself `requireAdmin()`-gated and RLS-backed — same shape as the
 * existing `EditTeamMemberPage`/`EditServicePage`/`EditProjectPage`.
 * Handles a genuinely missing or invalid id with `notFound()` rather
 * than crashing into the generic error boundary.
 */
export default async function EditInsightPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getInsightForAdmin(id);

  if (!result.ok) {
    return <AdminErrorState title="Unable to load this insight." message={result.message} />;
  }

  const insight = result.data;
  if (!insight) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Link
          href="/admin/insights"
          className="font-[var(--font-mono)] uppercase transition-colors hover:text-[var(--color-brand)]"
          style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-secondary)" }}
        >
          ← Insights
        </Link>
        <div className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel>Edit Insight</TechnicalLabel>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-[var(--font-display)]" style={{ fontSize: "var(--text-h2)", color: "var(--color-text-primary)" }}>
            {insight.title}
          </h1>
          <div className="flex items-center gap-3">
            <ContentStatusBadge status={insight.status} />
            <ArchiveInsightButton id={insight.id} alreadyArchived={insight.status === "archived"} />
            <DeleteInsightButton id={insight.id} />
          </div>
        </div>
      </div>

      <InsightForm insight={insight} />
    </div>
  );
}
