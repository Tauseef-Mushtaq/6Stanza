import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { insights } from "@/features/insights/data/insights";
import { ArticleHero } from "@/features/insights/sections/ArticleHero";
import { ArticleIntro } from "@/features/insights/sections/ArticleIntro";
import { ArticleContent } from "@/features/insights/sections/ArticleContent";
import { ArticleFooter } from "@/features/insights/sections/ArticleFooter";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return insights.map((insight) => ({ slug: insight.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const insight = insights.find((item) => item.slug === slug);
  if (!insight) return {};
  return {
    title: insight.title,
    description: insight.excerpt,
  };
}

/**
 * Reusable article detail template (§23) — one dynamic route for every
 * insight rather than a page file per article. 404s via `notFound()`
 * for any slug not present in the canonical `insights` list.
 */
export default async function InsightDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const index = insights.findIndex((item) => item.slug === slug);
  if (index === -1) notFound();

  const insight = insights[index];
  const next = insights[(index + 1) % insights.length];

  return (
    <>
      <ArticleHero insight={insight} />
      <ArticleIntro excerpt={insight.excerpt} />
      <ArticleContent content={insight.content} />
      <ArticleFooter next={next} />
    </>
  );
}
