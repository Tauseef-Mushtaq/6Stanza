import type { Metadata } from "next";
import Link from "next/link";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { TestimonialForm } from "@/features/admin/components/TestimonialForm";

export const metadata: Metadata = { title: "New Testimonial" };

/** MODULE-TESTIMONIAL-1 — `/admin/testimonials/new`. Renders `TestimonialForm` with no `testimonial` prop, i.e. create mode. */
export default function NewTestimonialPage() {
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
          <TechnicalLabel>New Testimonial</TechnicalLabel>
        </div>
        <h1 className="font-[var(--font-display)]" style={{ fontSize: "var(--text-h2)", color: "var(--color-text-primary)" }}>
          Create Testimonial
        </h1>
      </div>

      <TestimonialForm />
    </div>
  );
}
