# MODULE 9G — PUBLIC PROJECTS MIGRATION — HANDOFF

## A. What was inspected

- `supabase/migrations/0005_cms_content.sql` — the `projects` table, its RLS policies (`projects_select_published` for `anon, authenticated` restricted to `status = 'published'`, plus the separate `projects_select_admin_all`).
- `src/lib/validation/cmsContent.ts` — `projectSchema`/`projectArchitectureGroupSchema` (admin write validation only).
- `src/lib/repositories/projects.ts` — confirmed `listPublishedProjects()`/`getPublishedProjectBySlug()` already exist and already order by `sort_order`, relying on RLS rather than an app-level `status` filter (same pattern as Services).
- `src/lib/services/projectContentService.ts` — confirmed `getPublishedProjects()`/`getPublishedProject(slug)` already exist as the public read layer (Module 9A foundation).
- `src/lib/supabase/database.types.ts` — the `projects` `Row` type and the shared `ProjectArchitectureGroup` (`{ label, items }`) interface, confirmed to match the migration column-for-column, including that `architecture` is `jsonb`.
- Public Projects implementation: `src/features/home/data/projects.ts` (`ProjectItem`), `src/features/projects/data/projectDetails.ts` (`ProjectDetail`/`ArchitectureGroup`/`getProjectDetail`/`getAdjacentProjects`), every section under `src/features/projects/sections/*`, and `src/features/home/sections/Work.tsx`.
- Every consumer of the static files and types, via `rg "home/data/projects" src`, `rg "projectDetails" src`, `rg "ProjectItem" src`, `rg "ProjectDetail" src`, `rg "ArchitectureGroup" src`, `rg "getAdjacentProjects|getProjectDetail" src` — including confirming the admin `ProjectForm`/`ProjectArchitectureEditor` use their own local `ArchitectureGroupState` type and never import the public static files (so admin has zero dependency on anything touched here).
- Reused the exact adapter/caching/empty-state pattern established in Module 9F (`MODULE-9F-HANDOFF.md`), per this module's explicit instruction to follow that precedent.

## B. Routes migrated

