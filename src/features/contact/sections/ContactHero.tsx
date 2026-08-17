import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine, SubtleGrid } from "@/components/ui/Divider";
import { Reveal, SplitHeading } from "@/components/motion";

/**
 * CHAPTER 01 — Contact hero. Lighter/shorter than Start Project's
 * opener (this page is a doorway, not the primary conversion flow —
 * see ContactCta) but still a full-viewport cinematic chapter.
 */
export function ContactHero() {
  return (
    <section
      className="relative flex min-h-svh w-full flex-col justify-center overflow-hidden"
      style={{ background: "var(--stz-navy-950)", color: "var(--stz-white)", paddingTop: "var(--header-h)" }}
    >
      <SubtleGrid className="opacity-25" />

      <Container className="relative z-10 flex flex-col gap-6 lg:max-w-[60%]">
        <Reveal direction="up" className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel style={{ color: "var(--color-brand-soft)" }}>Contact</TechnicalLabel>
        </Reveal>

        <SplitHeading
          as="h1"
          unit="words"
          className="font-[var(--font-display)] tracking-tight"
          style={{ fontSize: "clamp(2.25rem, 5vw, 5rem)", lineHeight: 1.08 }}
        >
          Let&apos;s start a conversation.
        </SplitHeading>

        <Reveal direction="up" delay={0.2}>
          <p className="max-w-xl" style={{ fontSize: "var(--text-body-lg)", color: "var(--color-muted-inverse)" }}>
            Whether you have a project in mind or just want to ask a
            question, this is the place to start.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
