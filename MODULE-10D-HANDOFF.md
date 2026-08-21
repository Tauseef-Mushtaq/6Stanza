# MODULE 10D — AUTHENTICATION & START PROJECT FORM FEEDBACK

## A. Authentication audited

- **Login** (`src/app/(site)/login/page.tsx`, `src/features/auth/sections/LoginForm.tsx`, `src/features/auth/actions.ts` → `src/lib/services/authService.ts`). Client component, `useState`-driven `idle/submitting/error` machine, calls `signInAction` → `signIn()`. Already returned a structured `AuthResult` (`{ ok: true } | { ok: false, fieldErrors } | { ok: false, message }`) with provider errors pre-mapped to safe strings in `authService.mapAuthError`.
- **Signup** (`SignupForm.tsx` → `signUpAction` → `signUp()`). Same shape, plus an explicit `success` status that renders an inline confirmation screen instead of redirecting — correct given the app can't know at build time whether the Supabase project has email confirmation on.
- **Sign out**. Two entry points into the same underlying action: `LogoutButton.tsx` (client, `useTransition`, used on `/account` and the admin nav) and a plain `<form action={logoutAction}>` in `Header.tsx` (progressive-enhancement form action, no client JS). Both go through `signOutAction` in `src/features/auth/actions.ts`.
- **Auth callback** (`src/app/(site)/auth/callback/route.ts`). Route Handler exchanging a Supabase `?code=` for a session; already redirected to `/login?error=confirmation_failed` on failure and logged the raw error server-side only.

## B. Authentication states

