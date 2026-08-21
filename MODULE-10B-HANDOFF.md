# MODULE 10B — PUBLIC WEBSITE LOADING, EMPTY & ERROR STATES — HANDOFF

## A. Public routes audited

- `/` (Home) — `src/app/(site)/page.tsx` + `Services`, `Work`, `TeamJourney` sections
- `/services` — `src/app/(site)/services/page.tsx` + `ServiceProgression`
- `/services/[slug]` — `src/app/(site)/services/[slug]/page.tsx`
- `/projects` — `src/app/(site)/projects/page.tsx` + `FeaturedProjects`
- `/projects/[slug]` — `src/app/(site)/projects/[slug]/page.tsx` + `ProjectGallery`
- `/team` — `src/app/(site)/team/page.tsx`
- `/insights` — `src/app/(site)/insights/page.tsx`
- `/insights/[slug]` — `src/app/(site)/insights/[slug]/page.tsx`

All four public data boundaries were audited and changed:
`src/features/services/data/publicServices.ts`,
`src/features/projects/data/publicProjects.ts`,
`src/features/team/data/publicTeam.ts`,
`src/features/insights/data/publicInsights.ts`.

## B. Loading behavior

- Every `(site)` route continues to share `src/app/(site)/loading.tsx` (Module 10A's centered `Loader`) as the route-transition loading state. No page-specific skeleton was added — the spec explicitly discourages unnecessary route-specific loading architecture (§9), and the existing foundation was judged sufficient for all eight routes.
- No section does client-side data fetching, so there is no secondary in-page loading spinner to add; all public CMS reads are `await`ed in Server Components, and Next's route-level `loading.tsx` covers the interval before those resolve.

## C. Empty behavior

"Empty" now only ever means *the query succeeded and returned zero published rows* — never a symptom of a failed request (see §D and the architectural fix in §K).

| Collection | Empty copy | Where |
|---|---|---|
| Home Services | "Services are being updated — check back shortly." | `home/sections/Services.tsx` |
| Home Work | "Selected work is being updated — check back shortly." | `home/sections/Work.tsx` |
| Home Team | *(section renders nothing — unchanged Module 9H behavior)* | `home/sections/TeamJourney.tsx` |
| Services list | `EmptyState` — "No services are currently available." | `services/sections/ServiceProgression.tsx` (previously rendered a silently empty `<nav>` — now fixed) |
| Projects list | "Projects are being updated — check back shortly." *(existing Module 9G copy, preserved)* | `projects/sections/FeaturedProjects.tsx` |
| Team | `EmptyState` — "No team members are currently available." | `app/(site)/team/page.tsx` |
| Insights | `EmptyState` — "No insights are currently available." | `app/(site)/insights/page.tsx` (previously showed only the "00" hero with no explanation — now fixed) |

Detail routes (`/services/[slug]`, `/projects/[slug]`, `/insights/[slug]`) intentionally have no conventional empty state, per spec §11 — a missing published resource is `notFound()`, not an empty state.

## D. Error behavior

**Architectural fix (spec §4/§24):** all four public data files (`getPublicServiceRows`, `getPublicProjectRows`, `getPublicTeamRows`, `getPublicInsightRows`) previously caught a failed Supabase read and returned `[]`, making "zero rows" and "the query failed" indistinguishable to every consumer. They now return a `PublicCollectionResult<T>` (`{ ok: boolean; data: T[] }`) from the new `src/lib/utils/publicCms.ts`. `ok: false` means the read failed; `data` stays an array so existing `.length`/`.map()` call sites keep compiling, but every section that needs to distinguish empty-from-error now destructures `{ ok, data }` and branches on `ok` first.

Sections wired to show a controlled error (via the new `PublicRetryState` client component, built on Module 10A's `ErrorState`):

- Home → `Services`, `Work`, `TeamJourney` (each independently — a failed Services read does not affect Work or Team, satisfying spec §5/§6)
- `/services` → `ServiceProgression`
- `/projects` → `FeaturedProjects`
- `/team` → `app/(site)/team/page.tsx` (rendered above `TeamIntro`, hero still renders with the collection it has)
- `/insights` → `app/(site)/insights/page.tsx` (rendered below the count hero)

All error copy is generic ("We couldn't load our services right now. Please try again.") — no Supabase/Postgres/stack-trace detail is ever passed to the client; the real failure is only `console.error`-logged server-side (unchanged from the Module 9F/9G/9H/9I pattern).

Detail-route query failures (`/services/[slug]`, `/projects/[slug]`, `/insights/[slug]`) now throw via the new `throwPublicCmsError()` helper, which attaches the `safeMessage` marker Module 10A's `getSafeErrorMessage`/`error.tsx` already look for — so a database outage on a detail page surfaces the existing root error boundary with safe copy and a working Retry (`reset()`), and is never misreported as `notFound()`.

## E. Not-found behavior

All three detail routes now use a `PublicDetailResult<T>` (`found | not-found | error`) from the same data functions:

- **Unknown / draft / archived slug** → `status: "not-found"` → `notFound()` (unchanged visible behavior — Module 9F/9G/9I already made drafts/archived indistinguishable from unknown at this boundary, which is preserved).
- **Query failure** → `status: "error"` → `throwPublicCmsError()` → root `error.tsx`, **never** `notFound()`. This was the one real correctness gap in the previous implementation: `getPublicServiceDetail`/`getPublicProjectDetail`/`getPublicInsightBySlug` previously returned `null` for *both* cases, so an infrastructure failure while resolving `/services/some-real-slug` would have 404'd instead of showing an error.

`generateMetadata` in all three detail pages now also checks `result.status !== "found"` before returning `{}` — it never fabricates title/description from a failed read, and it doesn't duplicate error-boundary logic (the page body's own read is what actually throws).

## F. Public media fallback

No regressions — verified by inspection, not touched functionally:

- **Team** (`publicTeam.ts` → `toTeamMember`): `image` from `getPublicMediaUrl`, falls back to `member.initials` in `TeamHero`/`TeamSequence`/`TeamJourney`/`TeamFocus` exactly as before.
- **Services** (`publicServices.ts` → `toServiceItem`): `image` from `getPublicMediaUrl`, falls back to the procedural `ServiceVisual` (`kind={service.visual}`) exactly as before.
- **Project gallery** (`publicProjects.ts` → `getProjectGalleryImages`): still returns `[]` on failure (left as-is deliberately, see §K), and `ProjectGallery` still falls back to its procedural panels when `images` is empty/short — unchanged from Module 9K.
- **Team social links** (`publicTeam.ts` → `normalizeSocialLinks`, `TeamSocialLinks.tsx`): unchanged Module 9N behavior — malformed/unsafe-scheme entries are dropped per-entry at the data boundary, so one bad link can't crash or hide the rest.

## G. Retry behavior

New `src/components/ui/PublicRetryState.tsx` — a small Client Component wrapping Module 10A's `ErrorState` with `onRetry={() => router.refresh()}`. This is the one piece of client behavior retry needs; every section that shows an error is otherwise still a Server Component. No global retry manager was built, per spec §22.

## H. Motion/design preservation

No GSAP/ScrollTrigger/Lenis/`Reveal`/`Parallax`/`ScaleReveal`/`HorizontalScroller`/`ServiceRail` code was touched. All error/empty additions are plain conditional branches inserted around existing JSX, using the same `Container`/typography tokens the surrounding chapter already uses (dark chapters pass `border-[var(--color-border-inverse)]` into `PublicRetryState`/`EmptyState` so they read correctly against the navy background). No new animation was added to any state.

## I. Verification

**Static audit:** performed for all 8 routes and all 4 public data files — traced page → section → data file → repository for each, confirmed which branch (`found`/`not-found`/`error`/`empty`) each caller now takes.

**Commands actually run:**
```
npm install            → succeeded (441 packages; node_modules had not been installed)
npm run lint            → passed, zero errors/warnings
npx tsc --noEmit        → one error: src/app/layout.tsx(23,50): Cannot find name 'LayoutProps' — pre-existing, not introduced by 10B (see §34 of the module spec, which names this exact error)
rm -rf .next && npm run build   → succeeded; all 8 public routes + admin routes compiled
```
Build output confirms the expected dev-sandbox behavior: with no `SUPABASE` credentials available at build time, every public data read logs `"...query failed: Unable to load ... Please try again."` and pages that depend on `cookies()` (`/team`, `/admin`) correctly report `DYNAMIC_SERVER_USAGE` and are marked dynamic (`ƒ`) rather than statically prerendered — this is pre-existing, expected behavior (the site has always been fully dynamic; see the `generateStaticParams` comments in the detail-route pages), not a regression from this module.

**Not run (no live/browser access in this sandbox):** actual browser rendering of loading/empty/error/not-found states, live Supabase failure injection, responsive viewport screenshots. These are marked explicitly not run rather than fabricated, per spec §33.

## J. Public state matrix (as implemented)

| Route | Loading | Empty | Error | Not Found |
|---|---|---|---|---|
| `/` | ✅ (site `loading.tsx`) | ✅ (per-section) | ✅ (per-section, isolated) | N/A |
| `/services` | ✅ | ✅ | ✅ | N/A |
| `/services/[slug]` | ✅ | N/A | ✅ (never 404s) | ✅ |
| `/projects` | ✅ | ✅ | ✅ | N/A |
| `/projects/[slug]` | ✅ | N/A | ✅ (never 404s) | ✅ |
| `/team` | ✅ | ✅ | ✅ | N/A |
| `/insights` | ✅ | ✅ | ✅ | N/A |
| `/insights/[slug]` | ✅ | N/A | ✅ (never 404s) | ✅ |

## K. Remaining work / notes for later modules

- **Project gallery sub-read still degrades failure to `[]`** (`getProjectGalleryImages` in `publicProjects.ts`), by design — spec §14 explicitly asks for this: a gallery outage should fall back to `ProjectGallery`'s existing procedural panels rather than erroring out an otherwise-successful project page. This is the one place a failure is *intentionally* left indistinguishable from empty, and it's documented here rather than silently done.
- **`ServicesHero`/`ProjectsHero` counts** (`"01 – 08"` style indicators) read `data.length` from the updated collection result but don't themselves branch on `ok` — on a failed read the count silently shows `00`. This was a deliberate scope call: the section immediately below each hero (`ServiceProgression`/`FeaturedProjects`) already shows the real error+retry, so duplicating error UI in the hero would be redundant chrome for a decorative counter, not a missing state.
- Admin (`/admin/*`), authentication (`/login`, `/signup`, `/auth/*`), and media upload states are explicitly out of scope for this module (10C/10D/10E) and were not touched.
- `src/app/layout.tsx`'s `LayoutProps` TypeScript error remains pre-existing and unrelated to this module.
