import type { Metadata } from "next";
import { TeamHero } from "@/features/team/sections/TeamHero";
import { TeamIntro } from "@/features/team/sections/TeamIntro";
import { TeamSequence } from "@/features/team/sections/TeamSequence";
import { TeamFocus } from "@/features/team/sections/TeamFocus";
import { HowWeWork } from "@/features/team/sections/HowWeWork";
import { TeamCulture } from "@/features/team/sections/TeamCulture";
import { TeamFinalTransition } from "@/features/team/sections/TeamFinalTransition";
import { getPublicTeam } from "@/features/team/data/publicTeam";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { PublicRetryState } from "@/components/ui/PublicRetryState";

export const metadata: Metadata = {
  title: "Team",
  description: "The multidisciplinary team behind 6STANZA's systems — engineering, design, infrastructure, and strategy.",
};

/**
 * Module 9H — `/team` now sources its members from published CMS
 * content instead of the static `team` array (spec §2). `getPublicTeam()`
 * is `react.cache()`-memoized, so `TeamHero`/`TeamSequence`/`TeamFocus`
 * sharing this one fetch here issues exactly one Supabase query per
 * request. `TeamIntro`/`HowWeWork`/`TeamCulture`/`TeamFinalTransition`
 * don't consume Team data and are left untouched.
 */
export default async function TeamPage() {
  const { ok, data: team } = await getPublicTeam();

  return (
    <>
      <TeamHero team={team} />
      {/* Module 10B (spec §15) — distinguishes a failed Team read
          (controlled error, retry) from a genuinely empty published
          collection (quiet empty message) rather than letting both
          cases silently skip straight to TeamIntro. */}
      {!ok ? (
        <Container className="py-16">
          <PublicRetryState
            title="We couldn't load the team right now"
            description="Please try again."
          />
        </Container>
      ) : team.length === 0 ? (
        <Container className="py-16">
          <EmptyState title="No team members are currently available." />
        </Container>
      ) : null}
      <TeamIntro />
      <TeamSequence team={team} />
      <TeamFocus team={team} />
      <HowWeWork />
      <TeamCulture />
      <TeamFinalTransition />
    </>
  );
}
