# MODULE 9E — Insights CMS — Handoff

## A. What was inspected

- `supabase/migrations/0005_cms_content.sql` — confirmed the Module 9A `insights` table (slug, title, category, excerpt, `content jsonb` storing `InsightBlock[]`, reading_time, media_path, status, timestamps) and its RLS policies (`insights_select_published`, `insights_select_admin_all`, `insights_insert_admin_only`, `insights_update_admin_only`, `insights_delete_admin_only`). No `sort_order` column exists — `insights` is ordered by `published_at`, matching how the public data file is already ordered by `date`.
- `src/lib/validation/cmsContent.ts` — `insightSchema`/`insightBlockSchema` (already defined in 9A, unmodified here). `insightBlockSchema` is a discriminated union matching the real `InsightBlock` type exactly (paragraph/heading/quote/list/code/callout) — no extra block types invented.
- `src/lib/repositories/insights.ts`, `src/lib/services/insightContentService.ts`, `src/lib/services/cmsContentTypes.ts` — both already existed from Module 9A as "foundation without a caller." Found one genuine defect (see §D).
- `src/lib/auth/session.ts` (`requireAdmin`) and the Module 9B/9C/9D admin CMS pattern (`TeamMemberForm`/`ServiceForm`/`ProjectForm`, `*Table`, `*StatusFilterTabs`, `Archive*Button`, `ContentStatusBadge`, `admin/actions.ts`, `admin/lib/services.ts`) as the pattern to mirror.
- `src/features/insights/data/insights.ts` (`Insight`/`InsightBlock` interfaces, `insightCategories` list) and the public `/insights` presentation — read only, to confirm nothing there needed changing and to source category suggestions.

No new fields were invented — every field on `InsightForm` maps to an existing `insightSchema` field, which itself maps to the real `Insight`/`InsightBlock` interfaces already used (as static data) by the public site.

## B. Routes

- `/admin/insights` — list, server-filtered by status.
- `/admin/insights/new` — create.
- `/admin/insights/[id]` — edit, publish/draft, archive.

All inherit the existing `AdminLayout`/`requireAdmin()` gate (the layout protects the whole `/admin/*` prefix, so no per-route change was needed there) — no new auth mechanism.

## C. CRUD

- **Create** — `InsightForm` (create mode) → `createInsightAction` → `createInsight` (service, `requireAdmin()` + `insightSchema.safeParse`) → `insertInsight` (repository).
- **List/Read** — `listAllInsightsForAdmin(status?)` → `listAllInsights(status?)`, filtered server-side via `.eq("status", status)` when a filter is active (newly added — see §D); `getInsightForAdmin(id)` for the edit page.
- **Update** — `InsightForm` (edit mode) → `updateInsightAction` → `updateInsightForAdmin` → `updateInsight`.
- **Publish / Draft** — same update path; `status` is just another form field. `published_at` semantics fixed — see §D.
- **Archive** — `ArchiveInsightButton` → `archiveInsightAction` → `archiveInsightForAdmin` → `archiveInsight` (sets `status = 'archived'` only — never deletes).

## D. Fields and schema-defect fix

All real `insights` fields are managed: slug, title, category, excerpt, content (identity/summary/body); reading time, media path, status (publishing/metadata). No fields were invented — no author, no cover-image-specific field beyond the existing `media_path`, no sort order (matching spec §16/§4, since the table has none).

**Schema-level defect found and fixed (minimal, per spec §4):** `updateInsight`'s previous `toRow()` derived `published_at` purely from `input.status`, which cleared the timestamp on `published → draft` and re-stamped it on every re-publish. This is the same defect Module 9D found and fixed in `team_members`. Fixed to the same corrected pattern used by `team_members`/`projects`/`services`: the first transition into `published` stamps `published_at`; returning to `draft` afterwards preserves the existing timestamp. No migration was needed — this was application-layer logic in the repository, not the database schema.

Also added (present in the sibling CMS repositories/services but missing from `insights`):
- Optional `status` filter parameter on `listAllInsights`/`listAllInsightsForAdmin`, applied server-side via `.eq("status", status)` — required for spec §7's server-side status filter tabs.
- `isUniqueViolation` duplicate-slug handling in `createInsight`/`updateInsightForAdmin`, returning a specific field error instead of the generic failure message.

## E. Content editor

`content jsonb` (`InsightBlock[]`) is managed by `InsightContentEditor`, a small structured block editor — never raw JSON exposed to the admin. Each block has a type selector (paragraph/heading/quote/list/code/callout) plus the fields that type needs, move-up/move-down/remove controls, and an "+ Add Block" control. `list.items` is edited as one-line-per-item text (mirroring the comma/line-separated array convention already used for `tags`/`capabilities` elsewhere in this CMS) rather than a nested repeatable-row editor, since a body list is usually authored as a block of lines at once. Empty/stray blocks (e.g. an added-then-abandoned block) are dropped on submit, matching the `cleanArchitecture`/`cleanSocialLinks` convention from `ProjectForm`/`TeamMemberForm`.

