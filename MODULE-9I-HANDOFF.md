# MODULE 9I — PUBLIC INSIGHTS MIGRATION — HANDOFF

## A. What was inspected

- `supabase/migrations/0005_cms_content.sql` — the `insights` table, its RLS policies (`insights_select_published` for `anon, authenticated` restricted to `status = 'published'`, plus the separate admin-all policy), and confirmed there is no `sort_order` column — the table comment explains ordering is by `published_at` instead.
- `src/lib/validation/cmsContent.ts` — `insightSchema` and, notably, `insightBlockSchema`: an existing Zod discriminated union already matching the frontend `InsightBlock` type field-for-field (`paragraph`/`heading`/`quote`/`list`/`code`/`callout`), and `mediaPathSchema`.
- `src/lib/repositories/insights.ts` — confirmed `listPublishedInsights()` (ordered `published_at DESC`) and `getPublishedInsightBySlug()` already exist as the public read layer's data-access functions, matching the Services/Projects/Team precedent.
- `src/lib/services/insightContentService.ts` — confirmed `getPublishedInsights()`/`getPublishedInsight(slug)` already exist as the public service-layer read (Module 9A foundation).
- `src/lib/supabase/database.types.ts` — the `insights` `Row` type; confirmed `content` is typed as `Json` (not a specific shape) — the CMS enforces nothing about block structure at the column level, so the public boundary must validate it.
- Public Insights implementation: `src/features/insights/data/insights.ts` (`Insight`/`InsightBlock`/`insightCategories`/formerly `insights`/`getInsight`), and every section under `src/features/insights/sections/*` (`InsightsHero`, `FeaturedInsight`, `InsightsList`, `ArticleHero`, `ArticleIntro`, `ArticleContent`, `ArticleFooter`).
- Both routes: `src/app/(site)/insights/page.tsx` (list) and `src/app/(site)/insights/[slug]/page.tsx` (detail, including its `generateStaticParams()` and `generateMetadata()`).
- `src/app/(site)/page.tsx` and `src/features/home/*` — confirmed there is no Home Insight consumer (no `FeaturedInsight`/`InsightsPreview`/`LatestInsights`-style section exists on Home; the Home page renders `Hero`/`Positioning`/`Services`/`SixSJourney`/`Work`/`TeamJourney`/`FinalCta` only).
- Every consumer of the static file, via `rg "from \"@/features/insights/data/insights\"" src` and `rg "insightCategories" src` — confirming `ArticleFooter.tsx`, `FeaturedInsight.tsx`, `InsightsList.tsx`, `ArticleContent.tsx`, `ArticleHero.tsx` import only the `Insight`/`InsightBlock` types (type-only), and that `src/features/admin/lib/services.ts`'s `insightCategoryOptions` is the one genuine runtime dependency on this file (`insightCategories`), used by the admin Insights form.
- The admin Insights CMS (`InsightContentEditor`, `/admin/insights*` pages) — confirmed none of it imports the public runtime `insights` array or reads through the public adapter built here.
- Reused the exact adapter/caching/empty-state pattern established in Modules 9F–9H (`MODULE-9F-HANDOFF.md`, `MODULE-9G-HANDOFF.md`, `MODULE-9H-HANDOFF.md`), per this module's explicit instruction to follow that precedent.

## B. Routes migrated

- `/insights` (`InsightsHero` + `FeaturedInsight` + `InsightsList`).
- `/insights/[slug]` (`ArticleHero` + `ArticleIntro` + `ArticleContent` + `ArticleFooter`).
- No Home Insight section exists, so none was migrated (§A).

## C. Data-source migration

Both routes flow through one new boundary file, `src/features/insights/data/publicInsights.ts`:

**List** (`/insights`):
```
CMS `insights` rows (published only, RLS-enforced, published_at DESC)
        ↓
getPublishedInsights()   (Module 9A, insightContentService.ts, unchanged)
        ↓
getPublicInsightRows()  — new: request-memoized (react cache()) boundary
        ↓
toInsight() / normalizeInsightBlocks()  — new: pure adapter
        ↓
existing `Insight`/`InsightBlock` types
        ↓
existing, unmodified `InsightsHero`/`FeaturedInsight`/`InsightsList`
```

