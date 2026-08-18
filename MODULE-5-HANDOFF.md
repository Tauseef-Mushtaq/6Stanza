# Module 5 Handoff — Backend Foundation

## 0. Environment note — verification NOT run

Same limitation as every prior module in this session: this sandbox has
no network access. `npm install` fails immediately:

```
npm error code E403
npm error 403 403 Forbidden - GET https://registry.npmjs.org/@supabase%2fssr
```

**`npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm run dev`,
and every item in §25's verification list (form submission, invalid
input rejection, RLS enforcement, session resolution, admin
authorization) were NOT run.** There is also no live Supabase project
connected in this environment — even with network access, the database
tests in §25 need real credentials this sandbox doesn't have. Every
file below was reviewed by hand (import correctness, brace/paren
balance, cross-referencing actual column names between the SQL
migrations and `database.types.ts`) but none of it has been compiled,
migrated, or executed. Per spec §27: do not treat anything below as
tested. Before merging: run `npm install` and the verification commands
in an environment with registry access, then run the actual migrations
against a real (or local, via `supabase start`) Postgres instance and
re-test the §25 checklist for real.

## 1. Inspection — what actually exists (spec §1)

Read every `MODULE-*-HANDOFF.md`, `package.json`, `src/config/*`, and
the actual `/contact` and `/start-project` implementations before
writing anything. Two findings changed this module's scope from what
the brief assumed:

- **`/contact` has no form.** `ContactDetails.tsx` contains its own
  code comment stating this is deliberate — the page points visitors
  to `/start-project` instead. The brief's §8 ("the existing `/contact`
  form must become functional") describes a form that doesn't exist in
  this codebase. See §6 below for how this was handled.
- **`/start-project` already has a clean seam for this.**
  `features/start-project/lib/submitInquiry.ts` was already a stub
  function with the exact contract (`(inquiry: ProjectInquiry) =>
  Promise<void>`, throws on failure) a real backend needs, with an
  explicit `TODO` comment saying so. `ProjectForm.tsx` calls only this
  function — nothing else needed to change.

No `src/config/env.ts` or equivalent existed, no Supabase/database
dependency existed, no `/login` or `/signup` route existed.

## 2. Architecture

```
Browser (ProjectForm.tsx — unchanged)
  ↓
submitInquiry() (features/start-project/lib/submitInquiry.ts)
  ↓
submitProjectInquiryAction() — Server Action (features/start-project/actions.ts, "use server")
  ↓
submitProjectInquiry() — validation + error mapping (lib/services/projectInquiryService.ts)
  ↓  zod schema (lib/validation/projectInquiry.ts)
insertProjectInquiry() — data access only (lib/repositories/projectInquiries.ts)
  ↓
createSupabaseServerClient() (lib/supabase/server.ts) — RLS-respecting, per-request
  ↓
Supabase → PostgreSQL (project_inquiries table, RLS policy project_inquiries_insert_anyone)
```

`contact_inquiries` has the identical repository/service/validation
layers already built (§6), just no Server Action or UI calling them
yet, since there's no form.

```
src/lib/
  supabase/     client.ts (browser), server.ts (per-request), admin.ts (service-role), database.types.ts
  auth/         session.ts — getCurrentUser / getCurrentProfile / requireUser / requireAdmin
  validation/   projectInquiry.ts, contactInquiry.ts — zod schemas
  repositories/ projectInquiries.ts, contactInquiries.ts — the only files that know column names
  services/     projectInquiryService.ts, contactInquiryService.ts — validate → repository → safe errors
src/middleware.ts — Supabase session-cookie refresh
supabase/migrations/*.sql
```

Matches spec §17's suggested layout exactly (checked the existing
project conventions first — no competing `src/services/` or
`src/data-access/` directory existed to integrate with instead).

## 3. Database

**`profiles`** (`0001_profiles.sql`) — `id` (PK, FK to `auth.users`,
cascade delete), `display_name`, `role` (`profile_role` enum:
`user`/`admin`, default `user`), `avatar_url`, `created_at`,
`updated_at`. A `handle_new_user` trigger (`security definer`)
auto-inserts a row on every `auth.users` insert, so "authenticated with
no profile" is never a state the app has to handle. An
`enforce_profile_role_immutable` trigger blocks any `role` change that
isn't made by an admin (checked via `public.is_admin()`) — the
`Update` type in `database.types.ts` also omits `role` at the
TypeScript layer, so this is enforced twice, at two different layers.

