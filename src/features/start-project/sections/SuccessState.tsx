import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { Reveal } from "@/components/motion";

/**
 * Shown in place of the form once submission succeeds. Viewport-
 * dominant per §16 ("success state = viewport-dominant"), with real
 * `<Link>` navigation options rather than leaving the visitor stranded
 * on a blank confirmation.
 */
export function SuccessState() {
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
