# MODULE 9F — PUBLIC SERVICES MIGRATION — HANDOFF

## A. What was inspected

Before any change:

- `supabase/migrations/0005_cms_content.sql` — the `services` table, its RLS policies (`services_select_published` for `anon, authenticated` restricted to `status = 'published'`, plus the separate `services_select_admin_all`), and its comments explaining the schema was built directly from the two static frontend files.
- `src/lib/validation/cmsContent.ts` — `serviceSchema` (admin write validation only).
- `src/lib/repositories/services.ts` — confirmed `listPublishedServices()`/`getPublishedServiceBySlug()` already exist, already order by `sort_order`, and rely on RLS rather than an app-level `status` filter.
- `src/lib/services/serviceContentService.ts` — confirmed `getPublishedServices()`/`getPublishedService(slug)` already exist as the public read layer (Module 9A foundation), with the discriminated `PublicListResult`/`PublicGetResult` shapes from `cmsContentTypes.ts`.
- `src/lib/supabase/database.types.ts` — the hand-written `services` `Row` type, confirmed to match the migration column-for-column.
- Public Services implementation: `src/features/home/data/services.ts` (`ServiceItem`), `src/features/services/data/serviceDetails.ts` (`ServiceDetail`), every section under `src/features/services/sections/*`, `src/features/home/components/ServiceVisual.tsx`, `src/features/experience/services/ServiceRail.tsx`.
- Every consumer of the two static files, via `rg "home/data/services" src` / `rg "serviceDetails" src` (see §J).

## B. Routes migrated

- `/services` (`ServicesHero` + `ServiceProgression`)
- `/services/[slug]` (all six chapter sections, via `getPublicServiceDetail`)
- Home Services section (`src/features/home/sections/Services.tsx`) — the only Home section that consumed the static Services data.

`start-project` (service-selection checkboxes) also imports the old `ServiceItem` type/array but is **not** a Services route or a Home section — out of scope per spec §1/§11, left untouched (see §J).

## C. Data-source migration

```
CMS `services` row (published only, RLS-enforced)
        ↓
getPublishedServices() / serviceContentService.ts   (Module 9A, unchanged)
        ↓
getPublicServiceRows()  — new: request-memoized (react cache()) boundary
        ↓
toServiceItem() / toServiceDetail()  — new: pure adapters
        ↓
existing `ServiceItem` / `ServiceDetail` types
        ↓
existing, unmodified Service section components
```

New file: `src/features/services/data/publicServices.ts`. It is the only file that imports `ServiceRow`/`getPublishedServices` on the public side; every component still imports the same `ServiceItem`/`ServiceDetail` types as before.

## D. Field mapping

| CMS `services` column | Frontend field | Notes |
|---|---|---|
| `slug` | `ServiceItem.slug` / `ServiceDetail.slug` | direct |
| `name` | `ServiceItem.label` | direct |
| `category` | `ServiceItem.category` | direct |
| `short_description` | `ServiceItem.description` | direct |
| `tags` | `ServiceItem.tags` | direct |
| `icon_key` | `ServiceItem.visual` | validated against the fixed 8-value union `ServiceVisual` supports; unrecognized values fall back to `"web"` rather than reaching an unmapped case (spec §15) |
| `problem` | `ServiceDetail.problem` | `null` → `""` |
| `capabilities` | `ServiceDetail.capabilities` | direct (not-null array column) |
| `architecture` | `ServiceDetail.architecture` | direct (not-null array column) |
| `principles` | `ServiceDetail.principles` | direct (not-null array column) — indices into the still-static `sixS` list, unchanged (see §E of MODULE-9A-HANDOFF.md; Six S itself was never migrated and isn't in this module's scope) |
| `sort_order` | `ServiceItem.index` (derived) | see §E below |
| `media_path` | *(not consumed)* | see §F |

No fields were invented; no CMS field is exposed publicly beyond what the existing components already render.

## E. Ordering

`listPublishedServices()` already orders by `sort_order ascending` at the repository level. `ServiceItem.index` (used for `NumberIndicator`, the rail, and prev/next navigation) is derived as the 1-based position in that already-sorted array — no client-side sort, no hardcoded indexes.

## F. Media

