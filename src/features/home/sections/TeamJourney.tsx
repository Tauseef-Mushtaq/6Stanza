"use client";

import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { HorizontalScroller } from "@/components/motion";
import { PublicRetryState } from "@/components/ui/PublicRetryState";
import type { TeamMember } from "@/features/home/data/team";

/**
 * CHAPTER 06 — Team. Vertical page scroll drives horizontal movement
 * through compact member cards (2.5–3 visible at once on desktop) using
 * the existing `HorizontalScroller` (Lenis + GSAP ScrollTrigger) — a
 * cinematic gallery, not a stack of oversized panels.
 *
 * Module 9H — `team` is now passed in from the Home page's CMS fetch
 * instead of imported from the static data file. Renders nothing when
 * there are no published members (spec §17), matching the established
 * Home empty-state approach used for Services/Work.
 *
 * Module 10B (spec §6/§8) — `teamOk` distinguishes "the read failed"
 * from "zero published members": a failure shows a controlled error
 * in this chapter only, rather than silently disappearing like the
 * empty case does.
 */
export function TeamJourney({ team, teamOk = true }: { team: TeamMember[]; teamOk?: boolean }) {
  if (!teamOk) {
    return (
      <section className="relative w-full" style={{ background: "var(--stz-navy-950)", color: "var(--stz-white)" }}>
        <Container style={{ paddingBlock: "var(--space-section)" }}>
          <div className="flex items-center gap-3">
            <AccentLine />
            <TechnicalLabel style={{ color: "var(--color-brand-soft)" }}>06 — Team</TechnicalLabel>
          </div>
          <div className="mt-8">
            <PublicRetryState
              title="We couldn't load the team right now"
              description="Please try again."
              className="border-[var(--color-border-inverse)]"
            />
          </div>
        </Container>
      </section>
    );
  }

  if (team.length === 0) return null;

  return (
    <section className="relative w-full" style={{ background: "var(--stz-navy-950)", color: "var(--stz-white)" }}>
      <Container style={{ paddingTop: "var(--space-section)" }}>
        <div className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel style={{ color: "var(--color-brand-soft)" }}>06 — Team</TechnicalLabel>
        </div>
        <h2
          className="mt-4 max-w-2xl font-[var(--font-display)] tracking-tight"
          style={{ fontSize: "clamp(1.75rem, 3.2vw, 2.75rem)", lineHeight: "var(--leading-tight)" }}
        >
          The people behind the systems
        </h2>
      </Container>

      <div className="mt-8">
        <HorizontalScroller trackClassName="items-stretch px-[var(--container-padding)] gap-6 lg:gap-8">
          {team.map((member, i) => (
            <article
              key={member.slug}
              className="flex w-[62vw] shrink-0 flex-col gap-3 sm:w-[42vw] lg:w-[29vw]"
            >
              <div
                className="relative aspect-[5/4] w-full overflow-hidden rounded-[var(--radius-sm)]"
                style={{ background: "linear-gradient(160deg, var(--stz-navy-700), var(--stz-blue-600))" }}
              >
                {member.image ? (
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 29vw, (min-width: 640px) 42vw, 62vw"
                  />
                ) : (
                  <span
                    className="absolute inset-0 flex items-center justify-center font-[var(--font-display)]"
                    style={{ fontSize: "clamp(1.75rem, 3.4vw, 2.75rem)", color: "rgba(247,249,252,0.8)" }}
                    aria-hidden
                  >
                    {member.initials}
                  </span>
                )}
                <span
                  className="absolute left-3 top-3 font-[var(--font-display)] tabular-nums"
                  style={{ fontSize: "var(--text-caption)", color: "rgba(247,249,252,0.6)" }}
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

              <p
                className="line-clamp-2"
                style={{ color: "var(--color-muted-inverse)", fontSize: "var(--text-caption)" }}
              >
                {member.shortBio}
              </p>
            </article>
          ))}
        </HorizontalScroller>
      </div>

      {/* Shared exit breathing room (Module 4G's --safe-bottom) — the
          horizontal experience shouldn't hand off directly into the
          next section. */}
      <div style={{ height: "var(--safe-bottom)" }} />
    </section>
  );
}
