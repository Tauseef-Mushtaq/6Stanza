import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SubtleGrid } from "@/components/ui/Divider";
import { Reveal, SplitHeading } from "@/components/motion";
import { ctaRoute } from "@/config/routes";

/**
 * CHAPTER 07 — Final CTA. Same visual family as the homepage's closing
 * chapter (dark, glow, single CTA into /start-project) but a distinct
 * composition — no brand mark, left-anchored rather than centered —
 * so it reads as About's own ending, not a duplicate.
 */
export function FinalCta() {
  return (
    <section
      className="relative flex min-h-[70svh] w-full flex-col justify-center overflow-hidden"
      style={{ background: "var(--stz-navy-950)", color: "var(--stz-white)" }}
    >
      <SubtleGrid className="opacity-30" />
      <div className="pointer-events-none absolute inset-0" style={{ background: "var(--surface-glow)" }} aria-hidden />

      <Container className="relative z-10 flex flex-col gap-8 py-24 lg:max-w-[60%]">
        <SplitHeading
          as="h2"
          unit="words"
          className="font-[var(--font-display)] tracking-tight"
          style={{ fontSize: "var(--text-h1)", lineHeight: "var(--leading-tight)" }}
        >
          Let&apos;s build what comes next.
        </SplitHeading>

        <Reveal direction="up" delay={0.15}>
          <p className="max-w-lg" style={{ fontSize: "var(--text-body-lg)", color: "var(--color-muted-inverse)" }}>
            If you&apos;re weighing whether 6STANZA is the right team for
            what you&apos;re building, the fastest way to find out is to
            tell us about it.
          </p>
        </Reveal>

        <Reveal direction="up" delay={0.25}>
          <Link
            href={ctaRoute.href}
            className="mt-2 inline-flex w-fit items-center justify-center rounded-[var(--radius-pill)] px-9 py-4 font-[var(--font-sans)] font-medium transition-[filter] hover:brightness-110"
            style={{ background: "var(--color-brand)", color: "var(--stz-white)", fontSize: "var(--text-body-lg)" }}
          >
            {ctaRoute.label}
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
