# MODULE 7A — HANDOFF

## Overview

Built the first authenticated admin area: `/admin` and `/admin/inquiries`,
server-side protected, letting an admin list, view, and update the
status of both `contact_inquiries` and `project_inquiries` rows. No
CMS, analytics, user management, or public-site changes.

## Routes

- `/admin` — redirects to `/admin/inquiries` (no dashboard homepage, per spec).
- `/admin/inquiries` — combined list of contact + project inquiries, with a `?status=` filter (All / New / In Progress / Resolved / Archived).
- `/admin/inquiries/contact/[id]` — contact inquiry detail + status control.
- `/admin/inquiries/project/[id]` — project inquiry detail (all structured fields) + status control.

## Architecture

Followed the Module 5 shape exactly:

```
Admin UI
  ↓
Server Action (features/admin/actions.ts) — mutations
  or
Server Component page — reads
  ↓
requireAdmin() / getCurrentProfile()+role check
  ↓
Service (lib/services/{contact,project}InquiryService.ts)
  ↓
Repository (lib/repositories/{contact,project}Inquiries.ts)
  ↓
Supabase (RLS-respecting server client, never the service-role client)
```

Reads (list/detail pages) call the service layer directly from Server
Components — no Server Action needed for a read. The one write path
(status update) goes through `updateInquiryStatusAction`, which calls
`requireAdmin()` first, validates the input with a zod schema, then
delegates to the service/repository layers. No Supabase queries live
inside any React component.

## Inquiry Management

- **List** (`InquiryTable`): Type / Name / Email / Company-Project / Status / Created. Full record is not exposed in the list — only in the detail view.
- **Filter** (`InquiryFilterTabs`): plain links to `?status=...`, so filtering happens as a server-side query (`listContactInquiriesForAdmin`/`listProjectInquiriesForAdmin` take an optional `status` argument), not client-side filtering of an already-fetched full list.
- **Detail**: contact inquiries show name/email/message/status/dates; project inquiries additionally show company, services (as badges), stage, timeline, budget — structured, not flattened into text.
- **Status update** (`StatusSelect`, client component + `updateInquiryStatusAction`): a `<select>` restricted to the four real enum values, submitted via `useTransition`, with inline "Saving…" / "Status updated." / error feedback and no full-page reload (`revalidatePath` refreshes the list + detail server data instead).

## Security

- **`requireAdmin()`** runs at the top of `updateInquiryStatusAction` — a normal authenticated user invoking the action directly (bypassing the UI) gets rejected before any service/repository code runs.
- **`/admin` layout** (`src/app/admin/layout.tsx`) resolves the current profile and redirects: no session → `/login?redirect=/admin`; authenticated non-admin → `/`. This is the actual role gate — middleware alone cannot check `profiles.role` without a database round trip.
- **`middleware.ts`**: added `/admin` to `PROTECTED_PREFIXES` (same list `/account` is already in) — an anonymous request is redirected before any Server Component runs, as defense-in-depth on top of the layout check.
- **RLS**: unchanged. `contact_inquiries`/`project_inquiries` already had `select`/`update` restricted to `is_admin()` from Module 5 (`0002_contact_inquiries.sql`, `0003_project_inquiries.sql`). Every repository call uses `createSupabaseServerClient()` (the anon-key, RLS-respecting client), never `lib/supabase/admin.ts` — so even a bug in `requireAdmin()` or the layout couldn't grant a write the database itself would refuse.

## Database

No new migration. The existing Module 5 schema and RLS policies already matched what this module needed (admin-only select/update, anon/authenticated insert-only). Only `src/lib/supabase/database.types.ts` was edited — see "Note on a pre-existing type-generator gap" below.

## Verification

Actually run in this environment:

