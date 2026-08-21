import type { Metadata } from "next";
import { InsightsHero } from "@/features/insights/sections/InsightsHero";
import { FeaturedInsight } from "@/features/insights/sections/FeaturedInsight";
import { InsightsList } from "@/features/insights/sections/InsightsList";
import { getPublicInsights } from "@/features/insights/data/publicInsights";

export const metadata: Metadata = {
  title: "Insights",
  description: "Technical thinking from 6STANZA on engineering, cloud, DevOps, and security.",
};

/**
 * Module 9I — `/insights` now sources articles from published CMS
 * content instead of the static `insights` array (spec §2). If there
 * are no published insights, the safe empty behavior is showing the
 * hero (count "00") with no featured/list sections rather than
 * crashing on `insights[0]` being `undefined` (spec §23/§24).
 */
export default async function InsightsPage() {
  const insights = await getPublicInsights();
  const [featured, ...rest] = insights;

  return (
    <>
      <InsightsHero count={insights.length} />
      {featured ? (
        <>
          <FeaturedInsight insight={featured} />
          <InsightsList insights={rest} />
        </>
      ) : null}
    </>
  );
}
