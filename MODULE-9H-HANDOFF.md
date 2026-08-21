# MODULE 9H — PUBLIC TEAM MIGRATION — HANDOFF

## A. What was inspected

- `supabase/migrations/0005_cms_content.sql` — the `team_members` table, its RLS policies (`team_members_select_published` for `anon, authenticated` restricted to `status = 'published'`, plus the separate `team_members_select_admin_all`), and the `TeamMemberSocialLink` comment confirming `social_links` mirrors `TeamMember.socialLinks`.
- `supabase/migrations/0004_storage_buckets.sql` — the `team` Storage bucket (`public: true`, public read via `storage_public_read`, admin-only write), created in Module 5 specifically for this table's future portrait imagery.
- `src/lib/validation/cmsContent.ts` — `teamMemberSchema` and `mediaPathSchema` (admin write validation only; confirms `image_path`/`imagePath` is a storage-relative path, not a full URL).
- `src/lib/repositories/teamMembers.ts` — confirmed `listPublishedTeamMembers()`/`getPublishedTeamMemberBySlug()` already exist and already order by `sort_order`, relying on RLS rather than an app-level `status` filter (same pattern as Services/Projects).
- `src/lib/services/teamContentService.ts` — confirmed `getPublishedTeamMembers()`/`getPublishedTeamMember(slug)` already exist as the public read layer (Module 9A foundation).
- `src/lib/supabase/database.types.ts` — the `team_members` `Row` type and the shared `TeamMemberSocialLink` (`{ label, href }`) interface, confirmed to match the migration column-for-column, including that `social_links` is `jsonb`.
- Public Team implementation: `src/features/home/data/team.ts` (`TeamMember`), every section under `src/features/team/sections/*`, and every Home Team consumer.
- Every consumer of the static file and types, via `rg "home/data/team" src`, `rg "TeamMember\b" src`, `rg "socialLinks" src` — confirming `TeamHero`, `TeamSequence`, `TeamFocus` (all under `/team`) and `TeamJourney` (Home) were the only active runtime consumers of the `team` array, and that `TeamIntro`, `HowWeWork`, `TeamCulture`, `TeamFinalTransition` don't consume Team data at all.
- `src/features/home/sections/Team.tsx` — confirmed orphaned: not imported by `src/app/(site)/page.tsx` (which renders `TeamJourney` instead) or anywhere else in `src`.
- No `/team/[slug]` (or equivalent) detail route exists anywhere under `src/app` — only `/team` and the `/admin/team*` routes.
- The admin Team CMS (`TeamMemberForm`, `TeamSocialLinksEditor`, `TeamMemberTable`, `TeamMemberStatusFilterTabs`, `ArchiveTeamMemberButton`, `/admin/team*` pages) — confirmed none of it imports the public static file or types touched here.
- Reused the exact adapter/caching/empty-state pattern established in Modules 9F/9G (`MODULE-9F-HANDOFF.md`, `MODULE-9G-HANDOFF.md`), per this module's explicit instruction to follow that precedent.

## B. Routes migrated

