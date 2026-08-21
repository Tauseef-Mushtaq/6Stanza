# MODULE 9D — Team CMS — Handoff

## A. What was inspected

- `supabase/migrations/0005_cms_content.sql` — confirmed the Module 9A `team_members` table (slug, name, role, discipline, short_bio, initials, image_path, `social_links jsonb`, sort_order, status, timestamps) and its RLS policies (`team_members_select_published`, `team_members_select_admin_all`, `team_members_insert_admin_only`, `team_members_update_admin_only`, `team_members_delete_admin_only`).
- `src/lib/validation/cmsContent.ts` — `teamMemberSchema`/`teamMemberSocialLinkSchema` (already defined in 9A, unmodified here).
- `src/lib/repositories/teamMembers.ts`, `src/lib/services/teamContentService.ts`, `src/lib/services/cmsContentTypes.ts`.
- `src/lib/auth/session.ts` (`requireAdmin`) and the Module 9B/9C admin CMS pattern (`ServiceForm`/`ProjectForm`, `*Table`, `*StatusFilterTabs`, `Archive*Button`, `ContentStatusBadge`, `admin/actions.ts`, `admin/lib/services.ts`) as the pattern to mirror.
- `src/features/home/data/team.ts` (`TeamMember` interface — confirmed it matches `teamMemberSchema` field-for-field: slug, name, role, discipline, shortBio, initials, optional `image`, optional `socialLinks: { label, href }[]`) and `src/features/team/sections/*` (public `/team` page presentation — read only, to confirm nothing there needed changing).

No new fields were invented — every field on `TeamMemberForm` maps to an existing `teamMemberSchema` field, which itself maps to the real `TeamMember` interface already used by the public site.

## B. Routes

- `/admin/team` — list, server-filtered by status.
- `/admin/team/new` — create.
- `/admin/team/[id]` — edit, publish/draft, archive.

All inherit the existing `AdminLayout`/`requireAdmin()` gate; no new auth mechanism.

## C. CRUD

- **Create** — `TeamMemberForm` (create mode) → `createTeamMemberAction` → `createTeamMember` (service, `requireAdmin()` + `teamMemberSchema.safeParse`) → `insertTeamMember` (repository).
- **List/Read** — `listAllTeamMembersForAdmin(status?)` → `listAllTeamMembers(status?)`, filtered server-side via `.eq("status", status)` when a filter is active; `getTeamMemberForAdmin(id)` for the edit page.
- **Update** — `TeamMemberForm` (edit mode) → `updateTeamMemberAction` → `updateTeamMemberForAdmin` → `updateTeamMember`.
- **Publish / Draft** — same update path; `status` is just another form field. `published_at` semantics below.
- **Archive** — `ArchiveTeamMemberButton` → `archiveTeamMemberAction` → `archiveTeamMemberForAdmin` → `archiveTeamMember` (sets `status = 'archived'` only — never deletes).

## D. Fields

All Module 9A `team_members` fields are managed: slug, name, role, discipline, short bio, initials (identity/profile); image path, social links (profile/links); sort order, status (presentation/publishing). No fields were invented — no Team accounts, permissions, or employee data were added, matching spec §28.

Optional fields (`image_path`, `social_links`) are left empty/`[]` rather than filled with placeholder text — `toRow()` maps `"" → null` for nullable columns, same as Services/Projects.

`social_links` (`{ label, href }[]`) is managed by `TeamSocialLinksEditor`, a flat repeatable label/URL list — no raw JSON exposed to the admin, same rationale as `ProjectArchitectureEditor` from Module 9C but without nested groups since the shape doesn't need them.

## E. Admin UX

