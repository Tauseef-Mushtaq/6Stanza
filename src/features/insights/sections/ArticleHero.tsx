import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { SubtleGrid } from "@/components/ui/Divider";
import { Reveal, SplitHeading } from "@/components/motion";
import type { Insight } from "@/features/insights/data/insights";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

/**
 * Article detail CHAPTER 01 — near-full-viewport hero (§24): category,
 * large title, date + reading time. Same dark/glow hero family as the
 * rest of the site, `--header-h` clearance for the fixed header.
 */
export function ArticleHero({ insight }: { insight: Insight }) {
  return (
    <section
      className="relative flex min-h-[85svh] w-full flex-col justify-center overflow-hidden"
      style={{ background: "var(--stz-navy-950)", color: "var(--stz-white)", paddingTop: "var(--safe-top)" }}
    >
      <SubtleGrid className="opacity-40" />

      {/*
       * Fix: the admin "Cover image" upload (InsightForm.tsx) reached
       * `insights.media_path` in the database but nothing on the
       * public site ever read it back or rendered it — this is the
       * actual reason the image never appeared. Renders only when an
       * admin has actually uploaded one (spec-equivalent to
       * ProjectGallery's `images = []` fallback below) — never a
       * fabricated placeholder image.
       */}
      {insight.coverImage ? (
        <div className="absolute inset-0 z-0">
          <Image
            src={insight.coverImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, var(--stz-navy-950) 0%, rgba(6,10,20,0.55) 45%, var(--stz-navy-950) 100%)",
            }}
          />
        </div>
      ) : null}

      <Container className="relative z-10 flex flex-col gap-7">
        <Reveal direction="up">
          <Link
            href="/insights"
            className="inline-flex items-center gap-2 font-[var(--font-mono)] uppercase transition-colors hover:text-[var(--color-brand-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-brand)]"
            style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-muted-inverse)" }}
          >
            <span aria-hidden>←</span> Back to Insights
          </Link>
        </Reveal>

        <Reveal direction="up" delay={0.05}>
          <TechnicalLabel style={{ color: "var(--color-brand-soft)" }}>{insight.category}</TechnicalLabel>
        </Reveal>

        <SplitHeading
          as="h1"
          unit="words"
          className="max-w-4xl font-[var(--font-display)] tracking-tight"
          style={{ fontSize: "clamp(2.25rem, 5.5vw, 4.75rem)", lineHeight: 1.05 }}
        >
          {insight.title}
        </SplitHeading>

        <Reveal direction="up" delay={0.3}>
          <span style={{ fontSize: "var(--text-small)", color: "var(--color-muted-inverse)" }}>
            {formatDate(insight.date)} · {insight.readingTime} read
          </span>
        </Reveal>
      </Container>
    </section>
  );
}
