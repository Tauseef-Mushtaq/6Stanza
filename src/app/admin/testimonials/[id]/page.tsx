import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { getTestimonialForAdmin } from "@/lib/services/testimonialContentService";
import { TestimonialForm } from "@/features/admin/components/TestimonialForm";
import { ArchiveTestimonialButton } from "@/features/admin/components/ArchiveTestimonialButton";
import { DeleteTestimonialButton } from "@/features/admin/components/DeleteTestimonialButton";
import { ContentStatusBadge } from "@/features/admin/components/ContentStatusBadge";
import { AdminErrorState } from "@/features/admin/components/AdminErrorState";

export const metadata: Metadata = { title: "Edit Testimonial" };

/**
 * MODULE-TESTIMONIAL-1 — `/admin/testimonials/[id]`. Fetches through
 * `getTestimonialForAdmin`, itself `requireAdmin()`-gated and
 * RLS-backed — same shape as `EditTeamMemberPage`. Handles a missing
 * or invalid id with `notFound()` rather than crashing.
 */
export default async function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getTestimonialForAdmin(id);

  if (!result.ok) {
    return <AdminErrorState title="Unable to load this testimonial." message={result.message} />;
  }

  const testimonial = result.data;
  if (!testimonial) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Link
          href="/admin/testimonials"
          className="font-[var(--font-mono)] uppercase transition-colors hover:text-[var(--color-brand)]"
          style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-secondary)" }}
        >
          ← Testimonials
        </Link>
        <div className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel>Edit Testimonial</TechnicalLabel>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-[var(--font-display)]" style={{ fontSize: "var(--text-h2)", color: "var(--color-text-primary)" }}>
            {testimonial.name}
          </h1>
          <div className="flex items-center gap-3">
            <ContentStatusBadge status={testimonial.status} />
            <ArchiveTestimonialButton id={testimonial.id} alreadyArchived={testimonial.status === "archived"} />
            <DeleteTestimonialButton id={testimonial.id} />
          </div>
        </div>
      </div>

      <TestimonialForm testimonial={testimonial} />
    </div>
  );
}