- `/team` (`TeamHero` + `TeamSequence` + `TeamFocus`; `TeamIntro`/`HowWeWork`/`TeamCulture`/`TeamFinalTransition` were inspected but don't consume Team data, so they were left untouched).
- Home Team section (`src/features/home/sections/TeamJourney.tsx`) — the only active Home section that consumed the static Team data.
- No Team detail route exists, so none was migrated or created (spec §18).

## C. Data-source migration

Both `/team` and the Home section flow through one new boundary file, `src/features/team/data/publicTeam.ts`:

```
CMS `team_members` row (published only, RLS-enforced)
        ↓
getPublishedTeamMembers()   (Module 9A, teamContentService.ts, unchanged)
        ↓
getPublicTeamRows()  — new: request-memoized (react cache()) boundary
        ↓
toTeamMember() / normalizeSocialLinks()  — new: pure adapter
        ↓
existing `TeamMember` type (src/features/home/data/team.ts)
        ↓
existing, unmodified Team presentation components
```

`TeamHero`/`TeamSequence`/`TeamFocus` now receive `team: TeamMember[]` as a prop from the async `/team` `page.tsx`, which calls `getPublicTeam()` once. `TeamJourney` (Client Component) receives the same prop from the Home `page.tsx`, which also became `async` and calls `getPublicTeam()`. React's `cache()` inside `getPublicTeamRows()` means these two independent server-rendered pages each still only issue one Supabase query, no matter how many components on that page read the result.

## D. Field mapping

| CMS `team_members` column | Frontend field | Notes |
|---|---|---|
| `slug` | `TeamMember.slug` | direct |
| `name` | `TeamMember.name` | direct |
| `role` | `TeamMember.role` | direct |
| `discipline` | `TeamMember.discipline` | direct |
| `short_bio` | `TeamMember.shortBio` | direct |
| `initials` | `TeamMember.initials` | direct |
| `image_path` | `TeamMember.image` | storage-relative path → full public Storage URL via `getPublicMediaUrl("team", ...)`; `null`/empty → `undefined` (existing initials fallback) — see §F |
| `social_links` | `TeamMember.socialLinks` | `jsonb` → `{ label, href }[]`, normalized — see §E |
| `sort_order` | collection order | see §G |

No fields were invented; no CMS field is exposed publicly beyond what the existing components already render.

## E. Social links

`social_links` is typed as `TeamMemberSocialLink[]` in `database.types.ts`, but Postgres doesn't enforce that shape at the `jsonb` column level. `normalizeSocialLinks()` in `publicTeam.ts` defensively validates the raw value at the data boundary (spec §9):

- non-array `social_links` → `undefined` (same as "no social links" today)
- non-object entries → dropped
- an entry missing a non-empty string `label` or `href` → dropped
- an all-dropped result → `undefined` rather than `[]`, matching the existing `TeamMember.socialLinks?` optional-and-absent semantics

A malformed entry only ever shrinks the list of links for that member — it never throws or crashes the page. Note (see §M): no current `/team` or Home component actually renders `socialLinks` yet (`TeamHero`/`TeamSequence`/`TeamFocus`/`TeamJourney` render name/role/discipline/bio/image/initials only), so this normalization has no visible effect today — it exists so the field maps correctly and safely the moment a future chapter starts rendering it, without another migration.

## F. Media

Inspected every image consumer: `TeamSequence.tsx` and `TeamFocus.tsx` both already do `member.image ? <Image src={member.image} .../> : <initials fallback>`; `TeamHero` and `TeamJourney` never render `member.image` (`TeamJourney`'s compact cards always show initials, by existing design, even when an image exists — unchanged here). Unlike Services/Projects (Modules 9F/9G), Team's `image_path` **is** consumed publicly, so a media URL helper was required.

Created `src/lib/cms/media.ts` — `getPublicMediaUrl(bucket, path)` — a single centralized helper building the public Supabase Storage URL (`{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/{bucket}/{path}`), used here as `getPublicMediaUrl("team", row.image_path)`. This matches the `team` bucket's `public: true` setting in `0004_storage_buckets.sql`, so a plain object URL is sufficient — no signed URL needed. Behavior:

```
image_path exists  → full public Storage URL → TeamMember.image
image_path absent  → undefined                → existing initials fallback (unchanged, both components already had this branch)
```

No upload UI, no media management, no new image component — the existing `<Image>` + initials branch in `TeamSequence`/`TeamFocus` was not touched.

## G. Ordering

`listPublishedTeamMembers()` already orders by `sort_order ascending` at the repository level (unchanged). The public Team collection preserves that order end-to-end — `getPublicTeam()` does a plain `.map()` with no re-sort, and every consumer (`TeamHero`'s count, `TeamSequence`'s indexed strip + active-member readout, `TeamFocus`'s alternating layout, `TeamJourney`'s numbered cards) derives its index from array position in that already-sorted collection, exactly as it did with the static array before.

## H. Home integration

Only `src/features/home/sections/TeamJourney.tsx` consumed the static Team data on the Home page; `src/app/(site)/page.tsx` is now `async`, calls `getPublicTeam()` once, and passes `team` down to `<TeamJourney team={team} />`. No other Home section was touched. `TeamJourney` remains a Client Component (`"use client"`, for its `HorizontalScroller` state) — it now receives CMS-backed data as a prop instead of importing the static array, per spec §24 ("don't move data fetching into the client just because the component is animated").

## I. Empty/error/loading behavior

No CMS empty/error state silently falls back to the old static data (spec §16) — `getPublicTeamRows()` returns `[]` on a service-layer failure, which flows through to an empty `team` array everywhere.

- `TeamHero` — team's headcount numeral becomes `"00"`; nothing else in it depends on individual members, so it renders normally with an empty list (no defensive branch needed).
- `TeamSequence` — added the smallest defensive conditional: `if (!active) return null;` guards `team[activeIndex]` being `undefined` when `team` is empty, hiding the section rather than crashing.
- `TeamFocus` — added `if (team.length === 0) return null;` for the same reason (it `.map()`s over `team` with no other guard previously).
- `TeamJourney` (Home) — added `if (team.length === 0) return null;`, matching the established Home empty-state pattern already used by `Work`/`Services` (Modules 9F/9G).

No loading state was added — `/team` had no pre-existing `loading.tsx`/Suspense/skeleton to preserve, and this module doesn't introduce one (spec §23).

For a Team collection failure, the error is logged server-side (`console.error` inside `getPublicTeamRows`) and never reaches the browser as SQL/Supabase internals — the public page just renders the empty state described above. There's no Team detail route (§B), so the `notFound()` requirement for missing members doesn't apply here.

## J. Caching / freshness

Re-confirmed Module 9F/9G's finding: `src/app/(site)/layout.tsx` calls `getCurrentProfile()` (cookie-based auth, for the header) for every route in the `(site)` route group, which forces all of them — including `/team`, now — into fully dynamic, per-request rendering. Verified via `next build` output: `/team` renders `ƒ (Dynamic)`, identical to `/about`, `/services`, `/projects`, `/insights`. No `revalidate`/`unstable_cache`/`force-static` was added — the requirement ("publish without redeploy") is already satisfied by the existing architecture, same conclusion as 9F/9G.

Within one request, `getPublicTeamRows()` is wrapped in `react.cache()`, so `/team` (hero + sequence + focus) and the Home page (`TeamJourney`) each issue exactly one Supabase query per request no matter how many components read it.

## K. Static data cleanup

**Retained** (not removed):

- `team: TeamMember[]` array in `src/features/home/data/team.ts` — its only remaining runtime consumer is `src/features/home/sections/Team.tsx`, an orphaned legacy component not imported by any active route (confirmed via `rg "sections/Team\b" src` — only self-references and the file's own export). Per spec §14/§15/§36, an orphaned consumer is not sufficient justification to either delete the component or the data it depends on in this module; both are left in place and explicitly documented (see the header comments added to both files).
- `TeamMember` interface in the same file — still the live type contract for the new adapter and every active presentation component (all now type-only imports).

**Removed:** nothing. Unlike Module 9G's Projects migration, Team's runtime static data could not be fully retired in this module because of the orphaned `Team.tsx` consumer — this mirrors Module 9F's Services situation (`start-project`'s service selector), not 9G's clean removal.

**Migrated off the static array** (now import only the `TeamMember` type, or nothing from `team.ts` at all): `TeamHero.tsx`, `TeamSequence.tsx`, `TeamFocus.tsx`, `TeamJourney.tsx`.

## L. Security

- Public reads go through `getPublicTeamRows()` → `getPublishedTeamMembers()` → `listPublishedTeamMembers()`, the same Module 9A public service/repository functions — no new data-access path was created.
- RLS was not modified. `team_members_select_published` is the actual enforcement boundary; the service layer's own read is defense-in-depth.
- No `service-role` client and no admin service functions (`listAllTeamMembersForAdmin`, `createTeamMember`, etc.) are imported anywhere under `src/features/team/*` or `src/features/home/*`.
- Draft and archived members are structurally excluded — the underlying row collection returned by `listPublishedTeamMembers()` is published-only by construction (RLS), so there's no code path in the public adapter that could leak one.
- No Supabase credentials or admin-only code reach client components. `TeamHero`/`TeamFocus` are Server Components; `TeamSequence`/`TeamJourney` are Client Components that only ever receive plain, already-fetched `TeamMember[]` props — no Supabase client, credentials, or fetch logic was added to either.
- `getPublicMediaUrl()` only ever builds a URL against the `team` bucket, which is `public: true` by design (Module 5) — no signed URL or credential is involved.

## M. Public UI preservation

No markup, styling, or motion changed in `TeamHero`, `TeamSequence`, `TeamFocus`, or `TeamJourney` — each became a function that receives `team` as a prop (or, for the page-level components, an `async` function that fetches before returning the same JSX) plus the minimal empty-state branch required by spec §17. No Team redesign. No motion-system refactor — `HorizontalScroller`, `ScaleReveal`, `Reveal`, `SplitHeading`, `Parallax` are all untouched. `TeamIntro`, `HowWeWork`, `TeamCulture`, `TeamFinalTransition` were not touched at all.

## N. Verification

- `npm run lint` (`eslint`) — **passes**, no warnings.
- `npx tsc --noEmit` — **one pre-existing, unrelated failure**: `src/app/layout.tsx(23,50): error TS2304: Cannot find name 'LayoutProps'`. This is the same global-type error documented in the Module 9F/9G handoffs — it clears once `.next/types` is generated by a build, and is unrelated to anything touched in this module.
- `npm run build` — **passes**. `/team` renders `ƒ (Dynamic)`, matching every other `(site)` route. `/admin/team`, `/admin/team/new`, `/admin/team/[id]` all compiled and are present in the route list, unaffected. The build log shows `getPublishedTeamMembers: query failed ... Dynamic server usage` and `getPublicTeamRows: query failed: Unable to load the team.` during prerendering (expected — no live Supabase reachable from this sandbox, see below), confirming the error-handling/empty-state path exercises itself correctly during the build rather than crashing it.
- **Live Supabase test**: not performed — same sandbox limitation as Modules 9F/9G (no network path to `*.supabase.co`; only npm/pip/GitHub-style registries are reachable from this environment). No published/draft/archived `team_members` rows, `sort_order`, `image_path`/Storage URL, or `social_links` JSON were exercised against the real Supabase project.
- **Browser verification**: not performed, for the same reason.
- No new pre-existing unrelated lint/typecheck/build failures were found beyond the one documented above (already present before this module).

## O. Remaining work

- Module 9I — Public Insights Migration.
- Live-database and browser verification of this module (§N) against the real Supabase project — same outstanding item carried over from Modules 9F/9G, now covering Services, Projects, and Team.
- No Team-specific follow-up beyond that. The orphaned `src/features/home/sections/Team.tsx` (§K) remains exactly as found — out of scope for this module, not cleaned up, and still depends on the retained static `team` array.