- `npm install` — succeeded (441 packages; `package-lock.json` was out of sync with `package.json`, so `npm ci` failed and `npm install` was used instead to reconcile it — flagging this in case it wasn't intentional).
- `npx tsc --noEmit` — **zero errors, project-wide.**
- `npx eslint src` — **zero warnings or errors, project-wide.**
- `npm run build` — **succeeds**, including all new `/admin` routes (`/admin`, `/admin/inquiries`, `/admin/inquiries/contact/[id]`, `/admin/inquiries/project/[id]`) alongside every existing route. One unrelated advisory warning: Next.js 16 deprecates the `middleware.ts` file convention in favor of `proxy.ts` — not an error, and renaming the convention is outside this module's scope, so `middleware.ts` was left as-is beyond the `/admin` prefix addition.
- Supabase/RLS runtime checks (anonymous/non-admin/admin access, actual status-update behavior against a live database) — **not run**: no live Supabase project is connected in this sandbox (same limitation noted in earlier module handoffs). The RLS policies and `requireAdmin()`/layout logic were verified by code inspection only, not against a real database.

### Pre-existing bugs from earlier modules — fixed in this patch
While verifying, `tsc`/`build` also surfaced five bugs unrelated to inquiry management, left over from Modules 5B/6. Fixed here since they blocked a clean `npm run build`:

- **`src/app/signup/page.tsx`** — imported a non-existent `SignupForm` from a file whose actual export is also named `SignupForm` but the import statement had it wrong twice over (wrong file-name casing *and*, after correcting that, wrong exported-symbol casing: the file `SignUpForm.tsx` exports `SignupForm`, not `SignUpForm`). Fixed to `import { SignupForm } from "@/features/auth/sections/SignUpForm"`.
- **`src/features/auth/actions.ts`** — `ForgotPasswordForm.tsx`/`ResetPasswordForm.tsx` imported `forgotPasswordAction`/`resetPasswordAction`, neither of which existed. Added both as thin Server Action wrappers, matching the existing `signUpAction`/`signInAction` pattern.
- **`src/lib/services/authService.ts`** — added the `forgotPassword`/`resetPassword` functions those new actions call: `forgotPassword` calls Supabase's `resetPasswordForEmail` and always resolves `{ ok: true }` (matching `ForgotPasswordForm.tsx`'s existing "never confirm whether an account exists" behavior); `resetPassword` calls `updateUser({ password })` against the recovery session `/auth/callback` already establishes.
- **`src/lib/validation/auth.ts`** — added `forgotPasswordSchema` (email) and `resetPasswordSchema` (password + confirmPassword, with a `.refine()` match check) that those two service functions validate against, matching the existing `signUpSchema`/`signInSchema` pattern.
- **`src/features/auth/sections/ResetPasswordForm.tsx`** — two real type errors: it accessed `result.fieldErrors` without first narrowing on `result.ok` (the `{ ok: true }` branch of `AuthResult` has no `fieldErrors` field at all), and passed `result.message` (`string | undefined`) into a `string | null` state setter. Fixed both — narrowed with `!result.ok &&` before reading `fieldErrors`, and fell back to a generic message when `result.message` is undefined.

I did not touch `AuthShell`/`AuthField`/`LoginForm`/`SignUpForm.tsx` beyond the one import fix, and did not change any RLS/migration/session logic — this was strictly wiring up already-referenced, already-designed functions and fixing two type narrowing bugs, not a redesign of the auth flow (still out of scope per spec §18).

### Note on a pre-existing type-generator gap
`database.types.ts` is hand-written (no live Supabase project to generate from). The installed `@supabase/postgrest-js` version requires `Relationships: []` on every table and `Views`/`Functions` keys on the schema object for `Insert`/`Update`/`Row` types to resolve correctly — without them, every `.insert()`/`.update()` call resolved to `never` at the type level (a real compile error, caught while adding the new admin repository functions). Added those keys with empty values; this is a type-shape fix only, not a schema or behavior change.

## Remaining Work

For Module 7B and later:
- CMS (services/projects/team/insights CRUD)
- Analytics dashboard
- User management / permissions UI
- Bulk actions, advanced search, exports, email automation, notifications, CRM/customer portal
- Optional: migrate `middleware.ts` to the `proxy.ts` convention Next.js 16 now recommends (currently just a deprecation warning, not a build error)
