import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion";
import type { InsightBlock } from "@/features/insights/data/insights";

function Block({ block }: { block: InsightBlock }) {
  switch (block.type) {
    case "heading":
      return (
        <h2
          className="mt-4 font-[var(--font-display)] tracking-tight"
          style={{ fontSize: "var(--text-h3)", lineHeight: "var(--leading-snug)" }}
        >
          {block.text}
        </h2>
      );
    case "paragraph":
      return (
        <p style={{ fontSize: "var(--text-body-lg)", lineHeight: "var(--leading-relaxed, 1.7)", color: "var(--color-text-secondary)" }}>
          {block.text}
        </p>
      );
    case "quote":
      return (
        <blockquote
          className="my-2 pl-6"
          style={{ borderLeft: "2px solid var(--color-brand)" }}
        >
          <p
            className="font-[var(--font-display)] tracking-tight"
            style={{ fontSize: "var(--text-h3)", lineHeight: "var(--leading-snug)" }}
          >
            {block.text}
          </p>
          {block.attribution ? (
            <cite
              className="mt-3 block not-italic font-[var(--font-mono)] uppercase"
              style={{ fontSize: "var(--text-caption)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-muted)" }}
            >
              {block.attribution}
            </cite>
          ) : null}
        </blockquote>
      );
    case "list":
      return (
        <ul className="flex flex-col gap-3">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3" style={{ fontSize: "var(--text-body-lg)", color: "var(--color-text-secondary)" }}>
              <span aria-hidden style={{ color: "var(--color-brand)" }}>
                —
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "code":
      return (
        <pre
          className="overflow-x-auto rounded-[var(--radius-md)] p-5"
          style={{ background: "var(--stz-navy-950)", border: "1px solid var(--color-border-inverse)" }}
        >
          <code
            className="font-[var(--font-mono)]"
            style={{ fontSize: "var(--text-small)", color: "var(--stz-white)", lineHeight: "var(--leading-relaxed, 1.7)" }}
          >
            {block.code}
          </code>
        </pre>
      );
    case "callout":
      return (
        <div
          className="rounded-[var(--radius-md)] p-6"
          style={{ background: "var(--color-surface-elevated)", border: "1px solid var(--color-border)" }}
        >
          <span
            className="font-[var(--font-mono)] uppercase"
            style={{ fontSize: "var(--text-caption)", letterSpacing: "var(--tracking-label)", color: "var(--color-brand)" }}
          >
            {block.label}
          </span>
          <p className="mt-2" style={{ fontSize: "var(--text-body)", color: "var(--color-text-primary)" }}>
            {block.text}
          </p>
        </div>
      );
    default:
      return null;
  }
}

/**
 * Article detail CHAPTER 03+ — the actual reading column (§24–§26).
 * Comfortable line length (`max-w-[68ch]`), no display-scale typography
 * for body copy, and technical elements (code/callout/quote) only ever
 * rendered when the article's own data contains them.
 */
export function ArticleContent({ content }: { content: InsightBlock[] }) {
  return (
    <section className="relative w-full" style={{ background: "var(--color-background)" }}>
      <Container style={{ paddingBlock: "var(--space-section)" }}>
        <Reveal direction="up" staggerChildren className="mx-auto flex max-w-[68ch] flex-col gap-7">
          {content.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
