# MODULE 9B — SERVICES CMS — HANDOFF

## A. What was inspected

Before writing any code:

- `supabase/migrations/0005_cms_content.sql` — the actual `services` table columns, constraints, and RLS policies.
- `src/lib/validation/cmsContent.ts` — the existing `serviceSchema` (camelCase field names, array shapes, Six S range 1–6).
- `src/lib/repositories/services.ts` and `src/lib/services/serviceContentService.ts` — the existing data-access and service-layer functions this module builds on.
- `src/lib/services/cmsContentTypes.ts` — the shared `Admin*Result` types.
- `src/lib/auth/session.ts` — `requireAdmin()`.
- `src/app/admin/*` and `src/features/admin/*` — the existing admin shell (`AdminLayout`, `AdminNav`), the inquiries list/detail pages, `InquiryFilterTabs`, `InquiryTable`, `StatusBadge`, `StatusSelect`, and `features/admin/actions.ts`, all used as the direct template for the new Services CMS UI so it looks and behaves like the rest of the admin system rather than introducing new patterns.
- `src/features/home/data/services.ts` and `src/features/services/data/serviceDetails.ts` — reconfirmed as the still-untouched source of truth for the public site, and as the reference for what `icon_key`/`principles` values are actually meaningful.
- `src/components/ui/form/Field.tsx`, `Button.tsx`, `Card.tsx`, `Badge.tsx` — the existing form/design primitives reused throughout, and `src/features/start-project/sections/ProjectForm.tsx` as the existing precedent for a controlled-state form with array-like fields.

## B. Routes

- `/admin/services` — `src/app/admin/services/page.tsx` — list + status filter + "Create Service".
- `/admin/services/new` — `src/app/admin/services/new/page.tsx` — create form.
- `/admin/services/[id]` — `src/app/admin/services/[id]/page.tsx` — edit form + archive control.

All three inherit authorization from the existing `src/app/admin/layout.tsx` (redirects anonymous visitors to `/login`, non-admins to `/`) — no new authentication mechanism was created, per spec §4/§22.

## C. CRUD

- **Create** — `ServiceForm` (no `service` prop) → `createServiceAction` (`features/admin/actions.ts`) → `createService` (`lib/services/serviceContentService.ts`, `requireAdmin()` + `serviceSchema.safeParse`) → `insertService` (`lib/repositories/services.ts`) → Supabase, gated by the `services_insert_admin_only` RLS policy. On success, redirects to `/admin/services/[new id]`.
- **Read/list** — `AdminServicesPage` → `listAllServicesForAdmin(status?)` → `listAllServices(status?)`, filtered at the database level by the optional `?status=` query param (spec §6), not fetched-then-filtered in the browser.
- **Read/single** — `EditServicePage` → `getServiceForAdmin(id)` → `getServiceById`.
- **Update** — `ServiceForm` (with `service` prop) → `updateServiceAction` → `updateServiceForAdmin` → `updateService`. Stays on the page after a successful save, refreshes the form state from the returned row, and shows a "Saved." confirmation (spec §12/§16) rather than navigating away.
- **Publish / return to draft** — the same update path, driven by the `status` `<select>` in the form. `updateService` (repository) now reads the row's *current* `published_at` before writing: the first `draft → published` transition stamps `published_at = now()`; every subsequent status change (including `published → draft`) preserves that existing timestamp rather than clearing it (spec §11 — "preserve the existing publication timestamp unless the current architecture clearly requires clearing it," which it doesn't here).
- **Archive** — `ArchiveServiceButton` (click-to-arm, click-again-to-confirm) → `archiveServiceAction` → `archiveServiceForAdmin` → `archiveService`, which only ever sets `status = 'archived'` — never a hard delete (spec §9/§13). Rendered both in the services list (per-row) and on the edit page header; hidden once a service is already archived.

## D. Fields

The form manages every column Module 9A actually created, using the field names `serviceSchema` already expects:

