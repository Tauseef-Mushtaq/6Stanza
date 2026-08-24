import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicInsightBySlug, getNextPublicInsight } from "@/features/insights/data/publicInsights";
import { throwPublicCmsError } from "@/lib/utils/publicCms";
import { absoluteUrl, defaultOgImage } from "@/lib/seo/canonical";
import { JsonLd } from "@/components/seo/JsonLd";
import { articleSchema, breadcrumbSchema } from "@/lib/seo/structuredData";
import { ArticleHero } from "@/features/insights/sections/ArticleHero";
import { ArticleIntro } from "@/features/insights/sections/ArticleIntro";
import { ArticleContent } from "@/features/insights/sections/ArticleContent";
import { RelatedServiceCTA } from "@/features/insights/sections/RelatedServiceCTA";
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
  const result = await getPublicInsightBySlug(slug);
  // Module 10B (spec §18) — a query failure must not fabricate
  // metadata or claim the article doesn't exist; the page body's own
  // read throws and hits the safe error boundary.
  if (result.status !== "found") return {};
  const insight = result.value;
  const url = absoluteUrl(`/insights/${slug}`);
  // Insight has no cover-image field yet (spec §16 — falls back to
  // the site-level brand image rather than inventing one). `date` is
  // real CMS content, used as the article's published time.
  return {
    title: insight.title,
    description: insight.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: insight.title,
      description: insight.excerpt,
      url,
      publishedTime: insight.date,
      images: [{ url: defaultOgImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: insight.title,
      description: insight.excerpt,
      images: [defaultOgImage],
    },
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
 *
 * Module 10B (spec §18) — a query failure must never be reported as a
 * 404; only "not-found" (no published article at this slug) does.
 */
export default async function InsightDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getPublicInsightBySlug(slug);
  if (result.status === "error") throwPublicCmsError("We couldn't load this article right now. Please try again.");
  if (result.status === "not-found") notFound();

  const insight = result.value;

  // Wraps around to itself when there's exactly one published insight,
  // matching the old static array's `(index + 1) % insights.length`
  // behavior. Falls back to `insight` itself in the (unexpected) case
  // where the separately-memoized rows read doesn't contain this slug,
  // rather than 404ing an article that was just successfully resolved.
  const next = (await getNextPublicInsight(slug)) ?? insight;

  return (
    <>
      <JsonLd
        data={articleSchema({
          slug: insight.slug,
          headline: insight.title,
          description: insight.excerpt,
          datePublished: insight.date,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Insights", path: "/insights" },
          { name: insight.title, path: `/insights/${insight.slug}` },
        ])}
      />
      <ArticleHero insight={insight} />
      <ArticleIntro excerpt={insight.excerpt} />
      <ArticleContent content={insight.content} />
      <RelatedServiceCTA relatedServiceSlug={insight.relatedServiceSlug} />
      <ArticleFooter next={next} />
    </>
  );
}
