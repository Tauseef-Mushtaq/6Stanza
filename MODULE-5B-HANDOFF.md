# Module 5B Handoff — Authentication & User Identity

## 0. Naming note

The prior module's own handoff file is titled `MODULE-5-HANDOFF.md` (not
`5A`), so it's referenced here as "Module 5A" per this module's brief.
This module is Module 5B.

## 1. Summary

Built the authentication UI and session-protection layer on top of the
Supabase Auth foundation Module 5A already established
(`src/lib/supabase/*`, `src/lib/auth/session.ts`, the `profiles` table
and its RLS policies, `src/middleware.ts`'s session-refresh logic).
Module 5A explicitly left this out ("no `/login`/`/signup` route
exists... this is the foundation the future auth-UI module builds on"
— `MODULE-5-HANDOFF.md` §5) — that's exactly what this module adds.

Concretely: `/signup`, `/login`, sign-out, one protected route
(`/account`) as the reusable pattern future modules copy, an
email-confirmation callback route, and middleware-level route
protection layered on top of Module 5A's existing session-refresh
middleware (not a replacement for it).

**No new database migration was needed.** Module 5A's `profiles`
schema, RLS policies, and `handle_new_user` trigger already covered
everything Steps 6–8 of the brief asked for — reused as-is.

## 2. New files

```
.env.example
src/lib/validation/auth.ts
src/lib/services/authService.ts
src/features/auth/actions.ts
src/features/auth/sections/LoginForm.tsx
src/features/auth/sections/SignupForm.tsx
src/features/auth/components/LogoutButton.tsx
src/app/login/page.tsx
src/app/signup/page.tsx
src/app/auth/callback/route.ts
src/app/account/page.tsx
MODULE-5B-HANDOFF.md
```

## 3. Modified files

```
src/middleware.ts   — added route protection on top of the existing
                       session-refresh logic (see §6). The refresh
                       logic itself is untouched.
```

Nothing else. `src/lib/auth/session.ts`, `src/lib/supabase/*`, the
`profiles` migration, and every frontend page/section outside
`src/features/auth/` and the three new routes above are byte-for-byte
unchanged.

## 4. Deleted files

None.

## 5. Authentication architecture

Uses Module 5A's existing Supabase Auth setup — no second auth library,
no duplicate client. All three operations go through
`src/lib/services/authService.ts`, which mirrors the
validate → call → map-errors shape of Module 5A's
`projectInquiryService.ts`:

```
LoginForm.tsx / SignupForm.tsx / LogoutButton.tsx  (client, "use client")
        ↓
src/features/auth/actions.ts   ("use server" Server Actions)
        ↓
src/lib/services/authService.ts   (zod validation, error-message mapping)
        ↓
src/lib/supabase/server.ts → createSupabaseServerClient()   (Module 5A, unchanged)
        ↓
Supabase Auth (signUp / signInWithPassword / signOut)
```

Every call uses the RLS-respecting, cookie-aware server client from
Module 5A — never `src/lib/supabase/admin.ts` (grepped for
`getSupabaseAdminClient` after writing every new file: zero call sites
in this module, same as Module 5A).

Sign-up passes `full_name` as Supabase Auth user metadata; Module 5A's
`handle_new_user` trigger reads it into `profiles.display_name`
automatically — no direct insert into `profiles` from this module, so
profile creation stays safe-to-retry the way Module 5A already
guaranteed.

## 6. Session architecture

Unchanged from Module 5A: Supabase's SSR cookie-session pattern,
refreshed on every request by `src/middleware.ts`. This module adds
**route protection** to that same middleware function (it does not
introduce a second, separate middleware):

- Requests to `/account` (or any future path under `/account/`) with
  no session are redirected to `/login?redirect=<original-path>`.
- Requests to `/login` or `/signup` with an existing session are
  redirected to `/account`, so an already-authenticated visitor
  doesn't see a sign-in form for a session they already have.
- Every other route is untouched — this is an allow-list of what's
  protected, not a deny-list of what's public, per the brief's "do not
  blindly protect the entire website."

This is deliberately **not** the only enforcement point:
`src/app/account/page.tsx` independently calls `getCurrentUser()` and
redirects if absent, before rendering anything. Module 5A's own
`session.ts` comment already establishes the principle this follows
("server-side authentication checks do not rely solely on client-side
state") — middleware can, in some edge cases (direct RSC fetches,
route-handler-to-route-handler calls), be bypassed in ways a
page-level check cannot, so both layers exist.

## 7. User/profile architecture

Unchanged — reuses Module 5A's `profiles` table exactly as migrated
(`id`, `display_name`, `role`, `avatar_url`, `created_at`,
`updated_at`). `/account` reads it via the existing
`getCurrentProfile()` helper and displays `display_name` (falling back
to the auth email) and `role` (via the existing `Badge` component) —
no new fields, no second profile table.

## 8. Authorization

No new authorization primitives were created — `requireUser()` and
`requireAdmin()` already existed from Module 5A and are exactly what
the brief's Step 8 asked this module to establish. `/account` uses
`getCurrentUser()`/`getCurrentProfile()` (the non-throwing pair) rather
than `requireUser()` (the throwing one) specifically because a
Server Component can't catch-and-redirect a thrown error as cleanly as
it can check a `null` return; `requireUser()`/`requireAdmin()` remain
available for a future module protecting a Server Action or Route
Handler, where throwing is the more natural shape.

Role is still never read from anything client-supplied — `/account`'s
role display comes from `getCurrentProfile()`, which reads
`profiles.role` from the database via the session's own `auth.uid()`,
exactly as Module 5A's `requireAdmin()` does.

## 9. Security

- **Service-role exposure**: unchanged from Module 5A — `admin.ts` is
  untouched and unused by this module (checked via grep, see §5).
- **Logout is server-side session invalidation**, not a client-side
  token clear: `signOutAction` calls Supabase's `auth.signOut()`
  through the server client (which clears the session cookie
  server-side) before redirecting, per the brief's explicit "do not
  simply delete a client-side token and call that authentication."
- **Error messages**: `authService.ts`'s `mapAuthError()` pattern-matches
  known Supabase Auth error strings into the exact set of messages the
  brief specified (`"Invalid email or password."`,
  `"This email is already registered."`,
  `"Unable to create your account. Please try again."`, etc.) and logs
  the real error server-side via `console.error` first — no Postgres/
  Supabase error text, stack trace, or token ever reaches the client.
  Unrecognized errors fall back to a generic message rather than
  leaking the raw provider string.
- **Client-supplied identity/role**: nothing in this module accepts a
  user id or role from the client. `/account` derives identity solely
  from the session cookie via `getCurrentUser()`.
- **Redirect-target validation**: `/login`'s `?redirect=` query param
  is checked to start with `/` before use (`src/app/login/page.tsx`),
  so it can't be turned into an open redirect to an external origin.

## 10. Environment variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL   — new; used to build the email-confirmation
                          redirect URL passed to Supabase Auth
                          (src/lib/services/authService.ts). Defaults
                          to http://localhost:3000 if unset.
```

The first three already existed in Module 5A's design (though the
`.env.example` file documenting them didn't actually exist in the
uploaded project — it's created here for the first time, since a
future developer setting up the project needs it regardless of which
module technically "owns" writing it). No values/secrets are included.
No `.env.local` was committed — one was created locally only to smoke-test
route resolution during verification (see §12) and is excluded from
the patch.

## 11. Database/RLS changes

None. Module 5A's `profiles` table, its RLS policies
(`profiles_select_own_or_admin`, `profiles_update_own_or_admin`), the
`handle_new_user` trigger, and the `enforce_profile_role_immutable`
trigger were reused exactly as they already existed — no new migration
file was added, since nothing this module needed was missing from the
existing schema.

## 12. Verification

```
npm install       PASS
npm run lint      PASS (0 errors, 0 warnings)
npx tsc --noEmit  FAIL — pre-existing Module 5A issue, not caused by this module (see below)
npm run build     FAIL — same pre-existing issue (build runs its own type check)
npm run dev       Started successfully; HTTP route smoke-testing was
                   attempted but the sandbox's background-process
                   handling made a curl-based smoke test unreliable
                   (see note below) — not confirmed via HTTP request/response.
```

**The `tsc`/`build` failure is pre-existing and unrelated to this
module.** Two errors, both in Module 5A files this module never
touched:

```
src/lib/repositories/contactInquiries.ts(11,5): error TS2353: Object literal
  may only specify known properties, and 'name' does not exist in type 'never[]'.
src/lib/repositories/projectInquiries.ts(20,5): error TS2353: Object literal
  may only specify known properties, and 'name' does not exist in type 'never[]'.
```

Root cause (confirmed by inspection, not fixed —
out of scope per the brief's "do not modify unrelated files"):
`src/lib/supabase/database.types.ts` (Module 5A, hand-written) defines
only a `Tables` key inside `Database.public`. `@supabase/supabase-js`'s
generic typing expects `Views`, `Functions`, and `Enums` keys to be
present (even as empty objects) to correctly resolve `.insert()`'s
argument type; without them it falls back to `never[]`, which is why
every `.insert()` call in Module 5A's repositories fails type-checking.
This predates Module 5B — running `npx tsc --noEmit` against the
project exactly as it was unzipped (before any of this module's files
were added) reproduces the same two errors. No file this module added
or touched (`src/features/auth/*`, `src/app/login`, `src/app/signup`,
`src/app/account`, `src/app/auth/callback`, `src/middleware.ts`,
`src/lib/validation/auth.ts`, `src/lib/services/authService.ts`)
appears anywhere in either `tsc` or `build`'s error output — both
runs were clean of new-file errors. `npm run lint` reports zero issues
across the whole project, including the new files.

**Fix for a future module** (one-line, in a file this module didn't
touch): add empty `Views: Record<string, never>`, `Functions:
Record<string, never>`, `Enums: Record<string, never>` keys next to
`Tables` in `database.types.ts`'s `Database.public` type. This is
Module 5A's file to fix, not claimed as done here.

**`npm run dev` note**: the dev server itself started cleanly
(`✓ Ready`, `✓ Running next.config.ts`), confirming Next.js accepts the
new routes/middleware without a startup error. A route-by-route
`curl` smoke test (`/`, `/login`, `/signup`, `/account`,
`/start-project`) was attempted with dummy `NEXT_PUBLIC_SUPABASE_URL`/
`NEXT_PUBLIC_SUPABASE_ANON_KEY` values (no live Supabase project exists
in this environment — same limitation Module 5A documented), but
repeated background-process termination in this sandbox prevented
getting a completed run of curl results back. Not claiming this as a
passing HTTP-level test — only the dev-server startup and the
lint/build compile step (which does exercise every new file's JSX/TSX
through the Next.js/Turbopack compiler successfully, per §"Compiled
successfully" in the build output) are confirmed.

None of the actual auth flows (registration → profile creation,
login → session, logout → invalidation, protected-route redirect,
unauthorized access rejection) were tested against a real Supabase
project, because none is connected in this sandbox — identical
limitation to Module 5A's §0.

## 13. Known limitations

- No live Supabase project in this environment — every auth flow
  (§12's five test scenarios from the brief's Step 19) is implemented
  and code-reviewed but not exercised against real Postgres/Supabase
  Auth. Before merging: run the app against a real (or `supabase
  start` local) project and walk through signup → email confirmation
  (if enabled) → login → `/account` → logout → attempt to reach
  `/account` again while logged out.
- `npx tsc --noEmit` / `npm run build` fail due to the pre-existing
  Module 5A `database.types.ts` gap described in §12 — not something
  this module introduced, but it does mean a genuinely clean
  `npm run build` still needs that one-line fix before this can ship.
- Password policy is minimum-length-only (8 chars) at the application
  validation layer; Supabase Auth's own project-level password
  settings are the actual source of truth and weren't configurable in
  this sandbox.
- Whether email confirmation is required depends on the live Supabase
  project's own Auth settings (not controlled by this codebase) — the
  signup success screen and `/auth/callback` route are both written to
  behave correctly under either configuration, but only one path can
  actually be exercised per real project setup.
- `/account` is intentionally the only protected route — a minimal,
  reusable example, not a real feature. Module 6+ (per the naming this
  module found already in use — see the follow-up note about
  "Module 7A" below) is expected to add real protected/admin routes
  following this same pattern.

## 14. Next-module instructions

A future module can safely build on:

- **`getCurrentUser()` / `getCurrentProfile()` / `requireUser()` /
  `requireAdmin()`** (Module 5A, unchanged) — protect a new Server
  Component the same way `src/app/account/page.tsx` does, or a new
  Server Action the same way a `requireAdmin()` check would.
- **`PROTECTED_PREFIXES` in `src/middleware.ts`** — add a new path
  prefix (e.g. `/admin`) to get the same middleware-level redirect
  `/account` gets, for free.
- **`src/features/auth/actions.ts`** — the Server Action boundary is
  stable; a future module doesn't need to touch it to add, say, a
  password-reset flow — that would be a new file alongside it, mirroring
  its shape.
- **The `Badge`/role pattern in `/account`** — `profile.role === "admin"`
  is already how an admin-only UI branch would be written; a real admin
  layout would gate on `requireAdmin()` server-side the same way, not
  by hiding a link in the header.

### Note on the follow-up brief

A "Module 7A — Admin Foundation & Inquiry Management" brief was
provided in this same conversation, whose context section states
"Module 6A — Authentication Core ✅" and "Module 6B — Authentication UX
✅" are already complete. Those don't exist under that name in this
project — what that brief is describing is this module (5B), just
under different numbers. Before starting that work, it's worth
confirming with the project owner whether "Module 7A" should actually
run directly on top of what's in this patch (in which case the
numbering can just be reconciled going forward), since as written it
assumes authentication work that, functionally, is what's being
handed off here.
