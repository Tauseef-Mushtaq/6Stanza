import type { Metadata } from "next";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { TextLink } from "@/components/ui/TextLink";
import { MetricCard } from "@/features/admin/components/MetricCard";
import { RecentInquiries } from "@/features/admin/components/RecentInquiries";
import { getAdminDashboardSummary, getRecentInquiries } from "@/lib/services/adminDashboardService";

export const metadata: Metadata = { title: "Dashboard" };

/**
 * Module 8 — `/admin` is now the real dashboard (spec §3), replacing
 * the Module 7A placeholder that redirected straight to
 * `/admin/inquiries`. Protection is unchanged: this page renders
 * inside `app/admin/layout.tsx`, which already runs the
 * `getCurrentProfile()` / role check before any child route (including
 * this one) executes — nothing here adds or replaces that boundary.
 *
 * Both queries go through `lib/services/adminDashboardService.ts`,
 * which is itself built on the same RLS-respecting repositories as
 * the 7A/7B inquiry services — no direct Supabase access here, no
 * service-role client, no data fetched before the layout's admin
 * check has run.
 */
export default async function AdminDashboardPage() {
  const [summaryResult, recentResult] = await Promise.all([getAdminDashboardSummary(), getRecentInquiries()]);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel>Admin</TechnicalLabel>
        </div>
        <h1 className="font-[var(--font-display)]" style={{ fontSize: "var(--text-h2)", color: "var(--color-text-primary)" }}>
          Dashboard
        </h1>
      </div>

      {summaryResult.ok ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard label="Total Inquiries" value={summaryResult.data.total} />
          <MetricCard label="New" value={summaryResult.data.new} />
          <MetricCard label="In Progress" value={summaryResult.data.inProgress} />
          <MetricCard label="Resolved" value={summaryResult.data.resolved} />
        </div>
      ) : (
        <div
          role="alert"
          className="rounded-[var(--radius-lg)] border p-6"
          style={{ borderColor: "var(--color-error)", color: "var(--color-error)" }}
        >
          {summaryResult.message}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-[var(--font-display)]" style={{ fontSize: "var(--text-h3)", color: "var(--color-text-primary)" }}>
            Recent Inquiries
          </h2>
          <div className="flex flex-wrap items-center gap-6">
            <TextLink href="/admin/inquiries" variant="arrow">
              View all inquiries
            </TextLink>
            <TextLink href="/admin/inquiries?status=new" variant="arrow">
              View new inquiries
            </TextLink>
          </div>
        </div>

        {recentResult.ok ? (
          <RecentInquiries items={recentResult.data} />
        ) : (
          <div
            role="alert"
            className="rounded-[var(--radius-lg)] border p-6"
            style={{ borderColor: "var(--color-error)", color: "var(--color-error)" }}
          >
            {recentResult.message}
          </div>
        )}
      </div>
    </div>
  );
}