- **List** — name, role, status, sort order, updated date, published date; mobile stacked cards below `md`, table at `md`+ (identical responsive treatment to Services/Projects).
- **Filter** — `TeamMemberStatusFilterTabs`, a plain `?status=...` link list, same as `ServiceStatusFilterTabs`/`ProjectStatusFilterTabs`.
- **Form** — grouped Identity (name/slug/role/discipline) → Profile (bio/initials/image path/social links) → Presentation & publishing (sort order/status), per spec §8's required-before-optional-before-publishing structure. Built entirely from existing primitives (`Card`, `Button`, `Input`, `Textarea`, `Select`, `Field` helpers) — no new form system.
- **Status handling** — field-level errors from Zod, a specific duplicate-slug field error, and a generic form-level error for other failures — never raw Postgres/Supabase detail.
- **Loading/success** — `useTransition` pending state, disabled submit while pending, inline "Saved." confirmation on edit, redirect to the edit page on create (same as Services/Projects).
- **Empty states** — "No team members yet." / "No team members match this status." (`TeamMemberTable`'s `EmptyState`).
- **Responsive** — verified by code review against the same breakpoints/patterns Services and Projects already use; see Verification for what couldn't be tested live.

## F. Security

- `admin/*` routes still resolve through the existing `AdminLayout` → `requireAdmin()` chain (Module 7A/8) — no new role system, no new middleware.
- Every mutating Server Action (`createTeamMemberAction`/`updateTeamMemberAction`/`archiveTeamMemberAction`) delegates to a service function that calls `requireAdmin()` itself before touching the repository — same defense-in-depth relationship the Services/Projects CMS actions have with RLS.
- RLS (`team_members_insert_admin_only`, `team_members_update_admin_only`, `team_members_select_admin_all`) remains the final database-level boundary; no client component talks to Supabase directly, and the service-role client is never used.
- Duplicate slug on create/update now surfaces a specific field error (`isUniqueViolation` from `cmsContentTypes.ts`) instead of the generic failure message — this was present in the Services service but missing from the Team service before this module.

## G. Public frontend preservation

**Not modified in this module:** `src/features/home/data/team.ts`, `src/features/team/sections/*`, the public `/team` route, or any animation/motion (GSAP/ScrollTrigger/Lenis). These files were only read for inspection, never edited. The public Team page still renders entirely from the existing static `team` array. Migrating it to Supabase is explicit future work (spec §25).

## H. Verification

Actually run in this environment:

```
npx eslint <changed/new files>   → 0 errors, 0 warnings
npm run build                     → succeeded (Next.js 16.3.1, Turbopack).
                                     All three new routes compiled and appear
                                     in the route manifest:
                                       ƒ /admin/team
                                       ƒ /admin/team/[id]
                                       ƒ /admin/team/new
                                     TypeScript check inside the build
                                     passed with 0 errors.
```

`npx tsc --noEmit` was not re-run standalone for this module — the pre-existing, unrelated failure documented in the Module 9C handoff (`src/app/layout.tsx(23,50): Cannot find name 'LayoutProps'`, only present before `next build` generates Next's route-type helpers) still applies and is not something this module touches; `npm run build`'s in-process TypeScript check is the authoritative signal here and passed clean.

**Not run in this environment** (no live Supabase project / browser available):

- Real database create/edit/publish/draft/archive round-trips for a team member.
- Duplicate-slug rejection against a live `team_members_slug_key` constraint.
- Anonymous/authenticated-non-admin/admin access checks against real sessions.
- Responsive UX and keyboard/focus behavior at the listed breakpoints in an actual browser.
- Public `/team` visual regression check (static inspection only — confirmed via file review that `src/features/home/data/team.ts` and `src/features/team/sections/*` are untouched).

No test team member rows were created — there is no live Supabase database in this environment, so nothing needed cleanup.

## I. Remaining work

- Public Team (`/team`) migration to Supabase — separate later module.
- Media management (actual portrait uploads to the `image_path`-backed bucket).
- Drag-and-drop / bulk sort-order UX.
- Insights CMS admin UI (schema already exists from Module 9A; not started here).

---

**STOP.** Module 9E is not started.
