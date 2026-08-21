import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicInsightBySlug, getNextPublicInsight } from "@/features/insights/data/publicInsights";
import { ArticleHero } from "@/features/insights/sections/ArticleHero";
import { ArticleIntro } from "@/features/insights/sections/ArticleIntro";
import { ArticleContent } from "@/features/insights/sections/ArticleContent";
import { ArticleFooter } from "@/features/insights/sections/ArticleFooter";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Module 9I — static enumeration removed (spec §26): with CMS content,
 * a build-time slug list would go stale, and this sandbox has no build-time
 * Supabase access anyway. `dynamicParams` defaults to `true`, so any
 * slug — including one published after the last deploy — resolves at
 * request time via `getPublicInsightBySlug`.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const insight = await getPublicInsightBySlug(slug);
  if (!insight) return {};
  return {
    title: insight.title,
    description: insight.excerpt,
  };
}

/**
 * Reusable article detail template (§23) — one dynamic route for every
 * insight rather than a page file per article. 404s via `notFound()`
 * for any slug with no published match — draft, archived, and unknown
 * slugs are indistinguishable at this boundary (spec §10), since
 * `getPublicInsightBySlug` only ever resolves published rows.
 *
 * `getPublicInsightBySlug`/`getNextPublicInsight` are both backed by
 * `react.cache()`-memoized reads (`publicInsights.ts`), so this page
 * and `generateMetadata` above share the same underlying Supabase
 * query within one request rather than issuing it twice.
 */
export default async function InsightDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const insight = await getPublicInsightBySlug(slug);
  if (!insight) notFound();

  // Wraps around to itself when there's exactly one published insight,
  // matching the old static array's `(index + 1) % insights.length`
  // behavior. Falls back to `insight` itself in the (unexpected) case
  // where the separately-memoized rows read doesn't contain this slug,
  // rather than 404ing an article that was just successfully resolved.
  const next = (await getNextPublicInsight(slug)) ?? insight;

  return (
    <>
      <ArticleHero insight={insight} />
      <ArticleIntro excerpt={insight.excerpt} />
      <ArticleContent content={insight.content} />
      <ArticleFooter next={next} />
    </>
  );
}