- `/projects` (`ProjectsHero` + `FeaturedProjects`; `ProjectsIntro` was inspected but doesn't consume Project data, so it was left untouched)
- `/projects/[slug]` (all eight chapter sections, via `getPublicProjectDetail`)
- Home Work section (`src/features/home/sections/Work.tsx`) — the only Home section that consumed the static Project data.

## C. Data-source migration

List and detail both flow through the same new boundary file, `src/features/projects/data/publicProjects.ts`:

```
CMS `projects` row (published only, RLS-enforced)
        ↓
getPublishedProjects() / projectContentService.ts   (Module 9A, unchanged)
        ↓
getPublicProjectRows()  — new: request-memoized (react cache()) boundary
        ↓
toProjectItem() / toProjectDetail() / normalizeArchitecture()  — new: pure adapters
        ↓
existing `ProjectItem` / `ProjectDetail` / `ArchitectureGroup` types
        ↓
existing, unmodified Project section components
```

Detail-page adjacency (prev/next) and the display `index`/`total` are derived from the same CMS-ordered row collection inside `getPublicProjectDetail()` — no second query, no separate adjacency data source.

## D. Field mapping

| CMS `projects` column | Frontend field | Notes |
|---|---|---|
| `slug` | `ProjectItem.slug` / `ProjectDetail.slug` | direct |
| `title` | `ProjectItem.title` | direct |
| `category` | `ProjectItem.category` | direct |
| `description` | `ProjectItem.description` | direct |
| `technologies` | `ProjectItem.technologies` | direct (not-null array column) |
| `outcome` | `ProjectItem.outcome` | direct |
| `accent` | `ProjectItem.accent` | direct numeric pass-through — see §F |
| `positioning` | `ProjectDetail.positioning` | `null` → `""` |
| `overview_summary` | `ProjectDetail.overview.summary` | `null` → `""`; nested under `overview` per the existing type (CMS stores it flat, frontend type nests it) |
| `overview_contribution` | `ProjectDetail.overview.contribution` | `null` → `""` |
| `challenge` | `ProjectDetail.challenge` | `null` → `""` |
| `solution` | `ProjectDetail.solution` | `null` → `""` |
| `architecture` | `ProjectDetail.architecture` | `jsonb` → `ArchitectureGroup[]`, normalized — see §F |
| `outcome_statement` | `ProjectDetail.outcomeStatement` | `null` → `""` |
| `sort_order` | collection order + derived `index` | see §E |
| `media_path` | *(not consumed)* | see §H |

No fields were invented; no CMS field is exposed publicly beyond what the existing components already render.

## E. Ordering

`listPublishedProjects()` already orders by `sort_order ascending` at the repository level. The detail page's `index`/`total` (used by `ProjectDetailHero`'s `NumberIndicator` and `ProjectGallery`'s `seed`) are derived as the 1-based position in that already-sorted array — no client-side sort, no hardcoded indexes, matching the Module 9F precedent exactly.

## F. Architecture

`architecture` is a `jsonb` column typed in `database.types.ts` as `ProjectArchitectureGroup[]` (`{ label, items }`), but that type only describes intent — Postgres doesn't enforce it at the column level. `normalizeArchitecture()` in `publicProjects.ts` defensively validates the raw value at the data boundary (spec §13/§14):

- non-array `architecture` → `[]`
- non-object entries → dropped
- a group missing a non-empty string `label` → dropped
- a group whose `items` isn't an array → dropped
- non-string / empty-string entries inside `items` → filtered out
- a group left with zero valid `items` after filtering → dropped entirely

A malformed group only ever shrinks the rendered architecture chapter (`ProjectArchitecture.tsx`, unmodified) — it never throws or crashes the page. `ProjectArchitecture.tsx` still receives a plain `ArchitectureGroup[]` and has no idea the data ever passed through `jsonb`.

## G. Adjacent navigation

`ProjectNextCta` (prev/next case-study links) does exist and is used by `/projects/[slug]`. The old `getAdjacentProjects()` helper (static array `findIndex` + modulo wraparound) has been replaced by the same wraparound logic inside `getPublicProjectDetail()`, computed from the CMS-ordered, published-only row collection — same behavior, same "wraps around at the ends" semantics, now impossible to point at a draft/archived project since the source collection is published-only by construction (RLS).

## H. Media

Inspected every Project visual (`ProjectVisual` in `FeaturedProjects.tsx`, `ProjectDiagram` in `Work.tsx`, `ProjectSolution`'s decorative SVG, `ProjectGallery`'s panels) — all of them are deterministic procedural SVG/gradient placeholders keyed by `accent`/`seed`/index, exactly like Module 9F's Services visuals. None currently renders an image from a path. `media_path` exists on the CMS row but has no current public consumer, so no media URL helper was built (same conclusion and same reasoning as Module 9F §F).

## I. Home integration

Only `src/features/home/sections/Work.tsx` consumed the static Project data on the Home page; it's now an async Server Component calling `getPublicProjects()`. No other Home section was touched. This is now the second Home section (after Services in Module 9F) reading published CMS content — each still issues its own request-memoized query since they're independent server components within the same page render; React's `cache()` inside each adapter file already prevents any duplicate query within that single request.

## J. Caching / freshness

Re-confirmed Module 9F's finding: `src/app/(site)/layout.tsx` calls `getCurrentProfile()` (cookie-based auth, for the header) for every route in the `(site)` route group, which forces all of them — including `/projects` and, previously, `/services` — into fully dynamic, per-request rendering. This was already true before this module. Verified again via `next build` output: `/projects` renders `ƒ (Dynamic)`, identical to `/about`, `/services`, `/insights`, etc. No `revalidate`/`unstable_cache`/`force-static` was added, per this module's explicit instruction not to add caching without a concrete reason — none exists, since the requirement ("publish without redeploy") is already satisfied by the existing architecture.

`/projects/[slug]`'s `generateStaticParams()` returns `[]` (same reasoning as `/services/[slug]` in Module 9F: a build-time CMS query would both go stale and isn't reachable in this sandbox). `dynamicParams` defaults to `true`, so slugs resolve normally per-request.

Within one request, `getPublicProjectRows()` is wrapped in `react.cache()`, so `/projects` (hero + featured list) and `/projects/[slug]` (metadata + page) each issue exactly one Supabase query no matter how many child components read it.

## K. Static data cleanup

