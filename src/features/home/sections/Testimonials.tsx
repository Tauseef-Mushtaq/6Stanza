import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { Reveal } from "@/components/motion";
import { PublicRetryState } from "@/components/ui/PublicRetryState";
import { getPublicTestimonials } from "@/features/testimonials/data/publicTestimonials";

/**
 * CHAPTER — Testimonials. Sits between Work (05) and Team (06) on the
 * homepage, the trust chapter the Selected Work → Testimonials → Team
 * sequence calls for.
 *
 * Deliberately NOT a carousel/slider and NOT a three-card grid: an
 * editorial, vertically stacked sequence of large quotes, each
 * revealed on scroll with the existing `Reveal` primitive (no new
 * GSAP architecture, no new RAF loop). Every testimonial is reachable
 * by ordinary scrolling — nothing depends on an auto-rotating
 * mechanism or horizontal-drag interaction to be seen, satisfying the
 * accessibility requirement that no testimonial's visibility depend
 * on motion.
 *
 * No star ratings, no AggregateRating — trust comes from the quote
 * itself, not fabricated scoring (module spec §13/§21).
 *
 * Renders nothing when there are no published testimonials (matches
 * `TeamJourney`'s empty-state approach); shows a controlled retry
 * state only when the read genuinely failed, never a broken layout.
 */
export async function Testimonials() {
  const testimonials = await getPublicTestimonials();

  if (!testimonials.ok) {
    return (
      <section className="relative w-full" style={{ background: "var(--color-background)" }}>
        <Container style={{ paddingBlock: "var(--space-section)" }}>
          <div className="flex items-center gap-3">
            <AccentLine />
            <TechnicalLabel>Testimonials</TechnicalLabel>
          </div>
          <div className="mt-8">
            <PublicRetryState title="We couldn't load testimonials right now" description="Please try again." />
          </div>
        </Container>
      </section>
    );
  }

  if (testimonials.data.length === 0) return null;

  return (
    <section className="relative w-full" style={{ background: "var(--color-background)" }}>
      <Container style={{ paddingBlock: "var(--space-section)" }}>
        <Reveal>
          <div className="flex items-center gap-3">
            <AccentLine />
            <TechnicalLabel>What clients say</TechnicalLabel>
          </div>
        </Reveal>

        <div className="mt-12 flex flex-col gap-16 lg:gap-20">
          {testimonials.data.map((testimonial, i) => (
            <Reveal key={testimonial.id} delay={i === 0 ? 0 : 0.05}>
              <figure
                className={`flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10 ${
                  i % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className="shrink-0">
                  {testimonial.image ? (
                    <div className="relative h-16 w-16 overflow-hidden rounded-full lg:h-20 lg:w-20">
                      <Image src={testimonial.image} alt={testimonial.name} fill className="object-cover" sizes="80px" />
                    </div>
                  ) : (
                    <div
                      className="flex h-16 w-16 items-center justify-center rounded-full lg:h-20 lg:w-20"
                      style={{ background: "var(--color-surface-elevated)" }}
                      aria-hidden
                    >
                      <span className="font-[var(--font-display)]" style={{ fontSize: "var(--text-body-lg)", color: "var(--color-text-secondary)" }}>
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex max-w-3xl flex-col gap-5">
                  <blockquote
                    className="font-[var(--font-display)] tracking-tight"
                    style={{ fontSize: "clamp(1.375rem, 2.6vw, 2.1rem)", lineHeight: "var(--leading-tight)", color: "var(--color-text-primary)" }}
                  >
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                  <figcaption className="flex flex-col gap-0.5">
                    <span style={{ fontSize: "var(--text-body)", color: "var(--color-text-primary)" }}>{testimonial.name}</span>
                    {testimonial.role || testimonial.company ? (
                      <span className="font-[var(--font-mono)] uppercase" style={{ fontSize: "var(--text-caption)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-secondary)" }}>
                        {[testimonial.role, testimonial.company].filter(Boolean).join(" · ")}
                      </span>
                    ) : null}
                  </figcaption>
                </div>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
