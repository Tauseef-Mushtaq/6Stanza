# MODULE 9A — CMS DATABASE & CONTENT FOUNDATION — HANDOFF

## A. What was inspected

Before designing any table, the actual frontend content sources were read directly:

- `src/features/home/data/services.ts` (`ServiceItem`) — the canonical service list.
- `src/features/services/data/serviceDetails.ts` (`ServiceDetail`) — per-service case-study-style detail content, keyed to the same `slug`.
- `src/features/home/data/projects.ts` (`ProjectItem`) — the canonical project/case-study list.
- `src/features/projects/data/projectDetails.ts` (`ProjectDetail`) — per-project narrative content, keyed to the same `slug`.
- `src/features/home/data/team.ts` (`TeamMember`) — team roster, which already has its own `slug`.
- `src/features/insights/data/insights.ts` (`Insight` / `InsightBlock`) — the Insights/blog content and its block-based body.
- `src/features/home/data/sixS.ts` (`SixSPrinciple`) — the Six S philosophy list.
- `supabase/migrations/0001_profiles.sql` and `0004_storage_buckets.sql` — the existing `public.is_admin()` helper and the `team`/`projects`/`insights`/`general` Storage buckets already provisioned for future media.
- `src/lib/repositories/contactInquiries.ts`, `src/lib/services/contactInquiryService.ts`, `src/lib/validation/contactInquiry.ts`, `src/lib/auth/session.ts` — for the existing repository/service/validation/RLS conventions this module follows.

No schema field was invented without a corresponding real field in one of the files above (or an explicit, already-provisioned dependency like the Storage buckets).

## B. CMS entities

