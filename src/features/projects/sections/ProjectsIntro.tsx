import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { Reveal } from "@/components/motion";

/**
 * CHAPTER 02 — editorial transition from the hero into the featured
 * work (spec §5). A short, large-type introduction, not another full
 * hero — this is deliberately a shorter chapter than 01/03 so the page
 * doesn't repeat the same viewport-dominant beat twice in a row.
 */
export function ProjectsIntro() {
  return (
    <section className="relative w-full" style={{ background: "var(--color-background)" }}>
      <Container style={{ paddingBlock: "var(--space-4xl)" }}>
        <Reveal direction="up" className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel>02 — Selected Systems</TechnicalLabel>
        </Reveal>

        <Reveal direction="up" delay={0.1}>
          <p
            className="mt-8 max-w-3xl font-[var(--font-display)] tracking-tight"
            style={{ fontSize: "var(--text-h1)", lineHeight: "var(--leading-tight)" }}
          >
            Digital products, platforms and systems built to move
            businesses forward.
          </p>
        </Reveal>

        <Reveal direction="up" delay={0.2}>
          <p className="mt-6 max-w-xl" style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-body-lg)" }}>
            Every project below started as a real constraint — a release
            process, a cost curve, an information architecture — and
            ended as infrastructure the client still runs on today.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
