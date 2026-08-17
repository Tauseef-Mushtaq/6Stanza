import { Hero } from "@/features/home/sections/Hero";
import { Positioning } from "@/features/home/sections/Positioning";
import { Services } from "@/features/home/sections/Services";
import { SixSJourney } from "@/features/home/sections/SixSJourney";
import { Work } from "@/features/home/sections/Work";
import { TeamJourney } from "@/features/home/sections/TeamJourney";
import { FinalCta } from "@/features/home/sections/FinalCta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Positioning />
      <Services />
      <SixSJourney />
      <Work />
      <TeamJourney />
      <FinalCta />
    </>
  );
}
