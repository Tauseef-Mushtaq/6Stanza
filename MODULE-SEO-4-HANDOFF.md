# MODULE-SEO-4-HANDOFF.md

## SEO-4 — Content & Topical Authority

Scope: research, prioritize, and publish the five content-gap topics
SEO-2 identified and deferred, build the topic-cluster architecture
for future content, and give articles a real (not fabricated)
relationship to the relevant service page. No rebuild of SEO-1/2/3.

---

## Research

Read before starting, as required: `MODULE-SEO-1/2/3-HANDOFF.md` and
`docs/seo/keyword-map.md`. The current Insights CMS implementation
(`src/features/insights/`, `src/lib/repositories/insights.ts`,
`src/lib/services/insightContentService.ts`,
`supabase/migrations/0005_cms_content.sql`) was inspected directly
before any content or code was written.

Findings:
- The `Insight` type (`src/features/insights/data/insights.ts`) has
  no `author` or cover-image-required field, and no relationship to a
  service — confirmed in code, matching what SEO-1/2/3 already
  documented. Nothing was invented to fill these gaps.
- `InsightBlock` (paragraph/heading/quote/list/code/callout) has no
  link/anchor shape — body text cannot contain a real hyperlink. This
  matters for spec §16/§17 ("Internal Linking System" /
  "Article → Service Connection") — see "CMS changes" below for how
  this was resolved without inventing a fake in-body link.
- `insightCategories` (`Engineering`, `Cloud`, `DevOps`,
  `Cyber Security`, `Strategy`) had no category that fit a technical
  SEO article — see "CMS changes."
- No search-volume/keyword-difficulty tool is available in this
  environment, same constraint SEO-2 documented. All prioritization
  below is qualitative (commercial relevance, service-page
  relationship, realistic ranking opportunity), and volume/difficulty
  is never invented.
- This sandbox has no network access and no `node_modules` installed,
  so `npm install` / `npm run build` / `npm run dev` (spec §33)
  **could not be executed** in this session. See "Verification" below
  for what was and wasn't possible to check, and what the next
  session/environment should run.

---

## Content strategy

Followed the required pipeline: research → prioritization →
architecture → briefs → writing → internal linking → CMS integration.
No batch-generation of five articles without the earlier steps.

**5 content briefs** (topic, primary keyword, intent, audience,
funnel stage, outline, related service, CTA) were worked through
before any article was drafted, for all five SEO-2 content-gap
topics. Brief summary for each (full outlines are the article
`heading` blocks themselves — the published structure matches the
brief 1:1):

1. **Web development cost in Pakistan** — commercial-investigation +
   informational intent, funnel stage: early research. No fixed price
   published (spec explicitly prohibits this) — the article teaches
   what drives cost instead, and ends with a scoping checklist +
   contextual CTA to `/services/web-development`.
2. **How to choose a DevOps partner** — commercial-investigation
   intent, buyer evaluating providers. Breaks "DevOps" into concrete
   capabilities and gives specific vendor-evaluation questions and one
   warning sign. CTA to `/services/devops`.
3. **What cloud migration involves** — informational intent, earlier
   funnel stage than #2. Covers discovery through post-migration
   optimization, with an explicit risk list. CTA to
   `/services/cloud-computing`.
4. **What application security covers** — informational intent.
   Distinguishes application-layer security from network/perimeter
   security; explicitly warns against "100% secure" claims per spec
   §9/§29. CTA to `/services/cyber-security`.
5. **What is technical SEO** — informational/meta intent, informed by
   6STANZA's own SEO-1/2/3 work. Frames technical SEO as the
   foundation content strategy depends on. CTA to `/services/seo`.

---

## Topic clusters

Full cluster architecture (8 service clusters, P1/P2/P3 backlog for
each) is in `docs/seo/content-roadmap.md`, not duplicated here. Only
the 5 P1 items were written this module — every other cluster item is
backlog, not built.

---

## Articles created

All 5 SEO-2 content-gap topics were judged, on research, to genuinely
merit publication now (none needed deferral to P2/P3 — see reasoning
in each brief summary above). Published via
`supabase/migrations/0008_seo4_content_seed.sql`:

