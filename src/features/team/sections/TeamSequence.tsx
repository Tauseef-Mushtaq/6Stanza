"use client";

import { useState } from "react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { HorizontalScroller } from "@/components/motion";
import { team } from "@/features/home/data/team";

/**
 * CHAPTER 03 — the cinematic team sequence (§9/§10): vertical scroll
 * drives horizontal movement through tall editorial portraits via the
 * existing `HorizontalScroller` (continuous GSAP scrub, no per-item
 * snapping — see §29). A large readout above the strip tracks the
 * active member off `HorizontalScroller`'s own scroll progress, so the
 * "current person" reads clearly even though several portraits are
 * visible on desktop at once.
 */
export function TeamSequence() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = team[activeIndex];

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ background: "var(--stz-navy-950)", color: "var(--stz-white)" }}
    >
      <Container style={{ paddingTop: "clamp(3rem, 8vh, 5rem)" }}>
        <div className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel style={{ color: "var(--color-brand-soft)" }}>03 — Team</TechnicalLabel>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
          <h2
            className="max-w-xl font-[var(--font-display)] tracking-tight"
            style={{ fontSize: "clamp(1.75rem, 3.4vw, 2.75rem)", lineHeight: "var(--leading-tight)" }}
          >
            {active.name}
            <span style={{ color: "var(--color-brand-soft)" }}>.</span>
          </h2>
          <span
            className="font-[var(--font-mono)] uppercase"
            style={{ fontSize: "var(--text-nav)", letterSpacing: "var(--tracking-label)", color: "var(--color-muted-inverse)" }}
          >
            {String(activeIndex + 1).padStart(2, "0")} / {String(team.length).padStart(2, "0")} — {active.role}
          </span>
        </div>
      </Container>

      <div className="mt-10">
        <HorizontalScroller
          trackClassName="items-end px-[var(--container-padding)] gap-6 lg:gap-8"
          onProgress={(progress) => {
            const idx = Math.min(team.length - 1, Math.floor(progress * team.length));
            setActiveIndex(idx);
          }}
        >
          {team.map((member, i) => (
            <article key={member.slug} className="flex w-[68vw] shrink-0 flex-col gap-4 sm:w-[42vw] lg:w-[26vw]">
              <div
                className="relative aspect-[3/4] w-full overflow-hidden rounded-[var(--radius-sm)]"
                style={{ background: "linear-gradient(160deg, var(--stz-navy-700), var(--stz-blue-600))" }}
              >
                {member.image ? (
                  <Image src={member.image} alt={member.name} fill className="object-cover" sizes="(min-width: 1024px) 26vw, 60vw" />
                ) : (
                  <span
                    className="absolute inset-0 flex items-center justify-center font-[var(--font-display)]"
                    style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", color: "rgba(247,249,252,0.78)" }}
                    aria-hidden
                  >
                    {member.initials}
                  </span>
                )}
                <span
                  className="absolute left-4 top-4 font-[var(--font-mono)] tabular-nums"
                  style={{ fontSize: "var(--text-caption)", letterSpacing: "var(--tracking-label)", color: "rgba(247,249,252,0.65)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <h3
                  className="font-[var(--font-display)] tracking-tight"
                  style={{ fontSize: "var(--text-body-lg)", lineHeight: "var(--leading-tight)" }}
                >
                  {member.name}
                </h3>
                <span
                  className="font-[var(--font-mono)] uppercase"
                  style={{ fontSize: "var(--text-caption)", letterSpacing: "var(--tracking-label)", color: "var(--color-brand-soft)" }}
                >
                  {member.role}
                </span>
              </div>
            </article>
          ))}
        </HorizontalScroller>
      </div>

      <div style={{ height: "clamp(5rem, 9vh, 8rem)" }} />
    </section>
  );
}
