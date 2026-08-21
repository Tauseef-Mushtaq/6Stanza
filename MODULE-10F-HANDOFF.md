# MODULE 10F — ROUTE ERRORS / FAILURE / SECURITY QA

## 0. Environment note — verification NOT run

Same limitation as every module since Frontend Stabilization Part 2:
this sandbox has no npm registry access.

```
npm error code E403
npm error 403 403 Forbidden - GET https://registry.npmjs.org/zustand/-/zustand-5.0.15.tgz
```

`npm run lint`, `npx tsc --noEmit`, `npm run build`, and `npm run dev`
were **not run**. Every change below was hand-reviewed (brace/paren
balance checked programmatically across all five touched files —
all balanced; imports/exports traced manually) but is not
compiler-verified. This is now true of a large and growing portion of
the codebase — running the full verification suite in a networked
environment is the single highest-priority remaining task (see the
"Verification debt" note at the end of this file).

## A. What was audited

- `src/middleware.ts` — route protection, redirect construction.
- `src/app/(site)/auth/callback/route.ts` — the OAuth/email-confirmation
  redirect handler.
- `src/app/(site)/login/page.tsx` — `?redirect=` param handling.
- `src/app/error.tsx`, `global-error.tsx`, `not-found.tsx` — error/404
  boundary content, for information disclosure.
- `src/app/admin/layout.tsx` and every `src/features/admin/actions.ts`
  Server Action — authorization boundaries.
- Every public dynamic route (`/services/[slug]`, `/projects/[slug]`,
  `/insights/[slug]`) and admin `[id]` route — not-found vs. error vs.
  unauthorized handling.
- `src/lib/validation/{contactInquiry,projectInquiry}.ts` and their
  services — spam/bot protection.
- `next.config.ts` — response headers.

## B. Bugs found and fixed

### B1. Open redirect via `/auth/callback?redirect=`

`route.ts` took the `redirect` query param and used it directly in
`NextResponse.redirect(\`${origin}${redirectTo}\`)` with **no
validation at all**. An attacker could send a victim a link like
`/auth/callback?code=...&redirect=https://evil.example` (or a
protocol-relative `//evil.example`) and, on a successful code
exchange, the app would redirect the authenticated session straight
to an attacker-controlled origin — a classic post-auth open redirect,
useful for credential/session phishing.

A validator for exactly this (`safeRedirectPath`,
`src/lib/utils/safeRedirect.ts`) already existed in the codebase but
was **never imported or called anywhere** — dead code from an earlier
module. Wired it in here.

### B2. Incomplete open-redirect guard on `/login`

`src/app/(site)/login/page.tsx` computed
`redirect && redirect.startsWith("/") ? redirect : "/account"`. This
blocks `https://evil.example` but **not** a protocol-relative URL like
`//evil.example` — that also starts with `"/"`, and browsers resolve
a leading `//` as "same scheme, different host," so it's a full
external redirect. Same root cause as B1, different call site.

**Fix (both B1 and B2):** both now call the existing
`safeRedirectPath(raw, fallback)` — which rejects anything not
starting with a single `/`, anything starting with `//`, and anything
containing `://` — instead of each maintaining its own (and, in one
case, incorrect) inline check. One validator, two call sites, spec's
"the redirect destination must be validated as an internal/safe path"
now actually enforced everywhere `redirect` params are consumed.

### B3. Honeypot field defined but never wired to any form

`projectInquirySchema` (`src/lib/validation/projectInquiry.ts`) and
`submitProjectInquiry` (`src/lib/services/projectInquiryService.ts`)
already implement a honeypot: a `website` field that must be empty,
with a soft-accept-and-drop response if it's filled (so a bot doesn't
learn its submission was rejected). Both files' own comments noted
"No UI currently sets this." `ProjectForm.tsx` (the only form this
schema is ever submitted from — `/contact` deliberately has no form,
per Module 5's handoff) never rendered the field, so the entire
mechanism was inert — every bot submission reached the database
exactly as if the check didn't exist.

**Fix:** added `website?: string` to `ProjectInquiry`
(`src/features/start-project/data/inquiry.ts`, defaults to `""`), and
a hidden, off-screen, `tabIndex={-1}`, `autoComplete="off"` text input
in `ProjectForm.tsx` bound to it. Visually and from assistive
technology it's unreachable (positioned off-screen rather than
`display:none`/`hidden`, since some bots specifically skip those two
patterns); a real visitor never touches it. No validation/service-layer
change was needed — the backend half of this was already correct.

### B4. No baseline security response headers