## F. Admin UX

- **List** — title, category, status, updated date, published date; mobile stacked cards below `md`, table at `md`+ (identical responsive treatment to Services/Projects/Team). No sort-order column, since the schema has none.
- **Filter** — `InsightStatusFilterTabs`, a plain `?status=...` link list, same as `TeamMemberStatusFilterTabs`/`ServiceStatusFilterTabs`/`ProjectStatusFilterTabs`.
- **Form** — grouped Content identity (title/slug/category/reading time) → Summary (excerpt) → Content (block editor) → Publishing (media path/status), per spec §8's required-before-optional-before-publishing structure. Built entirely from existing primitives (`Card`, `Button`, `Input`, `Textarea`, `Select`, `Field` helpers) — no new form system. Category field is a plain text `Input` with a `<datalist>` of the existing `insightCategories` values as suggestions, not a hard-coded `<select>` — the schema's `category` is a free string, matching the `iconKeyOptions` precedent from `ServiceForm`.
- **Status handling** — field-level errors from Zod, a specific duplicate-slug field error, and a generic form-level error for other failures — never raw Postgres/Supabase detail.
- **Loading/success** — `useTransition` pending state, disabled submit while pending, inline "Saved." confirmation on edit, redirect to the edit page on create (same as Team/Services/Projects).
- **Empty states** — "No insights yet." / "No insights match this status." (`InsightTable`'s `EmptyState`).
- **Responsive** — verified by code review against the same breakpoints/patterns Services/Projects/Team already use; see Verification for what couldn't be tested live.

## G. Security

- `admin/*` routes still resolve through the existing `AdminLayout` → `requireAdmin()` chain (Module 7A/8) — no new role system, no new middleware. `middleware.ts`'s `/admin` prefix match already covers `/admin/insights/*` with no changes.
- Every mutating Server Action (`createInsightAction`/`updateInsightAction`/`archiveInsightAction`) delegates to a service function that calls `requireAdmin()` itself before touching the repository — same defense-in-depth relationship the Team/Services/Projects CMS actions have with RLS.
- RLS (`insights_insert_admin_only`, `insights_update_admin_only`, `insights_select_admin_all`) remains the final database-level boundary; no client component talks to Supabase directly, and the service-role client is never used.

## H. Public frontend preservation

**Not modified in this module:** `src/features/insights/data/insights.ts`, any public `/insights` route or component, or any animation/motion (GSAP/ScrollTrigger/Lenis). These files were only read for inspection (to confirm the `InsightBlock` shape and `insightCategories` list), never edited. The public Insights pages still render entirely from the existing static `insights` array. Migrating them to Supabase is explicit future work (spec §30).

## I. Verification

**Not run in this environment:** this sandbox has no network egress (`bash_tool` network is disabled), so `npm install` failed (`403 Forbidden` fetching packages) and there is no `node_modules` — meaning `npm run lint`, `npx tsc --noEmit`, and `npm run build` could not be executed at all, not even with pre-existing failures to compare against.

**What I did instead:** a manual, careful code review against the existing 9B/9C/9D pattern and the real schema/types:
- Cross-checked every field in `InsightForm`/`InsightContentEditor` against `insightSchema`/`insightBlockSchema` and the `insights` `Row`/`Insert`/`Update` types in `database.types.ts`.
- Verified import paths and export names against the actual files (`InsightRow`, `Json`, `ContentStatus`, `contentStatusValues`, `slugify`, etc.).
- Verified the Server Action → service → repository → Supabase chain matches the Team/Services/Projects shape exactly, including the `requireAdmin()` defense-in-depth placement.
- Verified `/admin` prefix-based route protection in `middleware.ts` and `src/app/admin/layout.tsx` requires no changes to cover the new routes.

**Not run / not available in this environment:**
- Real database create/edit/publish/draft/archive round-trips for an insight.
- Duplicate-slug rejection against a live `insights_slug_key` constraint.
- Anonymous/authenticated-non-admin/admin access checks against real sessions.
- Responsive UX and keyboard/focus behavior at the listed breakpoints in an actual browser.
- Public `/insights` visual regression check (static inspection only — confirmed via file review that `src/features/insights/data/insights.ts` and the public insights routes/components are untouched).

No test insight rows were created — there is no live Supabase database in this environment, so nothing needed cleanup.

**This is a real limitation, not a formality:** the code has not been compiled or type-checked by a tool in this session. I am not claiming `npm run lint`/`tsc`/`build` passed — they were never run. Please run them (and the live-database checks above) in an environment with registry access before considering this module verified.

## J. Remaining work

- Public Insights (`/insights`) migration to Supabase — separate later module.
- Media management (actual cover-image uploads to the `media_path`-backed bucket).
- Running the verification commands and live-database/browser checks listed in §I, which this environment could not perform.

---

**STOP.** Module 9F is not started.
