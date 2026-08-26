# MODULE-TESTIMONIAL-1 — TESTIMONIALS FOUNDATION + PUBLIC EXPERIENCE — HANDOFF

Scope: add Testimonials as a full CMS content type, following the
existing Services/Projects/Team/Insights architecture exactly. No
existing CMS/admin/media/auth/SEO/motion system was rebuilt or
redesigned.

## Architecture

Same layered chain as every other content type:

```
Admin UI (TestimonialForm / Table / Archive.../Delete...)
  ↓
Server Action (features/admin/actions.ts)
  ↓
Service layer (lib/services/testimonialContentService.ts) — requireAdmin() + Zod validation
  ↓
Repository (lib/repositories/testimonials.ts) — only layer that knows column names
  ↓
Supabase + RLS (supabase/migrations/0009_testimonials.sql)
```

Public read path mirrors Team/Services:

```
Home page (src/app/(site)/page.tsx)
  ↓
Testimonials section (features/home/sections/Testimonials.tsx) — Server Component
  ↓
getPublicTestimonials() (features/testimonials/data/publicTestimonials.ts)
  ↓
getPublishedTestimonials() (lib/services/testimonialContentService.ts)
  ↓
listPublishedTestimonials() (lib/repositories/testimonials.ts) — RLS-filtered to published
```

## Database

New migration: `supabase/migrations/0009_testimonials.sql` (next
number after `0008_seo4_content_seed.sql`).

`public.testimonials`:

| column | type | notes |
|---|---|---|
| id | uuid PK | |
| name | text, required | 1–200 chars |
| role | text, optional | 1–200 chars |
| company | text, optional | 1–200 chars |
| quote | text, required | 1–2000 chars |
| image_path | text, optional | storage-relative path, `general` bucket |
| project_id | uuid, optional | FK → `public.projects`, `on delete set null` |
| sort_order | integer | default 0 |
| status | `content_status` enum | draft / published / archived |
| created_at / updated_at / published_at | timestamptz | same trigger/semantics as every other CMS table |

No `slug` column — testimonials have no public detail route, so there
was nothing to key by slug (spec: "do not invent unnecessary
fields"). Admin read/write is by `id`.

Indexes: `(status, sort_order)` for the public/admin list query,
`(project_id)` for the optional relationship.

## RLS

Identical policy shape to `services`/`projects`/`team_members`/`insights`:

- `testimonials_select_published` — `anon, authenticated`, `status = 'published'`
- `testimonials_select_admin_all` — `authenticated`, `is_admin()`
- `testimonials_insert_admin_only` / `_update_admin_only` / `_delete_admin_only` — `authenticated`, `is_admin()`

Draft and archived rows are never selectable by `anon`/non-admin
`authenticated` roles.

## Admin

New route: `/admin/testimonials` (list, filterable by `?status=`),
`/admin/testimonials/new` (create), `/admin/testimonials/[id]` (edit).
Added to `AdminNav` between Team and Insights.

Supports: create, edit, publish (via status field), archive
(soft-delete, sets `status = 'archived'`, reversible by editing again),
permanent delete (removes the row and best-effort cleans up the
Storage object). Same confirm-before-destructive-action UX as every
other content type (`ArchiveTestimonialButton` / `DeleteTestimonialButton`).

The optional project relationship is entered as a plain UUID text
field (copied from `/admin/projects`) rather than a `<select>`, so
this module doesn't need to fetch the full project list just to
populate a picker — a reasonable v1 trade-off, see "Future
enhancements" below.

## Public section

`src/features/home/sections/Testimonials.tsx`, placed on the
homepage between `Work` (Selected Work) and `TeamJourney` (Team),
per the requested Selected Work → Testimonials → Team sequence.

Visual treatment: an editorial, vertically stacked sequence of large
quotes (alternating left/right portrait placement on desktop), each
revealed on scroll with the existing `Reveal` primitive — not a
three-card grid, not a carousel/slider, no star ratings or fabricated
scores. Every testimonial is reachable by ordinary scrolling; nothing
about its visibility depends on an auto-rotating or drag-driven
mechanism.

## Media

Reuses the existing Storage architecture exactly — no new bucket, no
new upload system. Portraits go in the `general` bucket (the same
bucket Services already uses), through the existing `MediaUploadField`
component and `uploadMedia`/`deleteMedia` service functions. Public
URLs are resolved through the existing `getPublicMediaUrl()` helper.
No image is required — the public card renders a monogram-style
initial in a circle when empty, matching Team's initials fallback
pattern.

## Motion

Reuses `Reveal` only (`src/components/motion`). No new GSAP context,
no new ScrollTrigger factory, no new RAF loop. `Reveal` already
respects `prefers-reduced-motion` (resolves straight to the visible
state, no animation) — nothing additional was needed here.

## Loading / error / empty states

- **Loading**: the section is a Server Component fetched as part of
  the Home page's server render — no client-side loading state is
  needed (same as `Services`/`Work`).
- **Error**: `getPublicTestimonials()` returns
  `{ ok: false, data: [] }` on a genuine query failure, distinguishable
  from "zero published rows" — the section renders `PublicRetryState`
  (the same shared retry primitive `TeamJourney` uses) instead of a
  broken layout or raw error.
- **Empty**: zero published testimonials renders `null` — the section
  disappears entirely rather than showing an empty marketing block,
  per the module spec's explicit preference.
- **Admin CRUD** loading/error/success states reuse the same
  `useTransition` + inline pending/error/success pattern established by
  `TeamMemberForm`/`ArchiveTeamMemberButton`/`DeleteTeamMemberButton`.

## Accessibility

- No carousel, no auto-rotation — every testimonial is a normal
  document-flow `<figure>`, reachable by scrolling and by
  screen-reader linear navigation.
- Portrait images always get real `alt` text (the person's name); the
  no-image fallback is `aria-hidden` since it's decorative.
- `Reveal` already resolves to the visible, non-animated state under
  `prefers-reduced-motion`.
- Text contrast uses the same `--color-text-primary`/`--color-text-secondary`
  tokens as the rest of the site — no new colors introduced.

## Verification

This sandbox has no npm registry access (same limitation documented
in every module since Frontend Stabilization Part 2 —
`npm install` fails with `403`). `npm run lint`, `npx tsc --noEmit`,
`npm run build`, and `npm run dev` were **not** run. Every file was
hand-reviewed against the exact patterns in the Services/Team CMS
implementation (import correctness, prop shapes, brace/paren
balance) but not compiled or executed. **Run the full verification
suite (`npm install && npm run lint && npx tsc --noEmit && npm run
build`) and the manual admin/public/empty/error/mobile checks from
the module spec before trusting this in production**, the same
caveat every prior unverified module carries.

## Known limitations

- The optional project relationship is a raw UUID text field in the
  admin form, not a searchable `<select>` of real project titles.
- No public detail page/route for a single testimonial — by design,
  since none was requested and none currently exists for this
  content type.
- No structured data (Review/AggregateRating schema) was added —
  intentionally, since no real rating data exists and SEO-3 remains
  the single source of truth for the site's structured-data system.
- The public section currently only appears on the homepage, matching
  the module's scoped placement request.

## Future enhancements

- Replace the project-id text field with a `<select>` populated from
  `listAllProjects()`, once the admin project-count makes that
  worthwhile.
- Add a compact testimonial excerpt to individual `/projects/[slug]`
  case-study pages for testimonials with a `project_id` set.
- Revisit structured data once genuine, admin-confirmed rating data
  (if any) exists.