- **services** — one table, not two. `services.ts` and `serviceDetails.ts` are two files today, but every `serviceDetails` row has exactly one corresponding `services.ts` row keyed by the same `slug`, and the detail page always needs both together. Splitting them into two tables would just reintroduce the same slug-based join the frontend already does across two files.
- **projects** — same reasoning: `projects.ts` (list/index shape) and `projectDetails.ts` (case-study narrative) are merged into one `projects` table.
- **team_members** — matches `team.ts` directly. `TeamMember` already declares its own `slug`, used by the dedicated `/team` page's individual-focus chapter, so `team_members` has a real, constrained `slug` like the other route-addressable entities (spec §6 — inspected before assuming team didn't need one).
- **insights** — matches `insights.ts` directly, including the `InsightBlock` union stored as `jsonb`.
- **Six S — deliberately NOT a table.** `sixS.ts` is a small, fixed, six-item list that's tightly coupled to the site's brand/operating philosophy (`SixSJourney.tsx`, `ServiceWhy6Stanza.tsx`, and `serviceDetails.ts`'s `principles` field all reference it by array index, not by any CMS-style identifier). Nothing about the current implementation suggests independent CMS management is needed yet, so per spec §3 it stays static. `services.principles` (an `smallint[]`) references Six S by index, matching how `ServiceDetail.principles` already does.

## C. Database

Migration: `supabase/migrations/0005_cms_content.sql`.

**Enum:** `public.content_status` — `'draft' | 'published' | 'archived'`. Shared by all four tables; no extra workflow states, per spec §4.

**Tables** (all with `id uuid primary key default gen_random_uuid()`, `created_at`/`updated_at timestamptz not null default now()` + `set_updated_at()` trigger reused from Module 5, and `published_at timestamptz`):

- `services`: `slug` (unique, format-checked), `name`, `category`, `short_description`, `tags text[]`, `icon_key` (matches `ServiceItem.visual`), `problem`, `capabilities text[]`, `architecture text[]`, `principles smallint[]` (Six S indices), `media_path`, `sort_order integer`, `status`.
- `projects`: `slug` (unique, format-checked), `title`, `category`, `description`, `technologies text[]`, `outcome`, `accent integer` (the existing placeholder-gradient hue), `positioning`, `overview_summary`, `overview_contribution`, `challenge`, `solution`, `architecture jsonb` (array of `{ label, items }`, matching `ArchitectureGroup[]` — kept as jsonb, not a join table, since it's always read/written as one unit with the project, per spec §14), `outcome_statement`, `media_path`, `sort_order integer`, `status`.
- `team_members`: `slug` (unique, format-checked), `name`, `role`, `discipline`, `short_bio`, `initials`, `image_path`, `social_links jsonb` (`{ label, href }[]`), `sort_order integer`, `status`.
- `insights`: `slug` (unique, format-checked), `title`, `category`, `excerpt`, `content jsonb` (the `InsightBlock[]` union, stored verbatim), `reading_time`, `media_path`, `status`. No `sort_order` — insights are ordered by `published_at`, matching how `insights.ts` is already ordered by `date`. No `author`/`cover_image` columns — the current `Insight` interface has neither, so none were invented (spec §13/§16); `media_path` is included only because the `insights` Storage bucket was already provisioned in Module 5 specifically for this table's future cover imagery.

**Relationships:** none created as join tables. `project.architecture` and `team_members.social_links` are small, always-together structures stored as `jsonb` rather than normalized — per spec §14, join tables are only justified by a real many-to-many/stable relationship, and none of the inspected frontend data has one (e.g., there's no independent "technologies" or "authors" entity anywhere in the current code).

**Constraints:** every table has a `_slug_format` check (`^[a-z0-9]+(-[a-z0-9]+)*$`) and a unique constraint on `slug`, enforced at the database level, not just in application validation (spec §6).

**Indexes:** `(status, sort_order)` on `services`/`projects`/`team_members` (list views filter by status and order by sort_order together); `(status, published_at)` on `services`/`projects`; `(status, published_at desc)` on `insights` (its primary ordering). Chosen to match the actual read patterns the public/admin read functions use — not applied blindly to every column (spec §26).

## D. RLS

Every table has RLS enabled with the same five-policy shape, reusing `public.is_admin()` from Module 5 (no second role system, no client-trusted role):

- `<table>_select_published` — `anon, authenticated` — `using (status = 'published')`.
- `<table>_select_admin_all` — `authenticated` — `using (public.is_admin())`.
- `<table>_insert_admin_only` — `authenticated` — `with check (public.is_admin())`.
- `<table>_update_admin_only` — `authenticated` — `using (public.is_admin()) with check (public.is_admin())`.
- `<table>_delete_admin_only` — `authenticated` — `using (public.is_admin())`.

Net effect: anonymous and authenticated non-admin users can only ever see `status = 'published'` rows — drafts and archived content are invisible to them at the database level, independent of anything the application code does. Admins can read every status and are the only role that can insert/update/delete. This matches spec §7/§8 exactly (no table is broadly publicly readable, no draft content leaks through public queries).

Deletion uses `status = 'archived'` as the default lifecycle end-state (spec §9) — a real `delete` policy exists as a safety valve for a later module, but nothing in this module's repositories/services calls it; `archive*()` functions set `status = 'archived'` instead.

## E. Data layer

```
public/admin consumer (none yet — Module 9B+)
        ↓
src/lib/services/{serviceContentService,projectContentService,teamContentService,insightContentService}.ts
        ↓  (validation via src/lib/validation/cmsContent.ts, requireAdmin() for admin paths)
src/lib/repositories/{services,projects,teamMembers,insights}.ts
        ↓  (createSupabaseServerClient() — RLS enforces status visibility)
Supabase / PostgreSQL
```

- **Repositories** (`src/lib/repositories/*.ts`): own table names, columns, and queries only — no validation, no UI logic. Each exposes `listPublished*`/`get*BySlug` (public reads) and `listAll*`/`get*ById`/`insert*`/`update*`/`archive*` (admin reads/writes), mirroring `contactInquiries.ts`'s existing shape.
- **Validation** (`src/lib/validation/cmsContent.ts`): one shared file with a Zod schema per entity (`serviceSchema`, `projectSchema`, `teamMemberSchema`, `insightSchema`), plus shared building blocks (`slugSchema`, `contentStatusSchema`, `sortOrderSchema`, `mediaPathSchema`). Validates required fields, lengths, slug format, allowed status values, numeric sort order, and the `InsightBlock` discriminated union — mirroring the database constraints without duplicating the database as the source of truth for uniqueness (spec §22).
- **Services** (`src/lib/services/*ContentService.ts`): public functions (`getPublished*`) call the repository directly and return `{ ok, data }` / `{ ok, message }`. Admin functions (`list*ForAdmin`, `get*ForAdmin`, `create*`, `update*ForAdmin`, `archive*ForAdmin`) call `requireAdmin()` first — RLS is the real enforcement, `requireAdmin()` is defense-in-depth on top of it, exactly like the existing admin inquiry services. A shared `src/lib/services/cmsContentTypes.ts` defines the four result-shape generics once instead of redefining them per entity.

## F. Storage

No media-management UI was built (out of scope, spec §17/§29). Each table that plausibly needs imagery has a nullable, storage-relative path column instead of raw URLs or credentials:

- `services.media_path`, `projects.media_path`, `insights.media_path`
- `team_members.image_path` (matches `TeamMember.image`, which already exists in the frontend type)

These are meant to hold a path within the `team`/`projects`/`insights`/`general` buckets Module 5 already created (`0004_storage_buckets.sql`), not a full URL — `mediaPathSchema` in `cmsContent.ts` rejects values that look like a full `http(s)://` URL to keep that distinction enforced at validation time too.

## G. Frontend preservation

**No public page was migrated to database-backed content in this module.** `src/features/home/data/*.ts`, `src/features/services/data/serviceDetails.ts`, `src/features/projects/data/projectDetails.ts`, and `src/features/insights/data/insights.ts` are all unchanged. No component under `src/features/*` or `src/app/(site)/*` was modified. The site continues to render exactly as it did before this module, from the same static data files. The CMS tables/repositories/services created here have no caller yet — that migration is explicitly deferred to later modules, one content category at a time, per spec §28.

## H. Verification

Commands actually run in this environment:

- `npm install` — succeeded (441 packages).
- `npx eslint` (project-wide, no path filter) — **passed, zero errors/warnings.**
- `npx tsc --noEmit` — **two pre-existing errors, both unrelated to this module and present before any Module 9A file was touched:**
  - `src/app/(site)/signup/page.tsx(2,28)`: imports `@/features/auth/sections/SignUpForm`, but the actual file on disk is `SignupForm.tsx` (case mismatch) — a pre-existing bug in the auth feature from an earlier module.
  - `src/app/layout.tsx(23,50)`: references an undefined `LayoutProps` name — also pre-existing, unrelated to CMS content.
  - Every new/changed Module 9A file (`database.types.ts`, `validation/cmsContent.ts`, `repositories/{services,projects,teamMembers,insights}.ts`, `services/{cmsContentTypes,serviceContentService,projectContentService,teamContentService,insightContentService}.ts`) produced **zero** typecheck errors when filtered out from the above.
- `npm run build` — **failed**, but only on the same pre-existing `signup/page.tsx` module-not-found error above; the build never reached a point where any Module 9A file could fail. This is an existing defect in the repo, not something introduced here.

**Not run — no live Supabase project is connected in this sandbox** (same limitation `database.types.ts`'s own header already documents): migrations were not applied against a real Postgres instance, so the following were verified by static review of the SQL only, not by executing it:
- Migration apply/rollback.
- RLS behavior for anon/authenticated/admin sessions.
- Duplicate-slug rejection.
- Invalid-status rejection.
- Public read functions returning only published rows.
- Admin functions reading/managing all statuses.

What was checked statically instead: the migration file parses into exactly the intended 4 tables, 20 RLS policies (5 per table), 6 indexes, and 4 `updated_at` triggers (confirmed via a structural regex pass over the SQL); every `_select_published` policy's `using` clause is `status = 'published'`; every insert/update/delete policy requires `public.is_admin()`; every table has a `unique` + regex `check` constraint on `slug`.

## I. Next modules

This foundation is ready for Module 9B+ to consume without any schema changes:

- **9B–9E (per-entity CRUD UI)**: each can build `/admin/services`, `/admin/projects`, `/admin/team`, `/admin/insights` directly on top of the existing `list*ForAdmin`/`get*ForAdmin`/`create*`/`update*ForAdmin`/`archive*ForAdmin` functions in the four `*ContentService.ts` files — no new repository or validation work needed for basic CRUD, only Server Actions/forms calling what's already here.
- **9F (public frontend migration)**: whichever module migrates the public Services/Projects/Team/Insights pages from the static data files to the database can call `getPublishedServices()`/`getPublishedProjects()`/`getPublishedTeamMembers()`/`getPublishedInsights()` (and their `getPublished*(slug)` counterparts) directly — these already return only published rows and already have the right shape to replace the static array imports one content category at a time, per spec §28's migration strategy.
- **Media management**: once an upload UI exists, it only needs to write a bucket-relative path into the existing `media_path`/`image_path` columns — the buckets, RLS, and column shape are already in place.
- **Ordering UI**: `sort_order` already exists on `services`/`projects`/`team_members` and is already indexed with `status`; a future drag-and-drop admin UI only needs to persist new integer values, no schema change.
