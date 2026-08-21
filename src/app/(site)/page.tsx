import { Hero } from "@/features/home/sections/Hero";
import { Positioning } from "@/features/home/sections/Positioning";
import { Services } from "@/features/home/sections/Services";
import { SixSJourney } from "@/features/home/sections/SixSJourney";
import { Work } from "@/features/home/sections/Work";
import { TeamJourney } from "@/features/home/sections/TeamJourney";
import { FinalCta } from "@/features/home/sections/FinalCta";
import { getPublicTeam } from "@/features/team/data/publicTeam";

/**
 * Module 9H — `TeamJourney` is a Client Component (its `HorizontalScroller`
 * needs client-side scroll state), so it can't call `getPublicTeam()`
 * itself. The Home page fetches here and passes the result down as a
 * prop, matching how `Services`/`Work` (Modules 9F/9G) already fetch
 * their own CMS content as Server Components.
 */
export default async function HomePage() {
  const team = await getPublicTeam();

  return (
    <>
      <Hero />
      <Positioning />
      <Services />
      <SixSJourney />
      <Work />
      <TeamJourney team={team.data} teamOk={team.ok} />
      <FinalCta />
    </>
  );
}
