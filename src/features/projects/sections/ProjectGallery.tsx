import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { Reveal, HorizontalScroller } from "@/components/motion";
import type { ProjectGalleryImage } from "@/features/projects/data/projectDetails";

interface ProjectGalleryProps {
  accent: number;
  seed: number;
  /** Module 9K — real CMS-uploaded images (spec §13), already ordered. Empty/omitted when the admin hasn't uploaded any — every panel falls back to the original procedural placeholder in that case, so this chapter never regresses for existing projects. */
  images?: ProjectGalleryImage[];
}

const PANEL_WIDTHS = ["40vw", "26vw", "32vw", "24vw"];
const PANEL_ASPECTS = ["aspect-[16/10]", "aspect-[3/4]", "aspect-[4/3]", "aspect-[3/4]"];
// Module 9K (gallery-rendering fix) — the four variants above are
// tuned for wide photography and were built before real uploads
// existed. Real admin-uploaded images are frequently portrait UI/app
// screenshots, and forcing those into a 16:10 or 4:3 box with
// `object-cover` crops off the top/bottom of the screenshot instead of
// showing it — which is what actually broke visually in production.
// A single tall, closer-to-square box plus `object-contain` (see
// below) fits both photography and screenshots without cropping
// either.
//
// Module 9K (scroll fix) — the panel widths/max-width above were
// tuned for the ORIGINAL 16:10/4:3 placeholder shapes, which are wider
// than tall. Pairing that same width scale with the taller 4:5 box
// made real-image panels taller than this section's pinned viewport-
// height stage, so the top/bottom of every uploaded image was clipped
// off-screen during the scroll — not a cropping problem this time, a
// literal "the panel doesn't fit the pinned stage" problem. Narrower
// widths (already reduced above) plus the explicit `maxHeight` below
// keep every panel — placeholder or real image — inside the pinned
// section regardless of aspect ratio or viewport size.
const UPLOADED_PANEL_ASPECT = "aspect-[4/5]";
const PANEL_MAX_HEIGHT = "50vh";

/**
 * CHAPTER 06 — project gallery (spec §10 Ch.06). A vertical-scroll-
 * drives-horizontal-movement sequence of asymmetric panels — reusing
 * `HorizontalScroller` (the same primitive Process/Team already use)
 * rather than a normal image grid, per the brief's explicit
 * instruction not to place three images in a row.
 *
 * Module 9K (revised): every uploaded image is now rendered, not just
 * the first four — the panel count follows `images.length` whenever
 * there's at least one real image, cycling through the same four
 * width/aspect variants for visual rhythm. Only when there are zero
 * uploaded images does this fall back to the original fixed four-panel
 * procedural placeholder, so a project with no gallery yet still shows
 * something.
 */
export function ProjectGallery({ accent, seed, images = [] }: ProjectGalleryProps) {
  const hasImages = images.length > 0;
  const panelCount = hasImages ? images.length : PANEL_WIDTHS.length;

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
          {Array.from({ length: panelCount }, (_, i) => {
            const image = hasImages ? images[i] : undefined;
            const width = PANEL_WIDTHS[i % PANEL_WIDTHS.length];
            const aspect = image ? UPLOADED_PANEL_ASPECT : PANEL_ASPECTS[i % PANEL_ASPECTS.length];
            return (
              <div
                key={image ? image.src : i}
                className={`relative shrink-0 ${aspect} overflow-hidden rounded-[var(--radius-lg)]`}
                style={{
                  width,
                  maxWidth: image ? "420px" : "720px",
                  maxHeight: PANEL_MAX_HEIGHT,
                  background: image ? "var(--color-surface)" : `linear-gradient(${135 + i * 30}deg, hsl(${accent} 85% ${10 + (i % 4) * 3}%), hsl(${accent} 65% ${26 + (i % 4) * 4}%))`,
                  border: "1px solid var(--color-border)",
                }}
              >
                {image ? (
                  // `object-contain` (not `cover`) — the panel's own
                  // background above fills whatever space is left
                  // around the image, so a portrait screenshot letterboxes
                  // cleanly instead of being cropped or bleeding into the
                  // next panel.
                  <Image src={image.src} alt={image.alt} fill className="object-contain" sizes="(min-width: 1024px) 50vw, 90vw" />
                ) : (
                  <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden preserveAspectRatio="none">
                    <defs>
                      <pattern id={`gallery-grid-${seed}-${i}`} width="8" height="8" patternUnits="userSpaceOnUse">
                        <path d="M 8 0 L 0 0 0 8" fill="none" stroke={`hsl(${accent} 60% 70%)`} strokeWidth="0.15" opacity={0.25} />
                      </pattern>
                    </defs>
                    <rect width="100" height="100" fill={`url(#gallery-grid-${seed}-${i})`} />
                  </svg>
                )}
              </div>
            );
          })}
        </HorizontalScroller>
      </div>

      {/* Exit breathing room (Module 4G's --safe-bottom) — this chapter
          had no gap into the next section before this fix. */}
      <div style={{ height: "var(--safe-bottom)" }} />
    </section>
  );
}
