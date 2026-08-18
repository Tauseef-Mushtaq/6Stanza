import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine, SubtleGrid } from "@/components/ui/Divider";
import { Reveal, SplitHeading, Parallax } from "@/components/motion";
import { team } from "@/features/home/data/team";

/**
 * CHAPTER 01 — Team hero. Same full-viewport, mark-anchored family as
 * About/Services' heroes (§6), but with its own composition: the
 * headline sits left, and the team's headcount runs as a large
 * background numeral on the right — establishing "people" as the
 * subject before a single name appears.
 */
export function TeamHero() {
  return (
    <section
      className="relative flex min-h-svh w-full flex-col justify-center overflow-hidden"
      style={{ background: "var(--stz-navy-950)", color: "var(--stz-white)", paddingTop: "var(--safe-top)" }}
    >
      <SubtleGrid className="opacity-40" />
      <Parallax speed={0.2} className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0" style={{ background: "var(--surface-glow)" }} />
      </Parallax>

      <Parallax
        speed={0.15}
        className="pointer-events-none absolute -right-6 bottom-0 select-none font-[var(--font-display)] md:-right-10"
        aria-hidden
      >
        <span style={{ fontSize: "clamp(9rem, 26vw, 26rem)", color: "rgba(143,176,255,0.05)", lineHeight: 1 }}>
          {String(team.length).padStart(2, "0")}
        </span>
      </Parallax>

      <Container className="relative z-10 flex flex-col gap-8">
        <Reveal direction="up" className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel style={{ color: "var(--color-brand-soft)" }}>The Team</TechnicalLabel>
        </Reveal>

        <SplitHeading
          as="h1"
          unit="words"
          className="max-w-4xl font-[var(--font-display)] tracking-tight"
          style={{ fontSize: "clamp(2.75rem, 7vw, 7rem)", lineHeight: 0.98 }}
        >
          The people behind the systems.
        </SplitHeading>

        <Reveal direction="up" delay={0.3}>
          <p className="max-w-xl" style={{ fontSize: "var(--text-body-lg)", color: "var(--color-muted-inverse)" }}>
            A multidisciplinary team spanning engineering, design,
            infrastructure, and strategy — building digital systems that
            move businesses forward.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
