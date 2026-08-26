import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine, SubtleGrid } from "@/components/ui/Divider";
import { Reveal, SplitHeading } from "@/components/motion";

/**
 * CHAPTER 01 — Opening. Full-viewport, dark, matching the closing-CTA
 * visual family used elsewhere on the site (Hero/FinalCta pattern) so
 * this page's opener reads as belonging to the same world rather than
 * a bolted-on form landing.
 */
export function StartProjectHero() {
  return (
    <section
      className="relative flex min-h-svh w-full flex-col justify-center overflow-hidden"
      style={{ background: "var(--stz-navy-950)", color: "var(--stz-white)", paddingTop: "var(--safe-top)" }}
    >
      <SubtleGrid className="opacity-30" />
      <div className="pointer-events-none absolute inset-0" style={{ background: "var(--surface-glow)" }} aria-hidden />

      <Container className="relative z-10 flex flex-col gap-6 lg:max-w-[65%]">
        <Reveal direction="up" className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel style={{ color: "var(--color-brand-soft)" }}>Start a Project</TechnicalLabel>
        </Reveal>

        <SplitHeading
          as="h1"
          unit="words"
          className="font-[var(--font-display)] tracking-tight"
          style={{ fontSize: "clamp(2.5rem, 6vw, 6rem)", lineHeight: 1.05 }}
        >
          Let&apos;s build what comes next.
        </SplitHeading>

        <Reveal direction="up" delay={0.25}>
          <p className="max-w-xl" style={{ fontSize: "var(--text-body-lg)", color: "var(--color-muted-inverse)" }}>
            Tell us what you&apos;re trying to build. A few details below
            are enough to start a real conversation — no account, no
            sales call required first.
          </p>
        </Reveal>

        <Reveal direction="up" delay={0.32}>
          <Link
            href="/discovery"
            className="inline-flex w-fit items-center gap-2 underline-offset-4 transition-colors hover:underline"
            style={{ fontSize: "var(--text-small)", color: "var(--color-brand-soft)" }}
          >
            Not sure yet? Try Smart Project Discovery →
          </Link>
        </Reveal>

        <Reveal direction="up" delay={0.4} className="flex items-center gap-2 pt-2" style={{ color: "var(--color-text-muted)" }}>
          <span style={{ fontSize: "var(--text-caption)" }}>Begin below</span>
          <span aria-hidden style={{ fontSize: "var(--text-caption)" }}>↓</span>
        </Reveal>
      </Container>
    </section>
  );
}