**Removed** (genuinely obsolete runtime data, zero remaining consumers after migration):
- The `projects: ProjectItem[]` array in `src/features/home/data/projects.ts` — every prior consumer (`ProjectsHero`, `FeaturedProjects`, `Work`, `/projects/[slug]/page.tsx`, `projectDetails.ts`) was migrated to `getPublicProjects()`/`getPublicProjectDetail()` in this module, and `rg` confirmed no consumer remained.
- The `projectDetails: Record<string, ProjectDetail>` object, `getProjectDetail()`, and `getAdjacentProjects()` in `src/features/projects/data/projectDetails.ts` — their only consumer was the old `/projects/[slug]/page.tsx`, which no longer calls them.

**Retained** (still a live type contract):
- `ProjectItem` interface in `src/features/home/data/projects.ts` — still imported (type-only) by `ProjectDetailHero.tsx`, `ProjectNextCta.tsx`, and the new `publicProjects.ts` adapter.
- `ArchitectureGroup` and `ProjectDetail` interfaces in `src/features/projects/data/projectDetails.ts` — still imported by `ProjectArchitecture.tsx` (type-only) and the new adapter.

Both files now carry a comment explaining the runtime data moved to the CMS and why the types remain, so a future reader doesn't mistake either file for dead code.

Unlike Module 9F's Services migration, there was no out-of-scope consumer (e.g. an equivalent of `start-project`'s service selector) blocking full runtime-data removal here — Projects had no such dependency, so the static runtime data could be fully retired in this module.

## L. Security

- Public reads go through `getPublicProjectRows()` → `getPublishedProjects()` → `listPublishedProjects()`, the same Module 9A public service/repository functions — no new data-access path was created.
- RLS was not modified. `projects_select_published` is the actual enforcement boundary; the service layer's own read is defense-in-depth.
- No `service-role` client and no admin service functions (`listAllProjectsForAdmin`, `createProject`, etc.) are imported anywhere under `src/features/projects/*` or `src/features/home/*`.
- Draft and archived projects are indistinguishable from unknown slugs on `/projects/[slug]` — both resolve through the same `getPublicProjectDetail()` → `null` → `notFound()` path, since the underlying row collection is published-only by construction.
- No Supabase credentials or admin-only code reach client components — every touched component is (and remains) a Server Component.

## M. Public UI preservation

No component under `src/features/projects/sections/*`, `src/features/home/sections/Work.tsx`, or any motion primitive (`HorizontalScroller`, `ScaleReveal`, `Reveal`, `Parallax`, `SplitHeading`) had its markup, styling, or motion changed. `ProjectsHero`, `FeaturedProjects`, and `Work` became `async` functions that fetch before returning the same JSX (plus the minimal empty-state branch required by spec §17/§20). `ProjectDetailHero`, `ProjectOverview`, `ProjectChallenge`, `ProjectSolution`, `ProjectArchitecture`, `ProjectGallery`, `ProjectOutcome`, and `ProjectNextCta` were not touched at all — they still receive exactly the same prop shapes as before.

## N. Verification

- `npm run lint` — **passes**, no warnings.
- `npx tsc --noEmit` — **passes** cleanly (the `LayoutProps` global-type error seen before any build exists is unrelated to this module and clears once `.next/types` is generated by a build, as noted in the Module 9F handoff).
- `npm run build` — **passes**. `/projects` renders `ƒ (Dynamic)`; `/projects/[slug]` shows as SSG-capable with zero prerendered params (by design, see §J) and `dynamicParams: true`. `/admin/projects`, `/admin/projects/new`, `/admin/projects/[id]` all compiled and are present in the route list, unaffected.
- **Live Supabase test**: not performed — same sandbox limitation as Module 9F (no network path to `*.supabase.co`; only npm/pip/GitHub-style registries are reachable). The build log shows `getPublicProjectRows: query failed: ...` during prerendering, confirming the error-handling/empty-state path exercises itself correctly, but this is not a substitute for testing real published/draft/archived rows, `sort_order`, `architecture` JSON, `accent`, and adjacent-navigation behavior against the actual Supabase project.
- **Browser verification**: not performed, for the same reason.
- No pre-existing unrelated lint/typecheck/build failures were found.

## O. Remaining work

- Module 9H — Public Team Migration.
- Live-database and browser verification of this module (§N) against the real Supabase project — same outstanding item carried over from Module 9F, now covering both Services and Projects.
- No Project-specific follow-up beyond that; unlike Services (`start-project`), nothing outside this module's scope still depends on the old static Project data.
