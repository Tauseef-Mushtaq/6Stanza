import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SubtleGrid } from "@/components/ui/Divider";
import { BrandMark } from "@/components/ui/BrandMark";
import { Reveal, SplitHeading, ScaleReveal } from "@/components/motion";
import { ctaRoute } from "@/config/routes";

/**
 * CHAPTER 07 — the conclusion of the cinematic story. Large typography,
 * the geometric mark, an atmospheric background, and a single clear
 * CTA into `/start-project` rather than a generic "contact us" strip.
 */
export function FinalCta() {
  return (
    <section
      className="relative flex min-h-[85svh] w-full flex-col items-center justify-center overflow-hidden text-center"
      style={{ background: "var(--stz-navy-950)", color: "var(--stz-white)" }}
    >
      <SubtleGrid />
      <div className="pointer-events-none absolute inset-0" style={{ background: "var(--surface-glow)" }} aria-hidden />

      <Container className="relative z-10 flex flex-col items-center gap-8 py-32">
        <ScaleReveal from={0.85}>
          <BrandMark size={56} />
        </ScaleReveal>

        <SplitHeading
          as="h2"
          unit="words"
          className="max-w-3xl font-[var(--font-display)] tracking-tight"
          style={{ fontSize: "var(--text-h1)", lineHeight: "var(--leading-tight)" }}
        >
          Let&apos;s build the system your business runs on.
        </SplitHeading>

        <Reveal direction="up" delay={0.2}>
          <p className="max-w-lg" style={{ fontSize: "var(--text-body-lg)", color: "var(--color-muted-inverse)" }}>
            Tell us where things stand today — we&apos;ll come back with
            how 6STANZA would build it.
          </p>
        </Reveal>

        <Reveal direction="up" delay={0.3}>
          <Link
            href={ctaRoute.href}
            className="mt-2 inline-flex items-center justify-center rounded-[var(--radius-pill)] px-9 py-4 font-[var(--font-sans)] font-medium transition-[filter] hover:brightness-110"
            style={{ background: "var(--color-brand)", color: "var(--stz-white)", fontSize: "var(--text-body-lg)" }}
          >
            {ctaRoute.label}
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