| Field | Control | Notes |
|---|---|---|
| `name` | text input | required; drives slug auto-generation until the slug is hand-edited |
| `slug` | text input | required, unique, lowercase/hyphen format enforced by `slugSchema` + the DB constraint; auto-filled from `name` via a small local `slugify()` (not a separate library, spec §10) but always editable |
| `category` | text input | required |
| `iconKey` | `<select>` | fixed options matching `ServiceItem["visual"]` (web/cloud/devops/security/network/marketing/video/seo) — spec §9's "controlled selection" principle applied here too, since these are the only values `ServiceVisual` actually renders |
| `shortDescription` | textarea | required |
| `tags` | comma-separated text input | split/joined via `splitList()`/`.join(", ")` — spec §8's "simplest approach," no drag/drop |
| `problem`, `capabilities`, `architecture` | textarea / comma-separated inputs | optional; map to the `serviceDetails.ts`-derived columns |
| `principles` | checkbox group, 6 fixed options | labelled "1 — Strategy" … "6 — Speed" from the static `sixS` list (`features/admin/lib/services.ts`'s `sixSOptions`); the admin can only ever select real Six S indices, never type an arbitrary number (spec §9) |
| `mediaPath` | text input | optional; validated with the existing `mediaPathSchema` (rejects full URLs, expects a storage-relative path) |
| `sortOrder` | number input | required, non-negative integer |
| `status` | `<select>` | `draft` / `published` / `archived` |

No file upload UI was built for `mediaPath` — it's a plain text field, per spec §19.

## E. Security

- **Route boundary**: `src/app/admin/layout.tsx` (unchanged) redirects anonymous visitors to `/login` and non-admin authenticated users to `/` before any Services admin page renders or fetches data.
- **Server Action boundary**: every mutating action (`createServiceAction`, `updateServiceAction`, `archiveServiceAction` in `features/admin/actions.ts`) calls into a service-layer function that itself calls `requireAdmin()` before touching validation or the repository — a non-admin invoking the action directly (bypassing the UI) gets the same rejection a browser click would.
- **RLS boundary**: `services_insert_admin_only` / `services_update_admin_only` / `services_select_admin_all` (all `public.is_admin()`-gated, from Module 9A's `0005_cms_content.sql`) are the final, independent authority — even a bug in the two layers above couldn't grant a write the database itself would refuse. No service-role client is used anywhere in this module; every query goes through the normal `createSupabaseServerClient()` session client, per spec §22.
- **No second role system**: `requireAdmin()`/`public.is_admin()` from Modules 5/9A are reused as-is.

## F. Public frontend preservation

`src/features/home/data/services.ts` and `src/features/services/data/serviceDetails.ts` were **not modified**. No component under `src/features/services/*`, `src/features/experience/services/*`, or `src/features/home/sections/Services.tsx` was touched. The public `/services` index and `/services/[slug]` detail pages still render exclusively from the static data files, exactly as before this module — this module only adds an admin interface that reads/writes the `services` table, with no consumer on the public site yet. That migration is explicitly deferred to Module 9F.

## G. Verification

Commands actually run in this environment:

- `npm run lint` (`npx eslint`, project-wide) — **passed, zero errors/warnings**, both before and after this module's changes.
- `npx tsc --noEmit` — **one error, pre-existing and unrelated**: `src/app/(site)/signup/page.tsx` imports `@/features/auth/sections/SignUpForm`, but the file on disk is `SignupForm.tsx` (case mismatch) — present before Module 9A was ever touched, not introduced here. Every file this module added or changed produces zero typecheck errors.
- `npm run build` (`next build`) — fails at the same pre-existing `signup/page.tsx` module-not-found error, which Turbopack treats as fatal for the whole build before reaching page-generation. To actually verify the new routes compile and generate correctly despite that pre-existing defect, the broken `signup/page.tsx` was **temporarily moved aside** (not deleted, not edited), the build was re-run, and then the original file was restored unchanged immediately afterward. With that one unrelated file out of the way, the build **succeeded**: `Compiled successfully`, `Finished TypeScript`, and all three new routes appear in the final route table as dynamic (`ƒ`) routes exactly as expected for cookie-gated admin pages —
  ```
  ƒ /admin/services
  ƒ /admin/services/[id]
  ƒ /admin/services/new
  ```
  `src/app/(site)/signup/page.tsx` itself was left exactly as it was found; this module makes no claim about fixing it.
- **Validation schema** (`serviceSchema`) exercised directly via `tsx`, not through the browser: confirmed a valid minimal payload parses; confirmed rejections for a missing `name`, an uppercase/spaced slug, an invalid `status` value, an out-of-range Six S `principles` value (`7`), a negative `sortOrder`, and a full-URL `mediaPath`; confirmed a storage-relative `mediaPath` is accepted.
- **Duplicate-slug detection** (`isUniqueViolation`) exercised directly: confirmed it recognizes a Postgres `23505` unique-violation shape and correctly ignores an unrelated Postgres error code, a generic `Error`, and `null`.

**Not run — no live Supabase project is connected in this sandbox** (same limitation already documented in `database.types.ts` and Module 9A's own handoff): creating a real draft/published/archived service row, verifying the actual database update, exercising RLS against real anonymous/authenticated/admin sessions, and clicking through the list/create/edit/archive UI in a browser were **not performed**. What was verified instead, as listed above, is that every layer compiles, lints, and enforces its own rules in isolation (schema validation, unique-violation detection, Server Action wiring back to `requireAdmin()`-gated service functions, and a full production build of the new routes with the one unrelated pre-existing defect set aside).

## H. Remaining Work

Explicitly out of scope for this module, left for later modules per the brief:

- **Public Services migration** (Module 9F) — `/services` and `/services/[slug]` still read from the static data files; nothing in this module wires `getPublishedServices()`/`getPublishedService(slug)` (already built in Module 9A) into the public pages yet.
- **Service detail page content migration** — the richer `serviceDetails.ts`-derived fields (`problem`, `capabilities`, `architecture`) are editable in this admin UI and stored in the database, but the public `/services/[slug]` detail page still renders from `serviceDetails.ts`, not from these rows.
- **Media management** — `media_path` is a plain validated text field; no upload UI, no Storage write path, no image preview.
- **Ordering UX** — `sort_order` is a plain number input; no drag-and-drop reordering or bulk reorder operation.
- **Projects / Team / Insights CMS** — Modules 9C–9E, not started here.
- **Fixing the pre-existing `signup/page.tsx` defect** — noted for visibility since it blocks a clean `npm run build`, but is unrelated to Services and was left untouched per this module's own scope.
