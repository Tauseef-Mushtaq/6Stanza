import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion";

/**
 * Article detail CHAPTER 02 — the large opening paragraph (§24), kept
 * separate from the reading column so it reads as a statement, not the
 * first line of body copy.
 */
export function ArticleIntro({ excerpt }: { excerpt: string }) {
  return (
    <section className="relative w-full" style={{ background: "var(--color-background)" }}>
      <Container style={{ paddingBlock: "var(--space-3xl, var(--space-section))" }}>
        <Reveal direction="up">
          <p
            className="mx-auto max-w-3xl font-[var(--font-display)] tracking-tight"
            style={{ fontSize: "var(--text-h2)", lineHeight: "var(--leading-snug)" }}
          >
            {excerpt}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
