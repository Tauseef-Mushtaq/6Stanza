# Module 6 Handoff — Authentication & User Experience

## 0. Verification — NOT run (same limitation as every prior module)

This sandbox has no network access (`npm install` fails at E403) and no
live Supabase project is connected. **`npm run lint`, `npx tsc
--noEmit`, `npm run build`, and every flow in the brief's §26 checklist
(signup, login, logout, password reset, protected-route redirect, role
checks, mobile nav) were not run.** Every file was reviewed by hand —
brace/paren balance, import correctness, cross-checking prop shapes
between `Header.tsx`/`layout.tsx`, tracing `redirect()` calls against
`safeRedirectPath` — but none of it has been compiled or executed.
Per the brief's own instruction: do not treat anything below as tested
until it's actually run against a real environment with a real
Supabase project (the one from Module 5's migrations — no new tables
were added in this module, only Auth features that already exist on
any Supabase project by default).

## 1. Inspection — what already existed (spec §1)

No `/login`, `/signup`, `/auth/*`, `/forgot-password`, or
`/reset-password` route existed. `src/lib/auth/session.ts` had
`getCurrentUser`/`getCurrentProfile`/`requireUser`/`requireAdmin` from
Module 5, unused by any route. `src/middleware.ts` did session-refresh
only. No form primitive existed outside
`features/start-project/components/FormField.tsx` (feature-scoped, per
its own comment, pending "a later module that needs the same pattern
elsewhere" — see §7 below for why this module didn't promote it).
`Header.tsx` had no concept of auth state at all.

## 2. Routes

| Route | Purpose |
|---|---|
| `/login` | Email + password. Redirects to `/` if already authenticated. Reads `?redirect=`, `?reset=success`, `?error=confirmation-failed`. |
| `/signup` | Name + email + password + confirm. Redirects to `/` if already authenticated. |
| `/forgot-password` | Email only → safe "if an account exists…" response regardless of outcome. |
| `/reset-password` | New password + confirm. Does **not** redirect an authenticated visitor away (see its own file comment — arriving here authenticated via the recovery flow is the intended path). |
| `/auth/callback` (Route Handler, not a page) | Exchanges a Supabase PKCE `code` for a session — used by both the email-confirmation link and the password-recovery link, differing only in the `?next=` it redirects to afterward. |

## 3. Architecture

```
ProjectForm.tsx-style client form (features/auth/sections/*.tsx)
  ↓
Server Action (features/auth/actions.ts, "use server")
  ↓
zod validation (lib/validation/auth.ts)
  ↓
Auth Service (lib/services/authService.ts) — safe error mapping
  ↓
Supabase Auth (via lib/supabase/server.ts — RLS-respecting per-request client)
  ↓
AuthResult ({ ok: true } | { ok: false, fieldErrors } | { ok: false, message })
  ↓
UI (loading/error/field-error/success states)
```

Identical shape to Module 5's `project_inquiries` pipeline on purpose —
`AuthResult` in `authService.ts` and `SubmitProjectInquiryResult` in
`projectInquiryService.ts` are structurally the same type, so anyone
already familiar with the inquiry-form code reads the auth forms for
free.

## 4. Session & route protection

- `getCurrentUser()`/`getCurrentProfile()`/`requireUser()`/
  `requireAdmin()` — unchanged from Module 5, now actually called (by
  `/login`, `/signup`, `/forgot-password`'s "redirect if already
  authenticated" check, and the root layout's Header auth state).
- **New**: `requireProfileOrRedirect(currentPath)` in
  `lib/auth/session.ts` — the reusable protected-route boundary spec
  §14 asks for ("make the mechanism reusable... do not invent a fake
  protected page"). No page calls it yet, because no protected page
  exists in this app yet — it's ready for the first one a future
  module adds:
  ```ts
  export default async function SomeProtectedPage() {
    const profile = await requireProfileOrRedirect("/some-protected-path");
    // profile is guaranteed non-null past this line
  }
  ```
- **Middleware unchanged** — per spec §18's explicit instruction to
  keep heavy authorization out of middleware, `src/middleware.ts` still
  does session-cookie refresh only. Route protection happens at the
  page/Server Component level via `requireProfileOrRedirect`, not in
  middleware.
- **Session freshness in the Header** — `Header.tsx` now takes an
  `authState` prop resolved once, server-side, in the root layout. It
  doesn't poll or subscribe to auth-state changes client-side; this is
  correct because every action that changes auth state
  (`loginAction`, `logoutAction`, `resetPasswordAction`) ends in a
  `redirect()`, which is a real Next.js navigation and re-runs the root
  layout server-side. There is no path in this app where the session
  changes without a redirect happening. Documented as an explicit
  assumption in `Header.tsx`'s own comment — if a future module adds a
  client-side auth action that *doesn't* redirect, the Header's
  displayed state could go stale until the next navigation.

## 5. Profile handling

- No profile row is ever created by this module's code — `signUp` in
  `authService.ts` explicitly does *not* insert into `profiles`, relying
  entirely on Module 5's `handle_new_user` trigger (spec §3/§16: "do
  not duplicate profile creation").
- `role` cannot be set by the client anywhere in this module: `signUp`
  only ever calls `supabase.auth.signUp` (which creates an
  `auth.users` row, not a `profiles` row); the trigger that does create
  the `profiles` row defaults `role` to `'user'` and ignores any
  client-supplied value entirely (Supabase Auth's `options.data` here
  only sets `full_name`, nothing role-related). `requireAdmin()` still
  reads `role` from the database, never from a request.

## 6. Redirects (spec §17/§20)

`safeRedirectPath(raw, fallback)` (`lib/utils/safeRedirect.ts`) is the
single gate every redirect destination in this module passes through:
rejects anything not starting with a single `/` (blocks absolute URLs
and `//host`-style protocol-relative open-redirect payloads) or
containing `://`. Used in:

- `loginAction` — before calling `redirect()` with the login form's
  `?redirect=` value.
- `/auth/callback` — before calling `redirect()` with `?next=` (this
  one is set by this app's own `emailRedirectTo`/`redirectTo` URLs, not
  end-user input, but validated anyway rather than assuming that stays
  true forever).

No redirect loop is possible: `/login`/`/signup`/`/forgot-password`
redirect an authenticated visitor to `/` (never back to each other,
never to a route that itself redirects to `/login`), and `/` has no
auth requirement.

## 7. What was deliberately NOT done

- **`FormField.tsx` was not promoted to `components/ui/`.** Its own
  comment (written in Module 4E) suggested this module would be the
  right time. A near-identical `AuthField` component was created
  instead, in `features/auth/components/`, rather than refactoring the
  shared file and updating `ProjectForm.tsx`'s import — this sandbox
  can't run a build to confirm that refactor doesn't break Module 5's
  already-working form, so the lower-risk small duplication was chosen
  over an unverifiable shared-file edit. **Recommended follow-up** for
  a future module (with build access): promote one shared
  `TextField`/`PasswordField` into `components/ui/`, update both
  `ProjectForm.tsx` and every `features/auth/sections/*.tsx` to use it,
  delete both feature-scoped copies.
- **No admin dashboard, CMS, inquiry-management UI, account settings
  page, or OAuth providers** — all explicitly out of scope (spec §22),
  and nothing in this module needed them.
- **No demo protected page** — per spec §14's explicit instruction;
  `requireProfileOrRedirect` exists and is documented, unused.
- **Middleware untouched** — see §4.
- **`FormField`'s password-visibility toggle, rate limiting on auth
  endpoints, and CAPTCHA** were not added — none were requested by the
  brief for this module and Module 5's `website` honeypot precedent
  (for the inquiry forms) doesn't have an equivalent auth-specific ask
  here; flagging as a reasonable future hardening step alongside actual
  rate limiting, which would need a Supabase Edge Function or
  middleware-level store either way (same gap Module 5's handoff
  already flagged for the inquiry forms).

## 8. Security review (spec §20)

- **Service-role exposure**: nothing in this module touches
  `lib/supabase/admin.ts` — grepped after writing everything else to
  confirm zero new call sites.
- **Client-supplied role**: confirmed nowhere in the signup/login/reset
  flow does any code path write or read a `role` value from client
  input; see §5.
- **Server-side auth enforcement**: `requireProfileOrRedirect`/
  `requireUser`/`requireAdmin` all read the session via
  `createSupabaseServerClient()` (cookie-based, server-only) — never
  from a client-supplied header/body value.
- **Open redirect**: see §6 — every redirect destination passes through
  `safeRedirectPath`.
- **Password recovery**: uses Supabase's own
  `resetPasswordForEmail`/`updateUser` flow via a PKCE code exchange at
  `/auth/callback` — no custom token generation, storage, or
  validation logic was written.
- **Information disclosure**: `forgotPasswordAction` always returns
  `{ ok: true }` regardless of whether the email exists (spec §12);
  `signIn`'s error mapping returns the same "Invalid email or
  password" message whether the email doesn't exist or the password is
  wrong — never distinguishes the two.
- **Error safety**: every `authService.ts` function that can fail logs
  the real Supabase error via `console.error` (server-side only) and
  returns one of a small fixed set of safe strings — grepped for any
  place `error.message` or a caught error object might be returned/
  rendered directly; found none.
- **Logout**: `signOut()` calls `supabase.auth.signOut()` (invalidates
  the session server-side, not just a client-side token clear) via the
  server client, then `logoutAction` redirects to `/`.

**Not audited/tested** (see §0): whether Supabase Auth's actual
behavior (email confirmation requirement, rate limits, session
lifetime) matches what this code assumes — that depends entirely on
the connected project's Auth settings, which this environment can't
inspect. Treat the "check your email" success copy on `/signup` as
correct-by-design (it's accurate whether or not confirmation is
actually required) but everything downstream of an actual Supabase
response as unverified until tested against a real project.

## 9. Files changed / new

**New**
- `src/lib/validation/auth.ts`
- `src/lib/utils/safeRedirect.ts`
- `src/lib/services/authService.ts`
- `src/features/auth/actions.ts`
- `src/features/auth/components/AuthField.tsx`
- `src/features/auth/components/AuthShell.tsx`
- `src/features/auth/sections/SignUpForm.tsx`
- `src/features/auth/sections/LoginForm.tsx`
- `src/features/auth/sections/ForgotPasswordForm.tsx`
- `src/features/auth/sections/ResetPasswordForm.tsx`
- `src/app/login/page.tsx`
- `src/app/signup/page.tsx`
- `src/app/forgot-password/page.tsx`
- `src/app/reset-password/page.tsx`
- `src/app/auth/callback/route.ts`
- `MODULE-6-HANDOFF.md`

**Modified**
- `src/lib/auth/session.ts` — added `requireProfileOrRedirect`; no
  existing export changed.
- `src/components/layout/Header.tsx` — added `authState` prop and its
  rendering (desktop + mobile); scroll/mobile-menu behavior and every
  other prop/visual untouched.
- `src/app/layout.tsx` — became `async`, resolves `getCurrentProfile()`
  once, passes it to `Header`; no other change.
- `.env.example` — added `NEXT_PUBLIC_SITE_URL` (new requirement — see
  §10).

**Deleted**: none.

No marketing page (`/`, `/about`, `/services`, `/projects`, `/team`,
`/insights`) was touched, and no motion/design-token file was touched
— spec §25 fully respected.

## 10. Environment — one new variable

```
NEXT_PUBLIC_SITE_URL   — public, e.g. http://localhost:3000 in dev
                          or https://6stanza.com in production
```

Needed because `authService.ts` builds the `emailRedirectTo`/
`redirectTo` URLs Supabase puts in confirmation/recovery emails, and
has no other way to know this app's own public origin. Not previously
required by Module 5. Add it to whatever `.env.local`/deployment
environment already holds the three Module 5 Supabase variables.

## 11. Verification — actual results

```
$ npm install
npm error code E403
npm error 403 403 Forbidden - GET https://registry.npmjs.org/...
```

Nothing past this point could run — same as every prior module in this
session. Not run: lint, typecheck, build, dev server, or any flow in
the brief's §26 checklist. Stated plainly rather than claimed as
passing, per the brief's own instruction.
