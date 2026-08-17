import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { Divider } from "@/components/ui/Divider";
import { Reveal, ScaleReveal } from "@/components/motion";
import { team } from "@/features/home/data/team";

/**
 * CHAPTER 04 — individual focus (§13): one member at a time, full-width
 * editorial stack (the same vertical-rhythm technique as Projects'
 * `FeaturedProjects` — alternating side, `Reveal`/`ScaleReveal` only),
 * re-oriented for a person instead of a case study so it reads as a
 * companion chapter, not a re-skin of `TeamSequence` above it.
 */
export function TeamFocus() {
  return (
    <section className="relative w-full" style={{ background: "var(--color-background)" }}>
      <Container style={{ paddingBlock: "var(--space-4xl)" }}>
        <div className="flex flex-col">
          <Divider />
          {team.map((member, i) => {
            const flip = i % 2 === 1;
            return (
              <article key={member.slug} className="flex min-h-[70svh] flex-col justify-center py-10">
                <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10">
                  <div className={`lg:col-span-5 ${flip ? "lg:order-1" : "lg:order-2"}`}>
                    <ScaleReveal className="mx-auto block w-full max-w-[420px] lg:max-w-none">
                      <div
                        className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-lg)]"
                        style={{ background: "linear-gradient(160deg, var(--stz-navy-800), var(--stz-blue-600))" }}
                      >
                        {member.image ? (
                          <Image src={member.image} alt={member.name} fill className="object-cover" sizes="(min-width: 1024px) 40vw, 90vw" />
                        ) : (
                          <span
                            className="absolute inset-0 flex items-center justify-center font-[var(--font-display)]"
                            style={{ fontSize: "var(--text-hero)", color: "rgba(247,249,252,0.8)" }}
                            aria-hidden
                          >
                            {member.initials}
                          </span>
                        )}
                      </div>
                    </ScaleReveal>
                  </div>

                  <div className={`flex flex-col justify-center gap-4 lg:col-span-7 ${flip ? "lg:order-2" : "lg:order-1"}`}>
                    <Reveal direction="up" className="flex items-center gap-4">
                      <span
                        className="font-[var(--font-display)] tabular-nums"
                        style={{ fontSize: "var(--text-h2)", color: "var(--color-brand)", opacity: 0.85, lineHeight: 1 }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <TechnicalLabel>{member.discipline}</TechnicalLabel>
                    </Reveal>

                    <Reveal direction="up" delay={0.05}>
                      <h3
                        className="font-[var(--font-display)] tracking-tight"
                        style={{ fontSize: "var(--text-h1)", lineHeight: "var(--leading-tight)" }}
                      >
                        {member.name}
                      </h3>
                    </Reveal>

                    <Reveal direction="up" delay={0.1}>
                      <span
                        className="font-[var(--font-mono)] uppercase"
                        style={{ fontSize: "var(--text-nav)", letterSpacing: "var(--tracking-label)", color: "var(--color-brand)" }}
                      >
                        {member.role}
                      </span>
                    </Reveal>

                    <Reveal direction="up" delay={0.15}>
                      <p className="max-w-lg pt-2" style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-body-lg)" }}>
                        {member.shortBio}
                      </p>
                    </Reveal>
                  </div>
                </div>
              </article>
            );
          })}
          <Divider />
        </div>
      </Container>
    </section>
  );
}
