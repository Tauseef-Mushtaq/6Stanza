import type { Metadata } from "next";
import { TeamHero } from "@/features/team/sections/TeamHero";
import { TeamIntro } from "@/features/team/sections/TeamIntro";
import { TeamSequence } from "@/features/team/sections/TeamSequence";
import { TeamFocus } from "@/features/team/sections/TeamFocus";
import { HowWeWork } from "@/features/team/sections/HowWeWork";
import { TeamCulture } from "@/features/team/sections/TeamCulture";
import { TeamFinalTransition } from "@/features/team/sections/TeamFinalTransition";

export const metadata: Metadata = {
  title: "Team",
  description: "The multidisciplinary team behind 6STANZA's systems — engineering, design, infrastructure, and strategy.",
};

export default function TeamPage() {
  return (
    <>
      <TeamHero />
      <TeamIntro />
      <TeamSequence />
      <TeamFocus />
      <HowWeWork />
      <TeamCulture />
      <TeamFinalTransition />
    </>
  );
}
