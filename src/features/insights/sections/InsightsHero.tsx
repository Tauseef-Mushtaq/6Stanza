import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine, SubtleGrid } from "@/components/ui/Divider";
import { Reveal, SplitHeading, Parallax } from "@/components/motion";
import { insights } from "@/features/insights/data/insights";

/**
 * CHAPTER 01 — Insights hero, in the same full-viewport family as
 * Team/Services/About/Projects heroes, with its own composition: a
 * background index count instead of a numeral tied to headcount, and
 * copy that frames the section as technical thinking rather than a
 * blog.
 */
export function InsightsHero() {
  return (
    <section
      className="relative flex min-h-svh w-full flex-col justify-center overflow-hidden"
      style={{ background: "var(--stz-navy-950)", color: "var(--stz-white)", paddingTop: "var(--header-h)" }}
    >
      <SubtleGrid className="opacity-40" />
      <Parallax speed={0.2} className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0" style={{ background: "var(--surface-glow)" }} />
      </Parallax>

      <Container className="relative z-10 flex flex-col gap-8">
        <Reveal direction="up" className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel style={{ color: "var(--color-brand-soft)" }}>
            Insights — {String(insights.length).padStart(2, "0")} Articles
          </TechnicalLabel>
        </Reveal>

        <SplitHeading
          as="h1"
          unit="words"
          className="max-w-4xl font-[var(--font-display)] tracking-tight"
          style={{ fontSize: "clamp(2.75rem, 7vw, 7rem)", lineHeight: 0.98 }}
        >
          Ideas, systems, and technical thinking.
        </SplitHeading>

        <Reveal direction="up" delay={0.3}>
          <p className="max-w-xl" style={{ fontSize: "var(--text-body-lg)", color: "var(--color-muted-inverse)" }}>
            Notes from 6STANZA on engineering, cloud, DevOps, and
            security — the thinking behind how we build systems, not
            just what we ship.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
