# MODULE 9M — CMS DATA & MEDIA INTEGRATION FIXES + COMPLETE CRUD — HANDOFF

## Environment constraint (same as 9L)

This sandbox has **no network egress**. `npm install` fails with `403 Forbidden` against the npm registry, and no Supabase host is reachable, so `npm run lint`, `npx tsc --noEmit`, `npm run build`, and every live-Supabase/browser test in spec §36–§38 could not be run. What follows is a complete code-level trace of every content type's data flow, with fixes applied where an actual break point was found — not a browser-verified result.

## A. Problems discovered

Tracing every reported issue against the actual current code (not the prior handoffs' claims):

1. **Home Team image dropped — real bug.** `src/features/home/sections/TeamJourney.tsx` receives fully correct CMS data (Home's `page.tsx` calls `getPublicTeam()`, and `publicTeam.ts`'s `toTeamMember()` maps `image_path` → `image` correctly, exactly like `/team`'s `TeamSequence.tsx`/`TeamFocus.tsx`). But `TeamJourney.tsx`'s own card markup never read `member.image` at all — it unconditionally rendered `member.initials`, regardless of whether a real portrait existed. This is the actual break point: not stale data, not a missing adapter field, but one component that never consumed a field it was already being handed.
2. **Team description — not reproducible in code.** Traced `team_members.short_bio` → `getPublicTeamRows()`/`toTeamMember()` (maps to `shortBio`) → `TeamMemberForm` (submits `shortBio` correctly, preloads it correctly on edit) → `TeamFocus.tsx` (renders `member.shortBio`) → `TeamJourney.tsx` (also renders `member.shortBio`, unaffected by fix #1). Every layer maps the field correctly. No break point was found in the code as written. This may be a live-data issue (e.g. a specific team member's row genuinely has an empty `short_bio`, which the `char_length(short_bio) between 1 and 1000` constraint would actually prevent at the database level) rather than a code integration bug — flagged as unverified rather than "fixed," since nothing in this sandbox could reproduce it against live data.
3. **Service image — confirmed Case B, not a bug.** `ServiceItem` (the type every Service public surface actually renders) has no image field at all — `ServiceVisual.tsx` renders a fixed procedural icon pattern (`kind: "web" | "cloud" | ...`) keyed off `icon_key`, never a photo. There is no legitimate public image slot in the current Services design for `media_path` to fill. This matches what Module 9K's own handoff already documented (§I: "`services.media_path` has no public consumer"). No fix made — inventing a new image section would violate this module's own "do not invent UI" instruction (spec §7/§30).
4. **No permanent delete for any content type — real gap.** `actions.ts` had `create`/`update`/`archive` for all four content types, but no `delete`. "Archive" only ever sets `status = 'archived'` and keeps the row — there was no way to actually remove a record. Fixed for all four types (see §F).

## B. Data-flow fixes

**Home Team image:**
```
Before: member.image (correctly populated by publicTeam.ts) → never read by TeamJourney.tsx → only initials render
Problem: the component's own JSX branch was missing, not the data pipeline
After:  TeamJourney.tsx now renders <Image src={member.image} .../> when present, falling back to initials
        exactly like TeamSequence.tsx/TeamFocus.tsx already did — same fallback contract, same next/image usage
```
Changed file: `src/features/home/sections/TeamJourney.tsx`.

No other data-flow fix was made. Every other traced pipeline (Services, Projects, Insights, Project gallery) was already correct end-to-end — see §D for the field-by-field detail.

## C. Public surfaces

- **Home** (`src/app/(site)/page.tsx`): consumes Services (`Services.tsx`, via `getPublicServices()`), Projects (`Work.tsx`), and Team (`TeamJourney.tsx`, via `getPublicTeam()`, now with the image fix). Insights is **not** consumed on Home — confirmed no import of `publicInsights` anywhere under `src/features/home/*` or `src/app/(site)/page.tsx`. This isn't a gap; there was never a Home Insights section in the design to wire.
- **Services** (`/services`, `/services/[slug]`): fully CMS-backed via `publicServices.ts`; no static-array fallback in the active route.
- **Projects** (`/projects`, `/projects/[slug]`): fully CMS-backed via `publicProjects.ts`, including the gallery; no static-array fallback in the active route.
- **Team** (`/team`, plus the Home Team section): fully CMS-backed via `publicTeam.ts`, both surfaces now rendering images correctly.
- **Insights** (`/insights`, `/insights/[slug]`): fully CMS-backed via `publicInsights.ts`; content blocks, next-article navigation, and metadata are all sourced from the CMS row, no static-array fallback in the active route.

The one static array still wired to a real component (`services` in `src/features/start-project/sections/ProjectForm.tsx`, feeding `ServiceSelector.tsx`) is `/start-project`'s inquiry form — explicitly out of scope for this module (spec: "Do NOT migrate `/start-project`"), left untouched. `src/features/home/sections/Team.tsx` still imports the static `team` array but is confirmed orphaned — no route imports it (`rg "sections/Team\b" src` returns only itself and the unrelated `TeamJourney`/`TeamHero`/etc. filenames) — so it renders nowhere and was left as-is per this module's "don't delete without proof of safety" instruction; it was already documented as dead code before this module.

## D. Field completeness

| Content Type | DB Field | Public Adapter | Frontend Type | Public Consumer | Rendered? |
|---|---|---|---|---|---|
| Services | slug/name/category/short_description/tags/icon_key | `toServiceItem` | `ServiceItem` | Home rail, `/services`, hero | ✅ |
| Services | problem/capabilities/architecture/principles | `toServiceDetail` | `ServiceDetail` | `/services/[slug]` | ✅ |
| Services | media_path | — (no mapping) | — | none | ❌ (Case B, no consumer — see §A.3) |
| Services | sort_order/status | repository `order by`/RLS | — | ordering + draft/archive exclusion | ✅ |
| Projects | slug/title/category/description/technologies/outcome/accent | `toProjectItem` | `ProjectItem` | Home Work, `/projects`, hero, prev/next | ✅ |
| Projects | positioning/overview_summary/overview_contribution/challenge/solution/architecture/outcome_statement | `toProjectDetail` | `ProjectDetail` | `/projects/[slug]` | ✅ |
| Projects | media_path | — (no mapping) | — | none | ❌ (no dedicated public single-image slot; the gallery is the real image surface) |
| Projects gallery (`project_media`) | storage_path/alt_text/sort_order | `getProjectGalleryImages` | `ProjectGalleryImage` | `/projects/[slug]` gallery panels | ✅ |
| Team | name/role/discipline/short_bio/initials | `toTeamMember` | `TeamMember` | `/team`, Home Team | ✅ |
| Team | image_path | `toTeamMember` (`getPublicMediaUrl`) | `TeamMember.image` | `/team` (`TeamSequence`/`TeamFocus`), **Home Team (fixed this module)** | ✅ (now, both surfaces) |
| Team | social_links | `normalizeSocialLinks` | `TeamMember.socialLinks` | not currently rendered by any active component (confirmed: no `.socialLinks` read in `TeamSequence.tsx`/`TeamFocus.tsx`/`TeamJourney.tsx`) | ❌ — pre-existing, not introduced by this module; flagged in §J, not fixed here since no component in scope reads it and adding a new UI element for it isn't this module's mandate |
| Team | sort_order/status | repository `order by`/RLS | — | ordering + draft/archive exclusion | ✅ |
| Insights | slug/title/category/excerpt/content/reading_time | `toInsight` | `Insight` | `/insights`, `/insights/[slug]` | ✅ |
| Insights | published_at | `toInsight` (→ `date`, with `created_at` fallback) | `Insight.date` | `/insights`, `/insights/[slug]` | ✅ |
| Insights | media_path | — (no mapping) | — | none | ❌ (Case B — `Insight` type has no image field, confirmed) |

One genuine (pre-existing, not newly introduced) gap surfaced by this audit: **`team_members.social_links` is fully wired through the adapter but no active component renders it.** This is a real "field silently unused past the adapter," matching the pattern spec §35 asked to search for — flagged here rather than fixed, since building a new UI element for it would exceed this module's "fix data flow, don't redesign" mandate. See §J.

## E. Media completeness

| Content type | Upload | Storage → DB → Adapter | Public render |
|---|---|---|---|
| Team portrait | ✅ | ✅ | ✅ `/team` (unchanged) **and Home Team (fixed this module)** |
| Services media_path | ✅ | ✅ (stored, not read by any adapter mapping) | ❌ — no consumer (Case B) |
| Projects media_path (single) | ✅ | ✅ (stored, not read by any adapter mapping) | ❌ — no consumer; gallery is the real Project image surface |
| Projects gallery | ✅ | ✅ | ✅ `/projects/[slug]` |
| Insights media_path | ✅ | ✅ (stored, not read by any adapter mapping) | ❌ — no consumer (Case B) |

No media pipeline change was made — every upload/storage/adapter link already worked correctly for every field that has a real consumer; the only broken link was the Home Team component's own render logic (§B).

## F. Delete functionality

Implemented for all four content types, following the exact layering the rest of the CMS already uses:

```
Admin UI (new Delete*Button, click-to-arm/click-to-confirm)
  ↓
Server Action (delete*Action in actions.ts)
  ↓
Service layer (delete*ForAdmin in *ContentService.ts) — requireAdmin(), reads the row first for its media path(s)
  ↓
Repository (delete* in repositories/*.ts) — the actual Supabase delete
  ↓
Best-effort Storage cleanup (mediaService.deleteMedia) — logged, never rolls back the DB delete
```

- **Delete Service** — `deleteServiceForAdmin` reads `media_path`, deletes the row, best-effort removes the Storage object (bucket `general`).
- **Delete Team member** — `deleteTeamMemberForAdmin` reads `image_path`, deletes the row, best-effort removes the Storage object (bucket `team`).
- **Delete Insight** — `deleteInsightForAdmin` reads `media_path`, deletes the row, best-effort removes the Storage object (bucket `insights`). After deletion, `/insights/[slug]` resolves through the existing `getPublicInsightBySlug` → `null` → `notFound()` path unchanged — no route change was needed for this.
- **Delete Project** — the special case (spec §20): `deleteProjectForAdmin` reads the project's own `media_path` **and** its full gallery (`listAllProjectMedia`) before deleting. The `projects` row delete triggers the existing `project_media` FK's `ON DELETE CASCADE` (`0006_project_media.sql`), removing every gallery database row automatically — no manual gallery-row deletion was written. After the database delete succeeds, the function best-effort deletes the project's single-image Storage object plus every gallery image's Storage object individually; a failed cleanup for one image is logged and does not block cleanup of the others or reverse the already-successful database delete.

**Confirmation behavior**: every `Delete*Button` uses the same click-to-arm/click-to-confirm pattern already established by `ArchiveServiceButton` et al., but states plainly in the armed state — *"This will permanently delete this record"* (or a content-specific variant) — that the action is irreversible, per spec §19. A successful delete navigates back to the admin list (`router.push`), since the detail page it was on no longer has a record to show.

**Failure handling**: `requireAdmin()` failure, a missing/invalid id (repository delete simply affects zero rows — Supabase doesn't error on a no-op delete, so this returns `{ ok: true }` rather than a confusing error; the redirect to the list page makes the outcome unambiguous either way), and a genuine database error all return a generic, safe user-facing message — never a raw Postgres/Supabase error. Storage cleanup failures are logged server-side only and never surface as a second error to the admin, matching the exact failure-mode semantics `removeProjectGalleryImage` already established in Module 9K.

**Security**: every `delete*ForAdmin` function calls `requireAdmin()` as its first action, independent of the `*_delete_admin_only` RLS policy underneath it (same defense-in-depth relationship every other CMS mutation in this codebase already has) — a non-admin calling the Server Action directly gets rejected before any database call is made.

## G. Security

- `grep -rn "SUPABASE_SERVICE_ROLE_KEY" src` / `grep -rn "supabase/admin" src` — both return only `src/lib/supabase/admin.ts` itself, unchanged by this module. No new file introduces a service-role client.
- `grep -rln "requireAdmin" src/app/(site)` — no results. No public route imports the admin-only auth check.
- Every new `delete*ForAdmin` function is gated by `requireAdmin()` on top of the pre-existing `*_delete_admin_only` RLS policies (already defined in `0005_cms_content.sql`/`0006_project_media.sql`, untouched by this module).
- No RLS policy was modified. No new table or migration was needed — every fix in this module was a query/mapping/component-logic/CRUD-completeness fix, not a schema change.

## H. Caching/freshness

Every public route (`/`, `/services`, `/projects`, `/team`, `/insights`, and their detail pages) reads through `createSupabaseServerClient()`, which calls Next's `cookies()` on every invocation — that alone opts the route out of static rendering (confirmed by the "Dynamic server usage... couldn't be rendered statically because it used cookies" build-log line already documented in the 9A/9B/9K handoffs). Consequence: every public page already re-fetches fresh CMS data on every request, with nothing cached to invalidate. This is why none of the pre-existing `create`/`update`/`archive` actions call `revalidatePath` on any public route — only on the `/admin/*` paths, which **do** benefit from it (Next does cache admin Server Component output across the same-session navigation `router.refresh()`/`router.push()` triggers).

The four new `delete*Action` wrappers follow this exact same convention: they revalidate only their own `/admin/*` list path, not any public route, for the same reason. (An earlier draft of this module added `revalidatePath("/")`/`"/team"`/`"/insights"` to the Team/Insight delete actions — removed once the reasoning above was confirmed against how every existing action already behaves, since adding them would have been redundant, not incorrect, and inconsistent with the rest of the file for no benefit — spec §27's "verify whether an explicit invalidation is actually necessary before adding one.")

## I. Verification

**Actually performed (static code audit):**
- Traced Services/Projects/Team/Insights end-to-end: DB schema (`0005_cms_content.sql`, `0006_project_media.sql`) → repository → service → public adapter → frontend type → component, for every column in every table.
- Read every admin form (`ServiceForm`, `ProjectForm`, `TeamMemberForm`, `InsightForm`) and confirmed every schema field round-trips through `toFormState`/submit `raw` object/repository `toRow` without being dropped.
- Read `TeamJourney.tsx`, `TeamSequence.tsx`, `TeamFocus.tsx` side-by-side and found the one real defect (§A.1), fixed it.
- Confirmed Home's data source (`page.tsx`) is CMS-authoritative (`getPublicTeam()`), not stale static data.
- Searched for stale/static consumers (`rg`-equivalent `grep` for `features/home/data/services|projects|team`, `features/projects/data/projectDetails`, `features/insights/data/insights`) and classified every result — one legitimate out-of-scope consumer (`/start-project`), one confirmed-orphaned dead file (`home/sections/Team.tsx`), the rest all type-only imports.
- Security grep for service-role key / admin client usage in public paths — clean.
- Confirmed no duplicate `DeleteResult` type collisions and correct `PublicMediaBucket` literal usage across all four new delete paths.

**Not performed** — same sandbox constraint as Module 9L: no live Supabase connection, no browser, so none of spec §36's Team/Services/Projects/Insights end-to-end browser tests, and none of §38's `npm run lint`/`npx tsc --noEmit`/`npm run build`, could actually be run. `npm install` still fails with the same `403 Forbidden` documented in the 9L handoff.

## J. Remaining work

- **Live/browser verification of everything in this handoff** — the single largest remaining task, blocked purely by this sandbox's lack of network access, not by any known code issue.
- **Team member description bug (§A.2)** — could not be reproduced in code. If it's still observed against the live site, it's most likely a genuinely empty `short_bio` on that specific row (the DB constraint requires 1–1000 characters, so it can't be null, but an admin could still save something that renders as visually empty, or the bug report may predate a fix already present in this codebase) rather than a data-flow defect — needs a live repro against the actual row to diagnose further.
- **`team_members.social_links` has no rendering consumer** (§D) — fully wired through the adapter, unused by every current Team component. Genuine future work if the design intends to surface it (e.g. LinkedIn icons on `TeamFocus`), not built here since it's a new UI element, not a data-flow fix.
- **Orphaned Storage cleanup for abandoned single-image uploads** — unchanged from 9K/9L's already-documented limitation.
- **`home/sections/Team.tsx`** — confirmed dead code (imports the static array, no route uses it). Left in place since removing unreferenced files wasn't this module's mandate and spec explicitly warns against deleting without proof of safety beyond a single audit pass; a future cleanup module could remove it.