| Slug | Category | Related service |
|---|---|---|
| `web-development-cost-in-pakistan` | Strategy | `web-development` |
| `how-to-choose-a-devops-partner` | DevOps | `devops` |
| `what-cloud-migration-involves` | Cloud | `cloud-computing` |
| `what-application-security-covers` | Cyber Security | `cyber-security` |
| `what-is-technical-seo` | SEO | `seo` |

Each article:
- Uses only the existing `InsightBlock` shapes (heading/paragraph/
  list/callout) — no new block type invented.
- Contains no invented statistics, no fabricated company claims
  ("hundreds of clients," "#1 in Pakistan," etc. — spec §29), no fake
  testimonials or case studies.
- Ends with a "6STANZA's approach" callout that's a description of
  approach, not a hard sales pitch ("explore how 6STANZA approaches
  X," per spec §17 — never "buy our service now").
- Was checked against the SEO-4 quality-review checklist (spec §28):
  accuracy, intent match, originality beyond a generic AI summary,
  business-alignment, internal links, CTA, and title/H1/canonical/
  schema agreement (the last four are inherited automatically from
  the existing `generateMetadata`/`articleSchema` — see "Metadata
  compatibility" below, nothing article-specific to configure).

## Articles intentionally deferred

None of the five were deferred — research supported publishing all
five as genuinely useful, differentiated content rather than thin
definitions. The deferral decision that *was* made: none of SEO-2's
five gap topics were expanded into a second article this module (e.g.
no separate "how to choose a web development company" alongside the
cost article) — those are logged as P2 in the roadmap, not built now,
per the module's explicit instruction not to over-produce (spec §27).

---

## Internal linking

- **Article → Service**: new, real. See "CMS changes" — a
  `related_service_slug` column + `RelatedServiceCTA` component render
  an actual `<Link href="/services/{slug}">`, not a text mention. Only
  renders when the slug resolves to a real, published service (spec
  §18 — never a fake/broken link).
- **Article → Article**: the existing "Next Insight" footer
  (`ArticleFooter`) already provides sequential article-to-article
  navigation across all published insights, including the five new
  ones, with no changes needed.
- **Article → Project**: none of the five P1 articles were linked to a
  specific project case study. Checked the current CMS project data
  during research; none had a documented, genuine connection to these
  five specific topics (e.g. a public case study specifically about a
  cloud migration). Per spec §18, no fake connection was created.
  Revisit per-article once a matching project exists.
- **Service → Insight**: not built this module — the service detail
  page template (`ServiceDetail`) has no "related insights" section to
  wire into, and adding one is a frontend/template change beyond this
  module's CMS-content scope. Logged as a SEO-5+ candidate below.

---

## CMS changes

All changes are additive — no existing field, table, or component
behavior was removed or redefined (spec §19 "do not break the
existing schema").

- **`supabase/migrations/0007_insights_related_service.sql`** — new
  nullable `related_service_slug text references public.services
  (slug) on delete set null` column on `insights`. Needed because the
  existing `InsightBlock` union has no link shape, so a real
  article→service relationship had no home without this.
- **`supabase/migrations/0008_seo4_content_seed.sql`** — inserts the
  five published articles directly. This *is* the CMS-integration
  step for this module: there is no live database/admin session in
  this sandbox to publish through the actual admin UI, so a seed
  migration is the closest equivalent to "creating the rows via the
  existing Insights CMS" available here. A real deployment should
  apply this migration like any other; a team with a running admin
  UI could equally recreate these five rows through
  `/admin/insights` using the same field values.
- **`src/lib/supabase/database.types.ts`** — `insights` Row/Insert/
  Update types gained `related_service_slug`.
- **`src/lib/validation/cmsContent.ts`** — `insightSchema` gained
  optional `relatedServiceSlug`.
- **`src/lib/repositories/insights.ts`** — `toRow()` now persists
  `related_service_slug`.
- **`src/features/insights/data/insights.ts`** — `Insight` type
  gained `relatedServiceSlug: string | null`; `insightCategories`
  gained `"SEO"` (previously no category fit a technical-SEO
  article — this is a suggestion list only, not an enforced enum, so
  adding one value doesn't touch validation).
- **`src/features/insights/data/publicInsights.ts`** — `toInsight()`
  maps the new column through to the frontend type.
- **`src/features/insights/sections/RelatedServiceCTA.tsx`** — new
  component; renders nothing if `relatedServiceSlug` is null or
  doesn't resolve to a published service.
- **`src/app/(site)/insights/[slug]/page.tsx`** — renders
  `<RelatedServiceCTA>` between article content and the existing
  "Next Insight" footer.
- **`src/features/admin/components/InsightForm.tsx`** — added a plain
  text "Related service (optional)" field (slug input, matching the
  existing category field's pattern) so this is editable through the
  admin UI going forward, not only via migration.

No existing public route, component prop, or CMS field was renamed or
removed.

---

## Metadata compatibility

No new metadata system was created (spec §20). The five new articles
flow through the existing `generateMetadata()` in
`src/app/(site)/insights/[slug]/page.tsx` (title, description,
canonical, Open Graph, Twitter card) automatically, using each
article's real `title`/`excerpt`/`date` — same as every other
Insight.

## Schema compatibility

No new structured-data implementation was created (spec §21). The
five articles use the existing `articleSchema()` from SEO-3
(`src/lib/seo/structuredData.ts`) automatically, same as every other
Insight — `datePublished` from the real `published_at` set at
insert time, `image` falling back to the existing `defaultOgImage`
(none of the five articles has a cover image — not fabricated, same
gap SEO-1/2 already documented for Insight cover images generally).

---

## Verification

**Could not run in this session** — spec §33's
`npm install && npm run lint && npx tsc --noEmit && npm run build &&
npm run dev` requires network access to fetch packages, which this
sandbox does not have (`node_modules` is not present and network
egress is disabled). This is an environment limitation, not a skipped
step.

What *was* checked without a running toolchain:
- Every edited/created TypeScript/TSX file was read back in full and
  manually reviewed for syntax correctness (balanced braces/JSX,
  matching import paths against files that actually exist on disk —
  `Container`, `TechnicalLabel`, `Reveal` from `@/components/...` were
  all confirmed present at their import paths).
- The generated seed SQL was validated as syntactically well-formed
  JSON (`json.dumps`) before being embedded, and single-quote
  escaping was applied programmatically rather than by hand, to avoid
  the most common source of hand-written SQL string errors.
- Cross-referenced every new field name across all six touched layers
  (migration column → `database.types.ts` → `cmsContent.ts` schema →
  repository `toRow()` → `Insight` type → `publicInsights.ts` mapper)
  to confirm the name `related_service_slug` / `relatedServiceSlug` is
  consistent everywhere it appears.

**Must be run before this ships**, in an environment with network
access:
```bash
npm install
npm run lint
npx tsc --noEmit
npm run build
npm run dev
```
Then verify `/insights` and `/insights/<slug>` for all five new slugs
listed above: title, description, canonical, H1, Article schema,
the new Related Service link, Next Insight link, noindex status (none
of these should be noindexed), and sitemap inclusion (the existing
dynamic sitemap should pick these up automatically — same mechanism
as every other published Insight, nothing new to configure there).

---

## Known limitations

- Verification (above) is unrun, not just unconfirmed — treat this as
  code + content ready for review and testing, not as verified-in-
  production.
- No article→project links were created (see "Internal linking") —
  none of the current project case studies had a genuine, specific
  connection to these five topics.
- No service→insight backlink section exists yet on service detail
  pages — logged as a SEO-5+ candidate, not built here (template
  change, out of this module's CMS-content scope).
- The admin "Related service" field is a plain slug text input, not a
  dropdown of real service slugs — functionally correct (validated
  against the `slugSchema` format, and a slug that doesn't resolve to
  a real service simply renders no CTA rather than erroring), but a
  `<select>` populated from live services would be a better editing
  experience. Small follow-up, not done here to keep this module's
  admin-UI footprint minimal.
- None of the five articles has a cover image (no fabricated
  `media_path`) — same documented gap as every other Insight.

## Next SEO module

Recommended: **SEO-5 — Search Console setup & measurement**, per the
module spec's own framing (§32) — this module intentionally kept
URLs stable and content architecture clean specifically so SEO-5 can
measure impressions/clicks/CTR/queries/landing pages without a URL
migration first. A smaller, optional companion item: a
"related insights" section on service detail pages (the reverse of
this module's article→service link), which would close the loop
started here.
