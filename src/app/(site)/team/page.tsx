import type { Metadata } from "next";
import { TeamHero } from "@/features/team/sections/TeamHero";
import { TeamIntro } from "@/features/team/sections/TeamIntro";
import { TeamSequence } from "@/features/team/sections/TeamSequence";
import { TeamFocus } from "@/features/team/sections/TeamFocus";
import { HowWeWork } from "@/features/team/sections/HowWeWork";
import { TeamCulture } from "@/features/team/sections/TeamCulture";
import { TeamFinalTransition } from "@/features/team/sections/TeamFinalTransition";
import { getPublicTeam } from "@/features/team/data/publicTeam";

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
  const team = await getPublicTeam();

  return (
    <>
      <TeamHero team={team} />
      <TeamIntro />
      <TeamSequence team={team} />
      <TeamFocus team={team} />
      <HowWeWork />
      <TeamCulture />
      <TeamFinalTransition />
    </>
  );
}