**Detail** (`/insights/[slug]`):
```
CMS `insights` row by slug (published only, RLS-enforced)
        ↓
getPublishedInsight(slug)   (Module 9A, unchanged)
        ↓
getPublicInsightBySlug()  — new: request-memoized (react cache()) boundary
        ↓
toInsight() / normalizeInsightBlocks()  — new: pure adapter
        ↓
existing `Insight`/`InsightBlock` types
        ↓
existing, unmodified `ArticleHero`/`ArticleIntro`/`ArticleContent`/`ArticleFooter`
```

`generateMetadata()` and the page body both call `getPublicInsightBySlug()`, which is itself `react.cache()`-memoized, so they share one Supabase query per request rather than issuing it twice (spec §11/§27). The detail page's "next insight" link uses a new `getNextPublicInsight()`, built on the same memoized `getPublicInsightRows()` used by the list page.

## D. Field mapping

| CMS `insights` column | Frontend field | Notes |
|---|---|---|
| `slug` | `Insight.slug` | direct |
| `title` | `Insight.title` | direct |
| `category` | `Insight.category` | direct |
| `excerpt` | `Insight.excerpt` | direct |
| `content` | `Insight.content` | `Json` → `InsightBlock[]`, normalized — see §F |
| `reading_time` | `Insight.readingTime` | direct — see §H |
| `published_at` | `Insight.date` | `?? row.created_at` as a defensive-only fallback — see §H |

No fields were invented (no `author`, `tags`, SEO fields, cover-image fields, or publication type were added). `media_path` exists on the CMS row but has no public UI consumer — see §G.

## E. Ordering

There is no `sort_order` on `insights` (confirmed against the migration — spec §7/§9). `listPublishedInsights()` orders by `published_at DESC` at the repository level (unchanged, pre-existing). The public adapter does no re-sorting — `getPublicInsights()` is a plain `.map()` over the already-ordered rows, preserving the same "newest first" ordering the static array's `date` field produced before.

## F. Content blocks

`content` is typed as `Json` at the column level (`database.types.ts`) — Postgres `jsonb` doesn't enforce the `InsightBlock` union, so the public boundary validates defensively rather than trusting the shape (spec §12/§13).

