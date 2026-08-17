import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { Reveal, HorizontalScroller } from "@/components/motion";

interface ProjectGalleryProps {
  accent: number;
  seed: number;
}

const PANEL_WIDTHS = ["58vw", "38vw", "48vw", "34vw"];
const PANEL_ASPECTS = ["aspect-[16/10]", "aspect-[3/4]", "aspect-[4/3]", "aspect-[3/4]"];

/**
 * CHAPTER 06 — project gallery (spec §10 Ch.06). A vertical-scroll-
 * drives-horizontal-movement sequence of asymmetric panels — reusing
 * `HorizontalScroller` (the same primitive Process/Team already use)
 * rather than a normal image grid, per the brief's explicit
 * instruction not to place three images in a row. Panels are
 * structured gradient/diagram placeholders today, ready to swap for
 * real screenshots/video without touching the layout or motion.
 */
export function ProjectGallery({ accent, seed }: ProjectGalleryProps) {
  return (
    <section className="relative w-full" style={{ background: "var(--color-background)" }}>
      <Container style={{ paddingBlock: "var(--space-4xl)" }}>
        <Reveal direction="up" className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel>06 — Gallery</TechnicalLabel>
        </Reveal>
      </Container>

      <div className="mt-12">
        <HorizontalScroller trackClassName="items-center px-[var(--container-padding)] gap-6 lg:gap-8">
          {PANEL_WIDTHS.map((width, i) => (
            <div
              key={i}
              className={`relative shrink-0 ${PANEL_ASPECTS[i]} overflow-hidden rounded-[var(--radius-lg)]`}
              style={{
                width,
                maxWidth: "720px",
                background: `linear-gradient(${135 + i * 30}deg, hsl(${accent} 85% ${10 + i * 3}%), hsl(${accent} 65% ${26 + i * 4}%))`,
                border: "1px solid var(--color-border)",
              }}
            >
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden preserveAspectRatio="none">
                <defs>
                  <pattern id={`gallery-grid-${seed}-${i}`} width="8" height="8" patternUnits="userSpaceOnUse">
                    <path d="M 8 0 L 0 0 0 8" fill="none" stroke={`hsl(${accent} 60% 70%)`} strokeWidth="0.15" opacity={0.25} />
                  </pattern>
                </defs>
                <rect width="100" height="100" fill={`url(#gallery-grid-${seed}-${i})`} />
              </svg>
            </div>
          ))}
        </HorizontalScroller>
      </div>
    </section>
  );
}
