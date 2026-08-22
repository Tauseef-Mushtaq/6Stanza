# MODULE — USER MANAGEMENT

## 0. Environment note — verification NOT run

Same limitation as every module since Frontend Stabilization Part 2 —
no npm registry access in this sandbox. Every file below was
hand-reviewed (brace/paren balance checked programmatically — all
balanced) but not compiled, linted, or run against a live Supabase
project. Given this module reaches the Supabase Auth Admin API (new
territory — no prior module used `auth.admin.*`), **live testing
before trusting this in production is more important than usual.**
See §E.

## A. What this adds

A new `/admin/users` page: list every account, change a user's role
between `user`/`admin`, and permanently delete an account — the three
things asked for, plus the "other essential related things" a real
user-management screen needs:

- **Self-protection.** An admin can't change their own role or delete
  their own account, in the UI (the control is disabled/hidden) and
  independently enforced server-side (the request is rejected even if
  called directly). Reasoning: nothing else in this codebase can
  re-grant the admin role once it's gone — there's no seed script, no
  "first user is admin" bootstrap, no secondary recovery path. An
  admin locking themselves out (accidentally or via a compromised
  session) is a wholly avoidable failure mode, not an edge case.
- **Full account list, not just profiles.** `auth.users` (email,
  joined date, last sign-in) is joined against `profiles`
  (role, display name) so the list shows who someone actually *is*,
  not just an opaque UUID and a role.
- **Real deletion, not a soft-delete.** Goes through Supabase's Auth
  Admin API (`auth.admin.deleteUser`), which removes the `auth.users`
  row outright — the account can no longer authenticate, full stop.
  This is different from every other "delete" in the admin area
  (services/projects/team/insights all support archive-first,
  soft-delete-style workflows) because a user account isn't content;
  there's no meaningful "archived but can still log in" state to
  preserve.

## B. Design decisions worth knowing about

### B1. Why two Supabase clients

`lib/repositories/profiles.ts` uses the ordinary RLS-respecting
server client — the existing `profiles_select_own_or_admin`/
`profiles_update_own_or_admin` policies (`0001_profiles.sql`) already
let an admin session read and update every profile row, so no
privileged client is needed there.

Reading a user's **email** and **deleting a user**, though, both
require `auth.users`, which only the Auth Admin API can reach — RLS
doesn't apply to `auth.users` at all, and there's no public-schema
view of it. `lib/services/userManagementService.ts` is the only place
in this module that imports `getSupabaseAdminClient()`
(`lib/supabase/admin.ts`), exactly the "genuinely privileged
operation RLS can't express" case that file's own doc comment reserves
the service-role client for. Every other read/write in this module
goes through the RLS-respecting client.

### B2. `profiles.Update`'s `role` field

The `Update` type on `profiles` previously excluded `role` on purpose
— its own comment said role changes belong to "the future admin
module's own privileged path." This module *is* that path, so `role`
was added back to the type (`src/lib/supabase/database.types.ts`).
This is a type-level change only — the actual enforcement is still
`profiles_enforce_role_immutable` (the database trigger from
`0001_profiles.sql`), which independently raises unless the calling
session is `is_admin()` regardless of what the TypeScript type
permits. Widening the type didn't widen what the database allows.

### B3. Pagination on `listUsers`

Supabase's Admin API paginates `auth.admin.listUsers()` at up to 1000
users/page. `listAllAuthUsers()` (`userManagementService.ts`) loops
pages until one comes back short, with a hard 20-page (20,000 user)
ceiling so a pagination edge case can't hang a request indefinitely.
Fine for a project at this stage; if the user base ever gets large
enough for this to matter, the page will need real pagination/search
UI rather than one big list — noted, not built, since there's no
signal yet that it's needed.

### B4. No detail page

Unlike services/projects/team/insights, there's no `/admin/users/[id]`
— every action (role change, delete) happens inline in the table, the
same way `StatusSelect` works inline in the inquiries table. A user
account doesn't have enough editable fields (there's nothing here to
"edit" beyond role) to justify a separate form page.

## C. Files changed

**Added**
- `src/lib/validation/adminUser.ts` — role/id validation schemas.
- `src/lib/repositories/profiles.ts` — `profiles` table data access.
- `src/lib/services/userManagementService.ts` — the service layer
  described in §B1; also where the self-protection checks (§A) live.
- `src/features/admin/components/UserRoleSelect.tsx` — inline role
  dropdown, same shape as `StatusSelect.tsx`.
- `src/features/admin/components/DeleteUserButton.tsx` — confirm-then-
  delete button, same shape as `DeleteTeamMemberButton.tsx`.
- `src/features/admin/components/UserTable.tsx` — the list itself,
  same responsive card/table pattern as `TeamMemberTable.tsx`.
- `src/app/admin/users/page.tsx` — the page.

**Modified**
- `src/features/admin/actions.ts` — added `updateUserRoleAction`/
  `deleteUserAction`, same `requireAdmin() → validate → service`
  Server Action pattern as every existing action in this file.
- `src/features/admin/components/AdminNav.tsx` — added a "Users" nav
  link.
- `src/lib/supabase/database.types.ts` — see §B2.

No files deleted. No changes to any existing table's schema — this
module reads/writes `profiles` (existing table) and `auth.users`
(via the Admin API, not a schema change).

## D. Required setup before this works

`SUPABASE_SERVICE_ROLE_KEY` must be set in the deployed environment
(same variable `lib/supabase/admin.ts` already documented as required
for the "admin module, Module 6+" — this is that module). Without it,
`/admin/users` will show the generic "Unable to load users" error
state (`getSupabaseAdminClient()` throws synchronously if the env var
is missing, which `listUsersForAdmin`'s try/catch turns into that safe
message rather than a raw error).

## E. Verification

- **Static audit performed** — brace/paren balance checked for every
  new/modified file (§0), all balanced. Traced the self-protection
  checks end-to-end (UI disables the control → action still validates
  → service still refuses) for both role-change and delete.
- **NOT run:** `npm run lint`, `npx tsc --noEmit`, `npm run build`,
  and — more important than usual for this module — **no live test
  against a real Supabase project's Auth Admin API.** Before relying
  on this:
  1. Confirm `SUPABASE_SERVICE_ROLE_KEY` is set.
  2. Load `/admin/users` as an admin and confirm the list shows real
     emails/roles/sign-in dates.
  3. Change a *different* user's role to `admin`, confirm the
     `profiles.role` column actually updates and that user can then
     reach `/admin`.
  4. Confirm your own row shows "(you)" with the role select replaced
     by disabled text, and the delete button replaced by "—".
  5. Delete a test (non-self) account and confirm both the
     `auth.users` row and its cascaded `profiles` row are gone, and
     that account can no longer log in.
  6. Attempt calling `updateUserRoleAction`/`deleteUserAction` on your
     own id directly (not just via the disabled UI) to confirm the
     server-side refusal actually fires — the UI disabling the control
     is a courtesy, not the real boundary.
