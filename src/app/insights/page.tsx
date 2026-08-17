import type { Metadata } from "next";
import { InsightsHero } from "@/features/insights/sections/InsightsHero";
import { FeaturedInsight } from "@/features/insights/sections/FeaturedInsight";
import { InsightsList } from "@/features/insights/sections/InsightsList";
import { insights } from "@/features/insights/data/insights";

export const metadata: Metadata = {
  title: "Insights",
  description: "Technical thinking from 6STANZA on engineering, cloud, DevOps, and security.",
};

export default function InsightsPage() {
  const [featured, ...rest] = insights;

  return (
    <>
      <InsightsHero />
      <FeaturedInsight insight={featured} />
      <InsightsList insights={rest} />
    </>
  );
}
