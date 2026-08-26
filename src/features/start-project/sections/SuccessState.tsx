import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { Reveal } from "@/components/motion";

interface SuccessStateProps {
  /** Module: Consultation Booking 1 — optional convenience prefill for the "Book a Consultation" link; never required, never validated here. */
  name?: string;
  email?: string;
}

/**
 * Shown in place of the form once submission succeeds. Viewport-
 * dominant per §16 ("success state = viewport-dominant"), with real
 * `<Link>` navigation options rather than leaving the visitor stranded
 * on a blank confirmation.
 *
 * Module: Consultation Booking 1 — adds a "Book a Consultation" link
 * alongside the existing three. This is deliberately a distinct,
 * optional next step rather than part of the inquiry submission
 * itself (spec: "clearly distinguish inquiry submission from
 * consultation booking") — sending the inquiry already succeeded by
 * the time this renders; booking a slot is a separate action the
 * visitor may or may not take.
 */
export function SuccessState({ name, email }: SuccessStateProps = {}) {
  const consultationHref = buildConsultationHref(name, email);

  return (
    <section
      className="relative flex min-h-svh w-full flex-col justify-center"
      style={{ background: "var(--stz-navy-950)", color: "var(--stz-white)" }}
    >
      <Container className="flex flex-col gap-6 lg:max-w-[60%]">
        <Reveal direction="up" className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel style={{ color: "var(--color-brand-soft)" }}>Submitted</TechnicalLabel>
        </Reveal>

        <Reveal direction="up" delay={0.1}>
          <h2
            className="font-[var(--font-display)] tracking-tight"
            style={{ fontSize: "var(--text-h1)", lineHeight: "var(--leading-tight)" }}
          >
            Message received.
          </h2>
        </Reveal>

        <Reveal direction="up" delay={0.2}>
          <p className="max-w-lg" style={{ fontSize: "var(--text-body-lg)", color: "var(--color-muted-inverse)" }}>
            We&apos;ll review what you&apos;ve shared and get back to you.
            In the meantime, feel free to look around.
          </p>
        </Reveal>

        <Reveal direction="up" delay={0.28}>
          <Link
            href={consultationHref}
            className="inline-flex w-fit items-center justify-center rounded-[var(--radius-pill)] px-6 py-3 font-[var(--font-sans)] font-medium transition-colors"
            style={{ background: "var(--color-brand)", color: "var(--stz-white)", fontSize: "var(--text-small)" }}
          >
            Book a Consultation →
          </Link>
        </Reveal>

        <Reveal direction="up" delay={0.3} className="flex flex-wrap gap-4 pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-[var(--radius-pill)] px-6 py-3 font-[var(--font-sans)] font-medium transition-colors"
            style={{ border: "1px solid var(--color-border-inverse)", color: "var(--stz-white)", fontSize: "var(--text-small)" }}
          >
            Back to Home
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center justify-center rounded-[var(--radius-pill)] px-6 py-3 font-[var(--font-sans)] font-medium transition-colors hover:text-[var(--color-brand-soft)]"
            style={{ color: "var(--stz-white)", fontSize: "var(--text-small)" }}
          >
            Explore Services
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center justify-center rounded-[var(--radius-pill)] px-6 py-3 font-[var(--font-sans)] font-medium transition-colors hover:text-[var(--color-brand-soft)]"
            style={{ color: "var(--stz-white)", fontSize: "var(--text-small)" }}
          >
            View Projects
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}

function buildConsultationHref(name?: string, email?: string): string {
  const params = new URLSearchParams();
  if (name) params.set("name", name);
  if (email) params.set("email", email);
  const query = params.toString();
  return query ? `/start-project/consultation?${query}` : "/start-project/consultation";
}