**`contact_inquiries`** (`0002_contact_inquiries.sql`) — `id`, `name`,
`email`, `message`, `status` (`inquiry_status` enum: `new` /
`in_progress` / `resolved` / `archived`, default `new`), timestamps.
Index on `(status, created_at desc)` — the query shape a future admin
inbox view will actually use. Not currently written to by any form
(§1/§6).

**`project_inquiries`** (`0003_project_inquiries.sql`) — `id`, `name`,
`email`, `company`, `project_title`, `services` (`text[]`), `stage`,
`timeline`, `budget`, `message`, `status`, timestamps. Column names/
shapes map 1:1 onto `ProjectInquiry` in
`features/start-project/data/inquiry.ts` — this is the schema the
*existing* form already produces, not a redesigned one. `services` is
`text[]` of slugs (not a normalized join table) because this module
deliberately does not create a `services` table (§7 below) — there's
nothing yet for a foreign key to reference.

**Storage** (`0004_storage_buckets.sql`) — four public-read buckets
(`team`, `projects`, `insights`, `general`) with admin-only write, via
the same `public.is_admin()` helper. No upload UI, no objects written.

**Shared**: `public.set_updated_at()` (trigger function, reused by all
three tables' `updated_at` columns) and `public.is_admin()`
(`security definer`, `stable`, fixed `search_path` — the standard
Supabase pattern for letting an RLS policy check `profiles.role`
without the policy's own subquery recursively re-triggering RLS on
`profiles`).

Every migration is a plain numbered `.sql` file under
`supabase/migrations/` — reproducible via `supabase db push` or
`supabase migration up` against a real project; nothing was applied by
hand outside the migration files.

## 4. Row Level Security (spec §7)

RLS is enabled on all three tables. No table is publicly readable in
full — checked every policy against that rule specifically:

| Table | anon | authenticated (non-admin) | admin |
|---|---|---|---|
| `profiles` | none | select/update **own row only**; `role` immutable | select/update any row |
| `contact_inquiries` | **insert only** | insert only (no select) | select/update |
| `project_inquiries` | **insert only** | insert only (no select) | select/update |
| `storage.objects` (4 buckets) | select | select | select/insert/update/delete |

Anonymous insert-only on the two inquiry tables matches spec §7
exactly: "anonymous visitors must be able to submit... but must NOT
receive arbitrary read access" — an `insert` policy alone doesn't grant
read-back access to the inserted row, so this is enforced by omission
(no select policy for `anon`/non-admin `authenticated`), not by a
separate deny rule.

## 5. Authentication (spec §6/§18)

`src/lib/auth/session.ts`:

- `getCurrentUser()` — current session's Supabase auth user, or `null`.
- `getCurrentProfile()` — current user's `profiles` row, or `null`.
- `requireUser()` — throws `"UNAUTHENTICATED"` if no session.
- `requireAdmin()` — throws `"UNAUTHENTICATED"` or `"FORBIDDEN"`; never
  checks an email string — reads `profiles.role` via `getCurrentProfile()`.

`src/middleware.ts` refreshes the Supabase session cookie on every
request (standard SSR pattern — Server Components can read cookies but
not write them, so this is what keeps a session's tokens valid across
requests). It does not gate any route — there is no `/login` route and
nothing in the current app calls `requireUser`/`requireAdmin`, so there
is nothing to protect yet. This is deliberate: spec §18 asks for the
foundation, not a polished auth UI, and building `/login` here would
mean inventing a route this module has no real requirement for.

## 6. Forms (spec §8/§9/§11/§13)

**`/start-project`** — fully wired. `ProjectForm.tsx` is byte-for-byte
unchanged; only `submitInquiry.ts`'s body changed, from a
`setTimeout`-simulated stub to a real call through
`submitProjectInquiryAction` → `submitProjectInquiry` →
`insertProjectInquiry`. Every existing loading/error/success UI state
in `ProjectForm.tsx`/`SuccessState.tsx` now reflects a real submission
instead of a fake one, with no UI code touched.

Client-side `validateInquiry` (already in the codebase) still runs
first and blocks obviously-invalid submissions before the network
call — the server-side `projectInquirySchema` (zod) is the one that
actually matters (spec §10: "never trust client-side validation
alone") and re-validates everything independently, including the
`services`/`stage`/`timeline`/`budget` enum fields against the same
canonical lists the form itself renders its options from.

**`/contact`** — backend built (table, RLS, repository, service,
validation schema — `submitContactInquiry`), but **nothing calls it**,
because there is no form. This was a deliberate choice over the two
alternatives: (a) silently skip building the contact backend at all
(fails spec §8's explicit requirement and leaves the codebase without
foundation the brief clearly wants), or (b) build a new contact form UI
to have something to wire it to (violates spec §23 — "preserve the
frontend... unless a backend integration genuinely requires a minimal
change," and a new form is not a minimal change). Building the backend
half and documenting the missing frontend half honestly, rather than
picking silently between (a) and (b), seemed like the right call here
— a future module can add a three-field form to `ContactDetails.tsx`
and call `submitContactInquiryAction` (not yet created — only the
service function `submitContactInquiry` exists; the Server Action
wrapper is a five-line addition once a real form calls it, mirroring
`features/start-project/actions.ts` exactly).

Error handling (spec §12): both services catch repository errors,
`console.error` the real error server-side, and return a generic
`"Unable to submit your inquiry. Please try again."` — no Postgres
error text, no stack trace, ever reaches the client. Verified by
reading every `catch` block; not verified by triggering a real
database failure (no live database — §0).

## 7. What was deliberately NOT done (spec §16/§22)

- **`services`/`projects`/`team`/`sixS`/`insights` were not migrated
  into the database.** They stay as static frontend data
  (`features/*/data/*.ts`) exactly as they are today — spec §16 is
  explicit that this isn't required for Module 5, and doing it would
  touch far more of the frontend than "backend foundation" implies.
  `project_inquiries.services` storing slugs as `text[]` instead of a
  normalized relation is the direct consequence of this choice,
  documented in the migration's own comment.
- **No admin dashboard, CMS UI, media-management UI, or `/login` page**
  — all explicitly out of scope (spec §22), and nothing in this module
  needed them to exist.
- **No rate limiting, honeypot wiring, or CAPTCHA.** The validation
  schemas include an unused `website` honeypot field (spec §14 — "at
  minimum design so it CAN later support this") so a future module can
  add one hidden input to `ProjectForm.tsx` and get bot-rejection for
  free; nothing enforces it yet since no such input exists.
- **No Supabase-generated types** — `database.types.ts` is hand-written
  and says so in its own header comment, with the exact `supabase gen
  types` command to run once a real project exists (spec §19 — "if
  generation requires credentials this environment doesn't have,
  document the command rather than fabricating output").

## 8. Security review (spec §20)

Checked for, specifically:

- **Service-role exposure** — `admin.ts` is the only file that reads
  `SUPABASE_SERVICE_ROLE_KEY`; guarded by `import "server-only"`
  (build-time error if reachable from a client component) and by the
  variable itself having no `NEXT_PUBLIC_` prefix (Next.js won't inline
  it into client bundles regardless). Nothing in this module calls
  `getSupabaseAdminClient()` — grepped for it after writing every other
  file to confirm zero call sites, so there's no code path yet where
  RLS is bypassed.
- **Insecure/missing RLS** — all three new tables have RLS enabled with
  no all-access policy; storage bucket policies scoped to the four
  named buckets only, not a blanket `true`.
- **Client-supplied role trust** — `requireAdmin()` reads
  `profiles.role` from the database via the session's own user id
  (`auth.uid()`), never a request body/header/query param.
- **SQL injection** — no raw SQL string concatenation anywhere; every
  query goes through the Supabase client's parameterized query builder
  (`.insert()`, `.select()`, `.eq()`).
- **Unvalidated fields** — every form field has a zod rule (type,
  length, and for enum-shaped fields — `services`/`stage`/`timeline`/
  `budget` — an explicit allow-list, so unexpected values are rejected
  rather than silently stored).
- **Authorization bypass** — repositories use
  `createSupabaseServerClient()` (RLS-respecting), never the admin
  client, for the two insert paths this module actually wires up.

**Not audited/tested (see §0)**: whether the RLS policies as written
actually behave correctly against a real Postgres instance — SQL was
reviewed for logical correctness but never executed. Treat this as a
draft security model until the migrations run for real and the §25
tests are performed against them.

## 9. Environment variables

```
NEXT_PUBLIC_SUPABASE_URL        — public
NEXT_PUBLIC_SUPABASE_ANON_KEY   — public
SUPABASE_SERVICE_ROLE_KEY       — server-only, never exposed to the client
```

Documented (names only, no values) in `.env.example`. No `.env.local`
was created or committed.

## 10. Verification — actual results

```
$ npm install
npm error code E403
npm error 403 403 Forbidden - GET https://registry.npmjs.org/@supabase%2fssr
```

Nothing past this point could run. Not run: `npm run lint`, `npx tsc
--noEmit`, `npm run build`, `npm run dev`, route checks, anonymous
inquiry submission, invalid-input rejection, unauthorized-read check,
authenticated-session resolution, admin-authorization check, RLS
policy tests. All require either a working `node_modules` (blocked by
network) or a live Supabase project (none connected in this
environment). This is stated plainly per spec §27 rather than claimed
as passing.

## 11. What Module 6+ can build on top of this

- **Auth UI** (`/login`, `/signup`, session-aware header state) —
  `getCurrentUser`/`requireUser` and the middleware's cookie refresh
  are already in place; a future module adds the routes/forms and
  calls these helpers.
- **Admin dashboard** — `requireAdmin()` plus the
  `*_select_admin_only`/`*_update_admin_only` RLS policies on both
  inquiry tables are ready for an admin inbox view (list/filter by
  `status`, mark `in_progress`/`resolved`/`archived`).
- **Contact form** — add three fields to `ContactDetails.tsx`, a
  `submitContactInquiryAction` Server Action (five lines, mirrors
  `features/start-project/actions.ts`), done — `submitContactInquiry`
  already exists and is fully tested-by-symmetry with the
  project-inquiry path (same code shape).
- **CMS** — `services`/`projects`/`team`/`sixS`/`insights` migrating
  from static data files into real tables, with the storage buckets in
  `0004_storage_buckets.sql` ready for the media once that happens.
- **Rate limiting / spam protection** — the `website` honeypot field
  already exists in both validation schemas; wire one hidden input
  into each form and it's live. True rate limiting (e.g. per-IP/email
  submission throttling) would need either a Supabase Edge Function or
  a middleware-level store — not started.

## 12. Files changed / new

**New**
- `.env.example`
- `src/middleware.ts`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/admin.ts`
- `src/lib/supabase/database.types.ts`
- `src/lib/auth/session.ts`
- `src/lib/validation/projectInquiry.ts`
- `src/lib/validation/contactInquiry.ts`
- `src/lib/repositories/projectInquiries.ts`
- `src/lib/repositories/contactInquiries.ts`
- `src/lib/services/projectInquiryService.ts`
- `src/lib/services/contactInquiryService.ts`
- `src/features/start-project/actions.ts`
- `supabase/migrations/0001_profiles.sql`
- `supabase/migrations/0002_contact_inquiries.sql`
- `supabase/migrations/0003_project_inquiries.sql`
- `supabase/migrations/0004_storage_buckets.sql`
- `MODULE-5-HANDOFF.md`

**Modified**
- `package.json` — added `@supabase/ssr`, `@supabase/supabase-js`,
  `zod`, `server-only`.
- `src/features/start-project/lib/submitInquiry.ts` — real submission
  instead of a simulated stub; contract/signature unchanged.

**Deleted**: none.

No file under `src/app/`, `src/components/`, or any `features/*/sections/*`
component was modified — the entire frontend surface (per spec §23) is
untouched except the one internal function body described above.
