import "server-only";

import { cache } from "react";
import { getPublishedInsights, getPublishedInsight } from "@/lib/services/insightContentService";
import { insightBlockSchema } from "@/lib/validation/cmsContent";
import type { InsightRow } from "@/lib/repositories/insights";
import type { Insight, InsightBlock } from "@/features/insights/data/insights";

/**
 * Module 9I — public data boundary for Insights (spec §6/§9I).
 *
 * Same shape as `publicServices.ts` (9F) / `publicProjects.ts` (9G) /
 * `publicTeam.ts` (9H): a request-memoized published-rows read plus a
 * small, pure adapter mapping the CMS `insights` row onto the
 * existing, unchanged `Insight`/`InsightBlock` frontend types. Nothing
 * below this file knows a CMS row exists — every consumer keeps
 * importing `Insight`/`InsightBlock` exactly as before.
 */

/**
 * `content` is `Json` at the column level (`database.types.ts`) —
 * Postgres `jsonb` doesn't enforce the `InsightBlock` union, so this
 * boundary validates defensively rather than trusting the shape
 * (spec §12/§13). Reuses the existing `insightBlockSchema` (the same
 * schema the admin write path already validates against —
 * `lib/validation/cmsContent.ts`) rather than duplicating a second
 * validation scheme (spec §14): it's a small, server-only Zod schema
 * already in this codebase, not a new client-heavy dependency.
 *
 * A non-array `content` becomes `[]`. Each entry is parsed
 * independently with `insightBlockSchema.safeParse` — an invalid or
 * unrecognized block is dropped rather than aborting the whole
 * article, so one malformed block only ever shrinks the rendered
 * article, never crashes it.
 */
function normalizeInsightBlocks(raw: unknown): InsightBlock[] {
  if (!Array.isArray(raw)) return [];

  const blocks: InsightBlock[] = [];
  for (const entry of raw) {
    const parsed = insightBlockSchema.safeParse(entry);
    if (parsed.success) blocks.push(parsed.data);
  }
  return blocks;
}

function toInsight(row: InsightRow): Insight {
  return {
    slug: row.slug,
    title: row.title,
    category: row.category,
    // `published_at` is stamped by `insertInsight`/`updateInsight` the
    // first time a row transitions to `published`, and `listPublishedInsights`/
    // `getPublishedInsightBySlug` only ever return published rows — so
    // this should always be non-null in practice. `?? row.created_at`
    // is a defensive fallback only (spec §16 — no invented date
    // semantics), for the theoretical case of a published row that
    // somehow has no `published_at`.
    date: row.published_at ?? row.created_at,
    readingTime: row.reading_time,
    excerpt: row.excerpt,
    content: normalizeInsightBlocks(row.content),
  };
}

/**
 * Request-memoized (`react.cache`) published-insights read. `/insights`
 * (hero + featured + list) and `/insights/[slug]`'s `generateMetadata`
 * both end up calling this within the same request for the list page;
 * memoizing here means only one Supabase query runs per request no
 * matter how many server components read it (spec §11/§27).
 *
 * Returns `[]` on failure rather than throwing, so a transient CMS
 * error degrades to the public empty state instead of a hard crash
 * (spec §23).
 */
export const getPublicInsightRows = cache(async (): Promise<InsightRow[]> => {
  const result = await getPublishedInsights();
  if (!result.ok) {
    console.error("getPublicInsightRows: query failed:", result.message);
    return [];
  }
  return result.data;
});

/** Published insights, CMS-ordered (`published_at DESC`, applied by the repository query) and mapped onto the existing `Insight` type. */
export async function getPublicInsights(): Promise<Insight[]> {
  const rows = await getPublicInsightRows();
  return rows.map(toInsight);
}

/**
 * Request-memoized published-insight-by-slug read, used by
 * `/insights/[slug]` (spec §11 — prefer the by-slug query over
 * fetching the whole list for a single article). A slug with no
 * published match (draft, archived, or unknown — indistinguishable
 * from the public boundary's perspective, spec §10) returns `null`;
 * the caller is responsible for `notFound()`.
 */
export const getPublicInsightBySlug = cache(async (slug: string): Promise<Insight | null> => {
  const result = await getPublishedInsight(slug);
  if (!result.ok) {
    console.error("getPublicInsightBySlug: query failed:", result.message);
    return null;
  }
  return result.data ? toInsight(result.data) : null;
});

/**
 * "Next insight" for `ArticleFooter` (spec §10/§B): wraps around at
 * the end of the CMS-ordered, published-only collection — same
 * wraparound semantics the old static-array `(index + 1) % insights.length`
 * had, now computed from `getPublicInsightRows()` so it can never
 * point at a draft/archived article.
 */
export async function getNextPublicInsight(slug: string): Promise<Insight | null> {
  const rows = await getPublicInsightRows();
  if (rows.length === 0) return null;
  const index = rows.findIndex((row) => row.slug === slug);
  if (index === -1) return null;
  return toInsight(rows[(index + 1) % rows.length]);
}
