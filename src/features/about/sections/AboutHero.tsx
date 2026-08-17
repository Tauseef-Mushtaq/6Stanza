import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine, SubtleGrid } from "@/components/ui/Divider";
import { BrandMark } from "@/components/ui/BrandMark";
import { Reveal, SplitHeading, Parallax } from "@/components/motion";

/**
 * CHAPTER 01 — About hero. Deliberately a different composition from the
 * homepage Hero (no 3D scene, no right-side split) — a centered, mark-
 * anchored statement, so the two openers read as siblings, not clones.
 */
export function AboutHero() {
  return (
    <section
      className="relative flex min-h-svh w-full flex-col items-center justify-center overflow-hidden text-center"
      style={{ background: "var(--stz-navy-950)", color: "var(--stz-white)", paddingTop: "var(--header-h)" }}
    >
      <SubtleGrid className="opacity-40" />
      <Parallax speed={0.25} className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0" style={{ background: "var(--surface-glow)" }} />
      </Parallax>

      <Container className="relative z-10 flex flex-col items-center gap-8">
        <Reveal direction="up">
          <BrandMark size={44} />
        </Reveal>

        <Reveal direction="up" delay={0.1} className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel style={{ color: "var(--color-brand-soft)" }}>About 6STANZA</TechnicalLabel>
          <AccentLine />
        </Reveal>

        <SplitHeading
          as="h1"
          unit="words"
          className="max-w-4xl font-[var(--font-display)] tracking-tight"
          style={{ fontSize: "clamp(2.75rem, 6.5vw, 6.5rem)", lineHeight: 1.05 }}
        >
          Technology built with purpose.
        </SplitHeading>

        <Reveal direction="up" delay={0.35}>
          <p className="max-w-xl" style={{ fontSize: "var(--text-body-lg)", color: "var(--color-muted-inverse)" }}>
            6STANZA is a technology partner — we design, build, and run the
            software and infrastructure serious companies depend on.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