`next.config.ts` set no headers at all — every response was missing
`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and
`Permissions-Policy`. Notably this includes `/admin`: nothing prevented
the admin UI from being framed by another origin (clickjacking surface
on top of the existing session-cookie auth).

**Fix:** added a `headers()` function applying
`X-Content-Type-Options: nosniff`,
`X-Frame-Options: DENY`,
`Referrer-Policy: strict-origin-when-cross-origin`, and a conservative
`Permissions-Policy` (camera/microphone/geolocation off) to every
route. **Deliberately did not add a `Content-Security-Policy`** — this
app uses inline styles throughout (design-token `style={{ ... }}`
props) and Next's own hydration script; a CSP written without a real
browser to iterate against console violations is more likely to
silently break the app (styles/scripts get blocked, nothing throws a
compile error) than to add verified protection. Flagged in Remaining
Work below as the next security item once a live environment exists.

## C. Audited, found already correct — no changes made

- **Admin authorization** (`src/app/admin/layout.tsx` +
  `src/middleware.ts` + `requireAdmin()` in every Server Action) —
  three independent layers (middleware session check, layout role
  check, Server Action `requireAdmin()` + RLS), consistent with prior
  modules' documented defense-in-depth design. No gap found; a normal
  authenticated non-admin cannot reach any admin page or successfully
  invoke any admin Server Action directly.
- **Error boundaries** (`error.tsx`, `global-error.tsx`) — both already
  route every thrown error through `getSafeErrorMessage`, which only
  ever returns a message explicitly marked safe by the thrower;
  `error.message` (which could contain Postgres/PGRST codes, RLS
  policy names, stack fragments) is never rendered. `console.error`
  logging is server/console-side only. No change needed.
- **`not-found.tsx`** — already generic; doesn't distinguish "route
  never existed" from "record exists but is draft/archived," so a
  not-yet-published CMS record can't be probed for/confirmed by
  requesting its slug directly. No change needed.
- **Public dynamic routes** (`/services/[slug]`, `/projects/[slug]`,
  `/insights/[slug]`) — each already separates a query *failure*
  (thrown → generic `error.tsx`, safe message) from *not found*
  (`notFound()` → generic `not-found.tsx`) — a failure is never
  reported as a 404, per the Module 10B work this builds on. Confirmed
  still correct; no regressions from anything touched here (none of
  these files were edited).
- **Admin `[id]` routes** — same "not `ok` → `AdminErrorState`, `ok`
  but record missing → `notFound()`" pattern confirmed across all four
  content types (`team`, `services`, `projects`, `insights`) and both
  inquiry detail routes. Consistent, no outliers found.
- **Server Action results never leak raw errors** — every mutating
  action in `src/features/admin/actions.ts` and the public inquiry
  actions returns a pre-validated `{ ok, message }`/`{ ok, fieldErrors }`
  shape; confirmed (again, as in Module 10C's audit) that no
  `console.error`-only silent-failure path exists anywhere in
  `src/features/admin` or `src/features/start-project`.
- **File upload validation** (`src/lib/validation/media.ts`) — MIME
  type and size are checked server-side (not just client-side), stored
  filenames are always server-generated from the validated MIME type,
  never derived from the browser-supplied original filename. No
  path-traversal or content-type-spoofing surface found.
- **Middleware's own `redirect` param** (the one it *sets*, in
  `loginUrl.searchParams.set("redirect", pathname)`) — `pathname` here
  comes from `request.nextUrl.pathname`, not user-supplied query/body
  data, so it's already a safe same-origin path by construction; no
  double-encoding or injection surface. (This is the value that then
  flows into B1/B2's now-fixed validation on the way back out.)

## D. Files changed

**Modified**
- `src/app/(site)/auth/callback/route.ts` — B1 fix.
- `src/app/(site)/login/page.tsx` — B2 fix.
- `src/features/start-project/data/inquiry.ts` — B3, `website` field.
- `src/features/start-project/sections/ProjectForm.tsx` — B3, hidden
  honeypot input.
- `next.config.ts` — B4, baseline security headers.

No files deleted. No design, copy, CMS, database, or unrelated
behavior changes — every edit above is a security/robustness fix,
each independently reviewed for brace/paren balance and import
correctness (see §0).

## E. Verification

- **Static audit performed** (see §A/§B/§C) — traced every `redirect`/
  `redirectTo` query-param consumer to confirm both are now validated
  identically; confirmed `safeRedirectPath` (pre-existing, previously
  unused) is now imported and called at both sites; confirmed the new
  `website` field flows `ProjectForm` state → `submitInquiry` →
  `submitProjectInquiryAction` → `submitProjectInquiry`'s existing
  honeypot check unchanged.
- **Brace/paren balance** — checked programmatically for all five
  touched files (§0) — all balanced.
- **NOT run:** `npm run lint`, `npx tsc --noEmit`, `npm run build`,
  `npm run dev`, browser testing, live-backend testing. Same
  environment limitation as every module since Frontend Stabilization
  Part 2 (§0).

## F. Remaining work

- **Run the full verification suite** (`npm install && npm run lint
  && npx tsc --noEmit && npm run build && npm run dev`) in an
  environment with npm registry access. This is now overdue across
  several modules, not just this one — see "Verification debt" below.
- **Iterate a real `Content-Security-Policy`** against a live browser
  session once available (§B4) — deliberately not attempted blind here.
- **Manually verify the open-redirect fix** in a browser: attempt
  `/login?redirect=//evil.example` and `/auth/callback?redirect=https://evil.example`
  (with a valid `code`) and confirm both now land on `/account`, not
  the external host.
- **Test the honeypot** against a real automated form-fill (or by
  manually setting the hidden field's value via devtools and
  submitting) to confirm the submission is silently dropped rather
  than inserted.
- The previously-documented pre-existing `src/app/layout.tsx` /
  `LayoutProps` TypeScript issue (open since Module 10A) was not
  re-checked here for the same reason as everything else in §0 —
  still assume it's open.
- Module 10G (Final Production QA) has not been started.

### Verification debt (flagging clearly, across modules)

Every module from Frontend Stabilization Part 2 through this one
(Part 2, 9K, 9M, 9N, 10A′–10E, 10F) has shipped changes that were
hand-reviewed but never compiled, linted, or run. That's a large
enough span of unverified work that a full `npm install && npm run
lint && npx tsc --noEmit && npm run build` pass — in an environment
with actual registry access — should be treated as blocking before
any further feature work, not just as a checklist item at the end of
10G. If it surfaces type errors, they could be anywhere in that span.
