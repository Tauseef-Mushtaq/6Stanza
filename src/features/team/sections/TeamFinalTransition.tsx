import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SubtleGrid } from "@/components/ui/Divider";
import { Reveal, SplitHeading } from "@/components/motion";
import { ctaRoute } from "@/config/routes";

/**
 * CHAPTER 07 — closing transition (§16). Not the contact page — a
 * conceptual handoff toward working with the team, same dark/glow
 * family as the other closing chapters across the site, existing CTA
 * route only.
 */
export function TeamFinalTransition() {
  return (
    <section
      className="relative flex min-h-[80svh] w-full flex-col items-center justify-center overflow-hidden text-center"
      style={{ background: "var(--stz-navy-950)", color: "var(--stz-white)" }}
    >
      <SubtleGrid className="opacity-30" />
      <div className="pointer-events-none absolute inset-0" style={{ background: "var(--surface-glow)" }} aria-hidden />

      <Container className="relative z-10 flex flex-col items-center gap-8 py-28">
        <SplitHeading
          as="h2"
          unit="words"
          className="max-w-3xl font-[var(--font-display)] tracking-tight"
          style={{ fontSize: "var(--text-h1)", lineHeight: "var(--leading-tight)" }}
        >
          Build something worth moving forward.
        </SplitHeading>

        <Reveal direction="up" delay={0.2}>
          <Link
            href={ctaRoute.href}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-[var(--radius-pill)] px-9 py-4 font-[var(--font-sans)] font-medium transition-[filter] hover:brightness-110"
            style={{ background: "var(--color-brand)", color: "var(--stz-white)", fontSize: "var(--text-body-lg)" }}
          >
            {ctaRoute.label}
            <span aria-hidden>→</span>
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
