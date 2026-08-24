import type { Metadata } from "next";
import { Hero } from "@/features/home/sections/Hero";
import { Positioning } from "@/features/home/sections/Positioning";
import { Services } from "@/features/home/sections/Services";
import { SixSJourney } from "@/features/home/sections/SixSJourney";
import { Work } from "@/features/home/sections/Work";
import { TeamJourney } from "@/features/home/sections/TeamJourney";
import { FinalCta } from "@/features/home/sections/FinalCta";
import { getPublicTeam } from "@/features/team/data/publicTeam";
import { siteConfig } from "@/config/site";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteGraph, webPageSchema } from "@/lib/seo/structuredData";

/**
 * SEO-1 — explicit homepage metadata. Previously absent, so `/`
 * silently inherited only the root layout's bare defaults. This
 * overrides the title (skipping the `%s — 6STANZA` template so the
 * homepage isn't titled "6STANZA — 6STANZA") and sets an explicit
 * canonical, avoiding a weak/duplicate "Home" title per SEO-1 §5.
 */
export const metadata: Metadata = {
  title: { absolute: "6STANZA — Technology Partner for Strategy, Software & Systems" },
  description: siteConfig.tagline,
  alternates: {
    canonical: "/",
  },
};

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
      {/*
        SEO-3 — the homepage is the single place the full Organization
        + WebSite graph is defined (module spec §6, §18: one canonical
        site-wide identity, not a copy per page). Every other page's
        Service/Article/CreativeWork/publisher reference points back
        to this Organization by @id rather than redefining it.
      */}
      <JsonLd data={siteGraph()} />
      <JsonLd
        data={webPageSchema({
          path: "/",
          name: "6STANZA — Technology Partner for Strategy, Software & Systems",
          description: siteConfig.tagline,
        })}
      />
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
