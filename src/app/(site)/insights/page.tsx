import type { Metadata } from "next";
import { InsightsHero } from "@/features/insights/sections/InsightsHero";
import { FeaturedInsight } from "@/features/insights/sections/FeaturedInsight";
import { InsightsList } from "@/features/insights/sections/InsightsList";
import { getPublicInsights } from "@/features/insights/data/publicInsights";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { PublicRetryState } from "@/components/ui/PublicRetryState";
import { JsonLd } from "@/components/seo/JsonLd";
import { webPageSchema, breadcrumbSchema } from "@/lib/seo/structuredData";

const description = "Technical thinking from 6STANZA on engineering, cloud, DevOps, and security.";

export const metadata: Metadata = {
  title: "Insights — Engineering & Technology Articles",
  description,
  alternates: {
    canonical: "/insights",
  },
};

/**
 * Module 9I — `/insights` now sources articles from published CMS
 * content instead of the static `insights` array (spec §2). If there
 * are no published insights, the safe empty behavior is showing the
 * hero (count "00") with no featured/list sections rather than
 * crashing on `insights[0]` being `undefined` (spec §23/§24).
 *
 * Module 10B (spec §17) — a failed read now shows a controlled error
 * below the hero instead of silently rendering the same "00" hero a
 * genuinely empty published collection would show.
 */
export default async function InsightsPage() {
  const { ok, data: insights } = await getPublicInsights();
  const [featured, ...rest] = insights;

  return (
    <>
      <JsonLd data={webPageSchema({ path: "/insights", name: "Insights — Engineering & Technology Articles", description })} />
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Insights", path: "/insights" }])} />
      <InsightsHero count={insights.length} />
      {!ok ? (
        <Container className="py-16">
          <PublicRetryState
            title="We couldn't load our insights right now"
            description="Please try again."
          />
        </Container>
      ) : featured ? (
        <>
          <FeaturedInsight insight={featured} />
          <InsightsList insights={rest} />
        </>
      ) : (
        <Container className="py-16">
          <EmptyState title="No insights are currently available." />
        </Container>
      )}
    </>
  );
}
