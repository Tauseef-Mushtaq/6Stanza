import type { Metadata } from "next";
import { AboutHero } from "@/features/about/sections/AboutHero";
import { WhoWeAre } from "@/features/about/sections/WhoWeAre";
import { Philosophy } from "@/features/about/sections/Philosophy";
import { Process } from "@/features/about/sections/Process";
import { Values } from "@/features/about/sections/Values";
import { Direction } from "@/features/about/sections/Direction";
import { FinalCta } from "@/features/about/sections/FinalCta";

export const metadata: Metadata = {
  title: "About",
  description: "6STANZA is a technology partner for strategy, software, and infrastructure — this is who we are and how we work.",
};

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <WhoWeAre />
      <Philosophy />
      <Process />
      <Values />
      <Direction />
      <FinalCta />
    </>
  );
}
