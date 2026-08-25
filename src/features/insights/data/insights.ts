/**
 * Module 9I — the placeholder editorial `insights` array and
 * `getInsight()` helper that used to live in this file have been
 * removed: `/insights` and `/insights/[slug]` now source published
 * articles from the CMS via `src/features/insights/data/publicInsights.ts`,
 * and no runtime consumer of the static array remained (verified via
 * `rg "from \"@/features/insights/data/insights\"" src`). The
 * `Insight`/`InsightBlock` types below remain the live frontend
 * contract — used by the public adapter, every presentation
 * component (type-only), and the admin `InsightContentEditor`. See
 * `MODULE-9I-HANDOFF.md` §K.
 */
export type InsightBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "quote"; text: string; attribution?: string }
  | { type: "list"; items: string[] }
  | { type: "code"; language: string; code: string }
  | { type: "callout"; label: string; text: string };

export interface Insight {
  slug: string;
  title: string;
  category: string;
  date: string;
  readingTime: string;
  excerpt: string;
  content: InsightBlock[];
  /** Public Storage URL for the admin-uploaded cover image (`insights.media_path`), built by `getPublicMediaUrl("insights", ...)`. `undefined` when the admin hasn't uploaded one — never fabricated. */
  coverImage?: string;
  /** Optional related-service slug (SEO-4 spec §17) — `null` when the article has no natural service tie-in. Never fabricated. */
  relatedServiceSlug: string | null;
}

/**
 * 6STANZA's technical categories — grounded in the actual service list
 * (`@/features/home/data/services`), not an arbitrary blog taxonomy.
 *
 * Module 9I: still the live source for the admin category suggestions
 * (`src/features/admin/lib/services.ts`'s `insightCategoryOptions`) —
 * retained for that reason even though the public routes no longer
 * read this file's data. See `MODULE-9I-HANDOFF.md` §K.
 */
export const insightCategories = [
  "Engineering",
  "Cloud",
  "DevOps",
  "Cyber Security",
  "Strategy",
  "SEO",
] as const;