`normalizeInsightBlocks()` in `publicInsights.ts` reuses the existing `insightBlockSchema` (`lib/validation/cmsContent.ts`) — the same schema the admin write path already validates against — rather than building a second, parallel validation scheme (spec §14: it's a small, server-only Zod schema already in this codebase, not a new client-heavy dependency). Behavior:

- non-array `content` → `[]`
- each array entry is parsed independently via `insightBlockSchema.safeParse(entry)`
- a parse failure (invalid shape, unknown `type`, or a known type missing a required field — e.g. a `list` block with an empty/oversized `items` array, a `quote` with no `text`) → that single entry is dropped
- successfully-parsed entries keep their exact validated shape (field names, optional `attribution`, etc.) — nothing is renamed or coerced beyond what the schema itself does (e.g. `.trim()`)

A malformed block only ever shrinks the rendered article — it never throws or crashes the page. `ArticleContent.tsx` still receives a plain `InsightBlock[]` and has no idea the data passed through `jsonb`; no JSON parsing was added to that component (spec §6). All six block types (`paragraph`, `heading`, `quote`, `list`, `code`, `callout`) pass through unchanged when valid.

## G. Media

Inspected every Insights component: `InsightsHero`, `FeaturedInsight` (uses a deterministic SVG "diagram" placeholder, not a real image), `InsightsList`, `ArticleHero`, `ArticleIntro`, `ArticleContent`, `ArticleFooter` — none of them currently render a `media_path`/cover-image field. This matches Module 9F/9G's finding for Services/Projects `media_path` (unlike Team, where `image_path` **is** rendered). `media_path` exists on the CMS row but has no current public consumer, so it remains unused — no image UI was added, no article hero redesign, and `getPublicMediaUrl()` (Module 9H, `src/lib/cms/media.ts`) was not called from this adapter, since there's nothing to map it to yet.

## H. Date / reading time

- **Date**: `published_at` is the primary and only real source, mapped to `Insight.date` as-is (an ISO timestamp string, same as the old static `date` field — every consumer's own `formatDate()` helper in `FeaturedInsight.tsx`/`InsightsList.tsx`/`ArticleHero.tsx` already does `new Date(iso).toLocaleDateString(...)`, unchanged). `listPublishedInsights()`/`getPublishedInsightBySlug()` only ever return `status = 'published'` rows, and `insertInsight()`/`updateInsight()` stamp `published_at` on the first transition to `published` — so a published row should always have a non-null `published_at` in practice. `toInsight()` still does `row.published_at ?? row.created_at` as a purely defensive fallback (spec §16: no new date semantics were invented; this only guards the theoretical edge case of a published row somehow missing the timestamp, so the date field can never be `null` and break the existing `formatDate()` callers).
- **Reading time**: `reading_time` maps directly to `Insight.readingTime`, no recalculation, no algorithm — the CMS value is passed through verbatim, exactly as instructed.

## I. Home integration

No Home Insight consumer exists in this codebase (confirmed in §A) — `src/app/(site)/page.tsx` was not touched.

## J. Caching / freshness

Re-confirmed Module 9F–9H's finding: `src/app/(site)/layout.tsx` calls `getCurrentProfile()` (cookie-based auth, for the header) for every route in the `(site)` route group, forcing all of them — including `/insights`, now — into fully dynamic, per-request rendering. Verified via `next build` output: `/insights` renders `ƒ (Dynamic)`, matching `/about`, `/services`, `/projects`, `/team`. No `revalidate`/`unstable_cache`/`force-static` was added — the requirement ("publish without redeploy") is already satisfied by the existing architecture, same conclusion as prior modules.

`/insights/[slug]`'s `generateStaticParams()` was removed (it previously enumerated the static array at build time — spec §26). It now resolves every slug at request time via `getPublicInsightBySlug()`; `dynamicParams` defaults to `true`. The build output confirms this: `/insights/[slug]` now shows as `ƒ (Dynamic)` (it was `● (SSG)` before this module, when it enumerated the static array).

Within one request, `getPublicInsightRows()` and `getPublicInsightBySlug()` are each wrapped in `react.cache()`, so `/insights` and `/insights/[slug]` (page + metadata) each issue exactly one Supabase query per request no matter how many components/functions read the result.

## K. Static data cleanup

**Removed** (genuinely obsolete runtime data, zero remaining consumers after migration):
- The `insights: Insight[]` placeholder-editorial array and `getInsight(slug)` helper in `src/features/insights/data/insights.ts` — every prior consumer (`InsightsHero`, the two route pages) was migrated to `getPublicInsights()`/`getPublicInsightBySlug()`/`getNextPublicInsight()` in this module, and `rg "from \"@/features/insights/data/insights\"" src` confirmed no runtime consumer remained. Unlike Module 9H's Team migration, there was no orphaned legacy component blocking this removal — this mirrors Module 9G's clean Projects removal.

**Retained** (still live dependencies):
- `Insight` and `InsightBlock` type interfaces — still imported (type-only) by `ArticleFooter.tsx`, `FeaturedInsight.tsx`, `InsightsList.tsx`, `ArticleContent.tsx`, `ArticleHero.tsx`, `publicInsights.ts`, and referenced in comments in `InsightContentEditor.tsx`/`cmsContentTypes.ts`.
- `insightCategories` — **explicitly not removed**, per spec §21/§22/§41. `src/features/admin/lib/services.ts`'s `insightCategoryOptions` is a genuine, verified runtime dependency (admin Insights form category suggestions). No replacement was implemented or needed — this list isn't public-migration-related, it's an admin authoring convenience, and spec explicitly forbids touching it without a verified safe replacement.

The file now carries a comment explaining what was removed, why, and what remains live, so a future reader doesn't mistake the retained exports for dead code.

## L. Security

- Public reads go through `getPublicInsightRows()`/`getPublicInsightBySlug()` → `getPublishedInsights()`/`getPublishedInsight()` → `listPublishedInsights()`/`getPublishedInsightBySlug()`, the same Module 9A public service/repository functions — no new data-access path was created.
- RLS was not modified. `insights_select_published` is the actual enforcement boundary; the service layer's own read is defense-in-depth.
- No `service-role` client and no admin service functions (`listAllInsightsForAdmin`, `createInsight`, etc.) are imported anywhere under `src/features/insights/*`.
- Draft and archived insights are indistinguishable from unknown slugs on `/insights/[slug]` — all three resolve through the same `getPublicInsightBySlug()` → `null` → `notFound()` path, since the underlying row is published-only by construction (RLS + the repository query).
- No Supabase credentials or admin-only code reach client components — every touched component remains a Server Component (none were `"use client"` before or after this module).

## M. Public UI preservation

No component under `src/features/insights/sections/*` or any motion primitive (`Reveal`, `ScaleReveal`, `SplitHeading`, `Parallax`) had its markup, styling, or motion changed. `InsightsHero` now takes a `count` prop instead of reading `insights.length`; `InsightsPage`/`InsightDetailPage` became `async` functions that fetch before returning the same JSX (plus the minimal empty-state branch required by spec §23/§24). `FeaturedInsight`, `InsightsList`, `ArticleHero`, `ArticleIntro`, `ArticleContent`, `ArticleFooter` were not touched at all — they still receive exactly the same prop shapes as before, and `Block()` inside `ArticleContent.tsx` (the six-way block-type switch) is completely unmodified.

## N. Verification

- `npm run lint` (`eslint`) — **passes**, no warnings.
- `npx tsc --noEmit` — **passes** cleanly (no errors at all this run; the `.next/types`-dependent `LayoutProps` issue noted in prior handoffs doesn't reproduce once `.next/types` already exists from an earlier build in this environment).
- `npm run build` — **passes**. `/insights` renders `ƒ (Dynamic)`; `/insights/[slug]` now also renders `ƒ (Dynamic)` (previously `● (SSG)` via `generateStaticParams()`, removed per §J). `/admin/insights`, `/admin/insights/new`, `/admin/insights/[id]` all compiled and are present in the route list, unaffected. The build log shows `getPublishedInsights`/`getPublicInsightRows`-style dynamic-server-usage messages during prerendering (expected — no live Supabase reachable from this sandbox), confirming the error-handling/empty-state path exercises itself correctly rather than crashing the build.
- **Live Supabase test**: not performed — same sandbox limitation as Modules 9F–9H (no network path to `*.supabase.co`; only npm/pip/GitHub-style registries are reachable). No published/draft/archived `insights` rows, `published_at` ordering, or `content` block rendering (all six types, or malformed JSON) were exercised against the real Supabase project.
- **Browser verification**: not performed, for the same reason.
- **Block-type coverage**: verified statically by inspection only — `insightBlockSchema` covers exactly the six types `ArticleContent.tsx`'s `Block()` switch renders (`paragraph`/`heading`/`quote`/`list`/`code`/`callout`), and the schema's field names match the `InsightBlock` union member-for-member. Not exercised against real CMS rows (see above).
- No new pre-existing unrelated lint/typecheck/build failures were found.

## O. Remaining work

- Module 9J — Public CMS Cleanup & QA.
- Live-database and browser verification of this module (§N) against the real Supabase project — same outstanding item carried over from Modules 9F–9H, now covering Services, Projects, Team, and Insights.
- No Insights-specific follow-up beyond that; `insightCategories` remains exactly as found, still serving the admin form, untouched.