| Flow | Loading | Validation error | Auth error | Success | Redirect |
|---|---|---|---|---|---|
| Login | `Button loading` → "Signing in…" | Inline field errors under Email/Password | Safe message from `mapAuthError` (e.g. "Invalid email or password.") | — (redirect is the success signal) | `?redirect=` target from middleware, falls back to `/account` |
| Signup | `Button loading` → "Creating account…" | Inline field errors (Full Name/Email/Password) | Safe message (e.g. "This email is already registered.") | Inline "Almost there." confirmation screen | User clicks through to `/login` |
| Sign out | `LogoutButton`: "Signing out…" via `useTransition`. `Header.tsx` form action: plain navigation, no extra loading UI added (browser navigates immediately — spec §12's "smallest appropriate improvement" case) | — | New: safe message via `/login?error=sign_out_failed` (see Fix 1 below) | Redirect to `/` | `/` on success, `/login?error=sign_out_failed` on failure |
| Auth callback | N/A (server redirect, no client render in between) | — | Redirects to `/login?error=confirmation_failed`; login page now actually renders that message (see Fix 2) | Redirects to `?next=` target or `/account` | — |

## C. Start Project states

| State | Behavior |
|---|---|
| Loading/submitting | `Button loading` → "Sending…", duplicate-submit guarded (see Fix 5) |
| Validation | Client-side `validateInquiry` blocks submission with inline field errors; server re-validates independently via `projectInquirySchema` (same rules, not trusted from the client alone) |
| Server failure | Inline banner (`role="alert"`) now shows the actual safe message from the service (e.g. "Unable to submit your inquiry. Please try again.") instead of one hardcoded string for every failure (see Fix 4) |
| Success | Form is replaced by `SuccessState.tsx` — a full confirmation view with links back into the site, not a silent no-op |
| Reset | N/A — success is handled by unmounting the form entirely (`StartProjectPageContent.tsx`), so there's no stale form to reset |
| Duplicate prevention | Explicit `if (status === "submitting") return;` guard plus disabled/`aria-busy` button state |

## D. Security

- No credentials, tokens, session cookies, or Supabase keys are logged to the client or rendered in any UI added/touched this module.
- All provider/database errors are still caught server-side (`authService.ts`, `projectInquiryService.ts`) and reduced to predefined safe strings before crossing the Server Action boundary — this module did not change that contract, only made sure the safe strings that were already being computed actually reach the user instead of being dropped (Fixes 2 and 4).
- No new client-side privileged Supabase client was introduced; no existing server-side auth architecture was changed. `signOutAction`'s behavior change is additive (an `if` branch before the existing `redirect("/")`), not a rearchitecture.
- Query-parameter-driven messages (`?error=`, `?reset=`) are matched against a fixed, known set of codes in `noticeFromParams` (`login/page.tsx`) and mapped to hardcoded strings — the raw parameter value is never rendered.

## E. Accessibility

- `ErrorText` (shared `components/ui/form/Field.tsx`) already used `role="alert"`; Start Project's `FormField.tsx` error paragraphs use the same pattern.
- Fixed a real accessibility bug: `FormField.tsx`'s inputs set `aria-describedby={fieldId}-error` but the error `<p>` never had that `id`, so the association was broken for every Start Project field. Now `id={htmlFor}-error"` is set on the error paragraph.
- Submit buttons across Login, Signup, and Start Project use the shared `Button` component's `loading` prop, which sets `aria-busy` and `disabled` together.
- Login's new notice banner uses `role="status"` for the success case (password-reset confirmation) and reuses `ErrorText` (`role="alert"`) for error cases, so both are announced appropriately without double-announcing on every keystroke.
- Keyboard flow, focus states, and label association were not touched outside the one bug fixed above — nothing here was redesigned.

## F. Verification

### Static audit (run against `src/app`, `src/features`, `src/lib` scoped to auth + Start Project)
- `rg "startTransition"` — only `LogoutButton.tsx` and the (out-of-scope) admin components use it; consistent with spec.
- `rg "console\.error"` — every hit in `authService.ts`, `projectInquiryService.ts`, and `auth/callback/route.ts` logs server-side only and is paired with a safe value returned to the caller. No hit renders the raw error to a client.
- `rg "catch\s*\("` — every `catch` in the auth/Start Project scope (`ResetPasswordForm.tsx`, `ProjectForm.tsx`, `projectInquiryService.ts` ×4) sets a user-facing error state; none are empty/silent.
- `rg "Signing in|Creating account|Submitting|Sending|Signing out"` — confirms the pending-state copy exists exactly where expected (Login, Signup, Start Project, Logout, and the out-of-scope `ForgotPasswordForm.tsx`).
- Manually re-read every edited file in full (in lieu of a type-checker — see below) to check for the usual mistakes: unclosed JSX, mismatched prop types, unreachable code after `redirect()`. No issues found.

### Browser / live Supabase tests
**Not run.** This container has no reachable Supabase project and no browser runtime attached to this task — nothing in section 34 was exercised end-to-end. Do not treat anything in sections B/C above as browser-verified; it's derived from reading the code paths.

### Failure testing
**Not run**, for the same reason — no live backend to trigger real invalid-credential/duplicate-signup/expired-callback/inquiry-insert-failure conditions against.

### lint / typecheck / build
**Not run.** `npm install` failed in this environment:

```
npm error code E403
npm error 403 403 Forbidden - GET https://registry.npmjs.org/zustand/-/zustand-5.0.15.tgz
```

Network egress to the npm registry is blocked here, so `node_modules` never populated and `npm run lint`, `npx tsc --noEmit`, and `npm run build` could not be run. This is an environment limitation, not a result — no lint/typecheck/build output is claimed or fabricated. These commands should be run in an environment with registry access before merging:

```bash
npm install
npm run lint
npx tsc --noEmit
rm -rf .next
npm run build
```

The previously-documented pre-existing `src/app/layout.tsx` / `LayoutProps` TypeScript issue (see MODULE-10A/10B/10C handoffs) was not re-verified for the same reason — assume it remains open until a typecheck is actually run.

## G. Fixes made this module (file list)

1. `src/features/auth/actions.ts` — `signOutAction` now checks `signOut()`'s result and redirects to `/login?error=sign_out_failed` on failure instead of silently redirecting to `/` regardless of outcome.
2. `src/app/(site)/login/page.tsx` — reads `?error=` / `?reset=` and maps them to a safe, predefined notice via `noticeFromParams`, passed to `LoginForm`. Previously these params were set by `/auth/callback` and `resetPasswordAction` but never read, so both messages silently disappeared.
3. `src/features/auth/sections/LoginForm.tsx` — renders the notice banner from (2); added an explicit `if (status === "submitting") return;` duplicate-submit guard; switched the submit button to the shared `Button loading` prop.
4. `src/features/auth/sections/SignupForm.tsx` — same duplicate-submit guard and `Button loading` switch as (3).
5. `src/features/start-project/sections/ProjectForm.tsx` — catch block now uses the safe message thrown by `submitInquiry` (`err.message`) instead of one hardcoded string for every failure; added the same duplicate-submit guard; switched to `Button loading`.
6. `src/features/start-project/components/FormField.tsx` — error `<p>` now actually has the `id` (`${htmlFor}-error`) that inputs' `aria-describedby` already pointed to.

No files outside this list were modified. No CMS, media, user-role, or unrelated code was touched.

## Remaining work

- **lint / typecheck / build must be run** in an environment with npm registry access — none of the three could be executed here (see §F).
- **Browser and live-backend testing** (section 34/35 of the module spec) has not been performed — do that against a real Supabase project before considering this module fully verified.
- User-role management, `/admin/users`, CMS changes, and media upload architecture remain **explicitly out of scope** and were not touched, per the module brief.
- Module 10E (media/gallery operation states) has **not** been started, per instruction.
