# MODULE 9C — Projects / Case Studies CMS — Handoff

## A. What was inspected

Before writing any code:

- `supabase/migrations/0005_cms_content.sql` — confirmed the Module 9A `projects` table (slug, title, category, description, technologies, outcome, `accent int`, positioning, overview_summary/contribution, challenge, solution, `architecture jsonb`, outcome_statement, media_path, sort_order, status, timestamps) and its RLS policies (`projects_select_published`, `projects_select_admin_all`, `projects_insert_admin_only`, `projects_update_admin_only`, `projects_delete_admin_only`).
- `src/lib/validation/cmsContent.ts` — `projectSchema`/`projectArchitectureGroupSchema` (already defined in 9A, unmodified here).
- `src/lib/repositories/projects.ts`, `src/lib/services/projectContentService.ts`, `src/lib/services/cmsContentTypes.ts`.
- `src/lib/auth/session.ts` (`requireAdmin`) and `src/app/admin/*`, `src/features/admin/*` — specifically the Module 9B Services CMS (`ServiceForm`, `ServiceTable`, `ServiceStatusFilterTabs`, `ArchiveServiceButton`, `ContentStatusBadge`, `admin/actions.ts`, `admin/lib/services.ts`) as the pattern to mirror.
- `src/features/home/data/projects.ts` (`ProjectItem` — confirmed `accent` is a numeric gradient hue, 0–360, not a color/string) and `src/features/projects/data/projectDetails.ts` (`ProjectDetail`/`ArchitectureGroup` — confirmed the `{ label, items }` shape the `architecture jsonb` column mirrors).

## B. Routes

- `/admin/projects` — list, server-filtered by status.
- `/admin/projects/new` — create.
- `/admin/projects/[id]` — edit, publish/draft, archive.

All inherit the existing `AdminLayout`/`requireAdmin()` gate; no new auth mechanism.

## C. CRUD

- **Create** — `ProjectForm` (create mode) → `createProjectAction` → `createProject` (service, `requireAdmin()` + `projectSchema.safeParse`) → `insertProject` (repository).
- **List/Read** — `listAllProjectsForAdmin(status?)` → `listAllProjects(status?)`, filtered server-side via `.eq("status", status)` when a filter is active; `getProjectForAdmin(id)` for the edit page.
- **Update** — `ProjectForm` (edit mode) → `updateProjectAction` → `updateProjectForAdmin` → `updateProject`.
- **Publish / Draft** — same update path; `status` is just another form field. `published_at` semantics below.
- **Archive** — `ArchiveProjectButton` → `archiveProjectAction` → `archiveProjectForAdmin` → `archiveProject` (sets `status = 'archived'` only — never deletes).

## D. Fields

All Module 9A `projects` fields are managed: title, slug, category, description, positioning, technologies, outcome (core); overview summary/contribution, challenge, solution, architecture, outcome statement (case-study content); accent, media path, sort order, status (presentation). Optional fields are left empty rather than filled with placeholder text — `toRow()` maps `"" → null` for every nullable column.

`technologies` is a comma-separated text input, split/joined at the form boundary (`splitList`/`.join(", ")`) — no new technologies table.

## E. Architecture editor

`ProjectArchitectureEditor` (`src/features/admin/components/ProjectArchitectureEditor.tsx`) manages `architecture jsonb` as a repeatable group/items UI, matching the spec's mock exactly:

```
Architecture Group
  Label: [________]
  Items: [________] Remove
         [________] Remove
         + Add Item
+ Add Architecture Group
```

No raw JSON is ever shown to the admin. On submit, `cleanArchitecture()` drops empty item rows and groups with no label or no items before validation, so an idle "+ Add Item" click can't produce a spurious validation error.

## F. Security

- `admin/*` routes still resolve through the existing `AdminLayout` → `requireAdmin()` chain (Module 7A/8) — no new role system, no new middleware.
- Every mutating Server Action (`createProjectAction`/`updateProjectAction`/`archiveProjectAction`) delegates to a service function that calls `requireAdmin()` itself before touching the repository — same defense-in-depth relationship the Services CMS actions have with RLS.
- RLS (`projects_insert_admin_only`, `projects_update_admin_only`, `projects_select_admin_all`) remains the final database-level boundary; no client component talks to Supabase directly, and the service-role client is never used.
- Duplicate slug on create/update now surfaces a specific field error (`isUniqueViolation` from `cmsContentTypes.ts`, matching the Services CMS pattern) instead of the generic failure message.

## G. Public frontend preservation

**Not modified in this module:** `src/features/home/data/projects.ts`, `src/features/projects/data/projectDetails.ts`, `/projects`, `/projects/[slug]`, GSAP/ScrollTrigger cinematic transitions, or any project imagery presentation. The public Projects pages still render entirely from the existing static data files. Migrating them to Supabase is explicit future work (spec §22/§28).

## H. Verification

Actually run in this environment:

```
npm install          → 441 packages installed, no errors
npx tsc --noEmit      → 1 pre-existing error, unrelated to this module:
                        src/app/layout.tsx(23,50): Cannot find name 'LayoutProps'
                        (this is Next's generated route-type helper, only
                        present after `next build`/`next dev` runs — not
                        introduced or touched by Module 9C)
npm run build         → succeeded (Next.js 16.3.1, Turbopack). All three new
                        routes compiled and appear in the route manifest:
                          ƒ /admin/projects
                          ƒ /admin/projects/[id]
                          ƒ /admin/projects/new
                        TypeScript check inside the build passed with 0 errors.
npx eslint <changed/new files>  → 0 errors, 0 warnings
```

**Not run in this environment** (no live Supabase project / browser available):

- Real database create/edit/publish/draft/archive round-trips.
- Duplicate-slug rejection against a live `projects_slug_key` constraint.
- Anonymous/authenticated-non-admin/admin access checks against real sessions.
- Responsive UX at the listed breakpoints in an actual browser.
- Public `/projects` and `/projects/[slug]` visual regression check (static inspection only — confirmed via `git`/`diff` that the files are untouched).

No test project rows were created (no live database in this environment), so there is nothing to clean up.

## I. Remaining work

- Public Projects (`/projects`, `/projects/[slug]`) migration to Supabase — separate later module.
- Media management (actual file uploads to the `media_path`-backed bucket).
- Drag-and-drop / bulk sort-order UX.
- Team CMS and Insights CMS admin UIs (schemas already exist from Module 9A).

---

**STOP.** Module 9D is not started.
