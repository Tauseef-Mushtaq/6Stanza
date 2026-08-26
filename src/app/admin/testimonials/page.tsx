import type { Metadata } from "next";
import Link from "next/link";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { listAllTestimonialsForAdmin } from "@/lib/services/testimonialContentService";
import { TestimonialStatusFilterTabs } from "@/features/admin/components/TestimonialStatusFilterTabs";
import { TestimonialTable } from "@/features/admin/components/TestimonialTable";
import { contentStatusValues } from "@/features/admin/lib/services";
import type { ContentStatus } from "@/lib/supabase/database.types";
import { AdminErrorState } from "@/features/admin/components/AdminErrorState";

export const metadata: Metadata = { title: "Testimonials" };

function parseStatus(raw: string | undefined): ContentStatus | undefined {
  if (!raw) return undefined;
  return (contentStatusValues as readonly string[]).includes(raw) ? (raw as ContentStatus) : undefined;
}

/**
 * MODULE-TESTIMONIAL-1 — the testimonials list (`/admin/testimonials`).
 * Server Component, same shape as `AdminTeamPage`: the query runs
 * through `listAllTestimonialsForAdmin`, which is `requireAdmin()`-
 * gated and RLS-respecting. Status filter comes from `?status=...`.
 */
export default async function AdminTestimonialsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: rawStatus } = await searchParams;
  const status = parseStatus(rawStatus);

  const result = await listAllTestimonialsForAdmin(status);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel>Admin</TechnicalLabel>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-[var(--font-display)]" style={{ fontSize: "var(--text-h2)", color: "var(--color-text-primary)" }}>
            Testimonials
          </h1>
          <Link
            href="/admin/testimonials/new"
            className="inline-flex items-center justify-center rounded-[var(--radius-pill)] px-5 py-2.5 font-[var(--font-sans)] font-medium transition-[filter] hover:brightness-110 active:brightness-95"
            style={{ fontSize: "var(--text-small)", background: "var(--color-brand)", color: "var(--stz-white)" }}
          >
            Create Testimonial
          </Link>
        </div>
      </div>

      <TestimonialStatusFilterTabs active={status ?? "all"} />

      {!result.ok ? (
        <AdminErrorState title="Unable to load testimonials." message={result.message} />
      ) : (
        <TestimonialTable testimonials={result.data} filtered={status !== undefined} statusQuery={status ? `?status=${status}` : ""} />
      )}
    </div>
  );
}