The current public Services UI (`ServiceVisual.tsx`) is a purely procedural inline-SVG icon set keyed by `icon_key`/`visual` — it never renders an image from a path. `media_path` exists on the CMS row but has no current public consumer, so no media URL helper was built (spec §14/§11 — don't invent unused mapping). If a future module adds real service imagery, the helper belongs next to `publicServices.ts`.

## G. Caching / freshness

Investigated the existing rendering model first: every route under the `(site)` route group is already forced into fully dynamic (per-request) rendering, because `src/app/(site)/layout.tsx` calls `getCurrentProfile()` (cookie-based auth) for the header. This was true before this module and is unrelated to Services. Confirmed via `next build` output — `/services` renders as `ƒ (Dynamic)`, same as every other public route (`/about`, `/projects`, `/insights`, etc.).

Given that, published/edited Services are visible on the very next request with **no additional caching layer needed** — the "must go live without a redeploy" requirement (spec §17) is already satisfied by the site's existing architecture. An earlier draft of this module added `export const revalidate = 60` to both Services routes; removed after the build proved it has no effect on an already-force-dynamic route, since keeping a no-op export around would misdocument the real caching behavior for the next person.

`/services/[slug]`'s `generateStaticParams()` intentionally returns `[]` rather than querying the CMS at build time (this sandbox also has no network path to Supabase during `next build`; see §M). `dynamicParams` defaults to `true`, so slugs are still resolved normally at request time.

Within one request, `getPublicServiceRows()` is wrapped in React's `cache()`, so `/services` (hero + progression, two components) and `/services/[slug]` (metadata + page) each issue exactly one Supabase query no matter how many of their child components read it (spec §11/§21).

## H. Empty/error/loading behavior

- **Empty** (`getPublicServices()` returns `[]`): `ServiceRail` assumes at least one item, so both `home/sections/Services.tsx` and `ServiceProgression.tsx` now branch — render the rail only when there's at least one service, otherwise a plain one-line message in the same section's existing tone/typography (spec §18). No fabricated content, no reintroduced static fallback.
- **Error**: `getPublishedServices()`/`getPublicServiceRows()` never throw — a query failure is caught, logged server-side (`console.error`), and degrades to the same empty state above rather than crashing the page (spec §19). No Postgres/Supabase internals reach the client.
- **Slug not found** (no published service, or a draft/archived slug): `getPublicServiceDetail()` returns `null`, page calls `notFound()` — unchanged from the previous static-data behavior.
- **Loading**: no `loading.tsx`/Suspense existed for these routes before, and none was added — nothing in this migration introduces a new loading gap (fully server-rendered, spec §20).

## I. Home integration

Only `src/features/home/sections/Services.tsx` consumed the static Services data on the Home page; it's now an async Server Component calling `getPublicServices()`. No other Home section (`Hero`, `Positioning`, `SixSJourney`, `Work`, `TeamJourney`, `FinalCta`) was touched. `SixS`/`sixS.ts` remains a separate, non-CMS list, as decided in Module 9A.

## J. Static file cleanup

**Retained, not removed.** After migrating every Services-route and Home-section consumer, these two static files still have legitimate remaining consumers outside this module's scope:

- `src/features/home/data/services.ts` (`ServiceItem` type + `services` array) — still imported by:
  - `src/features/start-project/components/ServiceSelector.tsx` (type only)
  - `src/features/start-project/sections/ProjectForm.tsx` (the array, for the inquiry form's service checkboxes)
  - `src/lib/validation/projectInquiry.ts` (the array, to validate submitted service slugs)
  - `src/features/services/sections/ServiceDetailHero.tsx` (type only)
  - `src/features/home/components/ServiceVisual.tsx` (type only)
- `src/features/services/data/serviceDetails.ts` (`ServiceDetail` type) — still the type Module 9F's own adapter targets (by design, per spec §6: reuse the existing frontend type rather than inventing a new one).

None of these are Services routes or Home sections, so migrating them is out of this module's scope (spec §1/§11). Revisit when `start-project` is migrated in a later module.

## K. Security

- Public reads go through `getPublicServiceRows()` → `getPublishedServices()` → `listPublishedServices()`, the same Module 9A public service/repository functions — no new data-access path was created.
- RLS was not modified. `services_select_published` (restricted to `status = 'published'`) is what actually enforces the published-only guarantee; the service layer's own read is defense-in-depth, not the primary gate.
- No `service-role` client and no admin service functions (`listAllServicesForAdmin`, `createService`, etc.) are imported anywhere under `src/features/services/*` or `src/features/home/*`.
- No Supabase credentials or admin-only code reach client components — every touched component is (and remains) a Server Component.

## L. Public UI preservation

No component under `src/features/services/sections/*`, `src/features/home/sections/Services.tsx`, `ServiceVisual.tsx`, or `ServiceRail.tsx` had its markup, styling, or motion changed. Every edited file only changed *how its data arrives* (props are still the same `ServiceItem`/`ServiceDetail` shapes) — `ServicesHero`, `ServiceProgression`, and `Services` became `async` functions that fetch before returning the same JSX. `ServiceDetailHero`/`ServiceProblem`/`ServiceCapabilities`/`ServiceArchitecture`/`ServiceWhy6Stanza`/`ServiceFinalCta` were not touched at all.

## M. Verification

- `npm run lint` — **passes**, no warnings.
- `npx tsc --noEmit` — **passes** (a `LayoutProps` error appears only before `.next/types` has been generated by a build; not related to this module, and it clears once `next build` has run once).
- `npm run build` — **passes**. `/services` renders `ƒ (Dynamic)`; `/services/[slug]` shows as SSG-capable with zero prerendered params (by design, see §G) and `dynamicParams: true`.
- **Live Supabase test**: not performed. This sandbox has no network path to `*.supabase.co` (only npm/pip/GitHub-style registries are reachable), so `getPublishedServices()` fails during the build and every affected page correctly falls back to its documented empty state — visible in the build log (`getPublicServiceRows: query failed: ...`). This is the intended error-handling path exercising itself, but it is **not** a substitute for testing against real published/draft/archived rows, sort order, and revalidation timing. That verification (spec §26/§27) needs to happen against the real Supabase project outside this environment.
- **Browser verification**: not performed, for the same reason — no rendering environment with real CMS data was available here.
- No pre-existing unrelated lint/typecheck/build failures were found.

## N. Remaining work

- Module 9G — Public Projects Migration.
- Live-database and browser verification of this module (§M) against the real Supabase project.
- `start-project`'s use of the static `services` array (§J) is a known, intentionally out-of-scope follow-up, not a defect in this module.
