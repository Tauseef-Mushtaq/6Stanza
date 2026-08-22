import "server-only";

import { listAllProfiles, updateProfileRole } from "@/lib/repositories/profiles";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ProfileRole } from "@/lib/supabase/database.types";
import { toAdminErrorMessage } from "./cmsContentTypes";

/**
 * User management — admin-facing list/role-change/delete for every
 * account. Two Supabase clients are involved, deliberately kept
 * separate per `lib/supabase/admin.ts`'s own rules:
 *
 * - `listAllProfiles`/`updateProfileRole` (`lib/repositories/profiles.ts`)
 *   use the ordinary RLS-respecting server client — the
 *   `profiles_select_own_or_admin`/`profiles_update_own_or_admin`
 *   policies already let an admin session see and edit every row, so
 *   no privileged client is needed for those two operations.
 * - Reading a user's **email** and **deleting a user** both require
 *   `auth.users`, which only Supabase's Auth Admin API can reach — the
 *   genuinely privileged case `admin.ts`'s own doc comment reserves
 *   the service-role client for. Used nowhere else in this file.
 *
 * Every exported function here assumes its caller (`features/admin/actions.ts`)
 * has already run `requireAdmin()`, matching every other admin service
 * in this codebase (`teamContentService.ts` etc. — see that file's own
 * note). `actingAdminId` is passed in by the caller from that same
 * `requireAdmin()` call, purely to support the self-protection checks
 * below — this file does not re-derive or re-check who's calling it.
 */

export interface AdminUserRow {
  id: string;
  email: string | null;
  displayName: string | null;
  role: ProfileRole;
  createdAt: string;
  lastSignInAt: string | null;
}

export type AdminUserListResult = { ok: true; data: AdminUserRow[] } | { ok: false; message: string };
export type AdminUserMutationResult = { ok: true } | { ok: false; message: string };

/**
 * Every `auth.users` row, paginated internally. Supabase's Admin API
 * caps a single `listUsers` call at 1000 users/page; this loops until
 * a page comes back short (the normal end-of-results signal) or a
 * generous 20-page (20,000 user) ceiling, whichever comes first — a
 * hard cap so a runaway loop can't hang a request indefinitely if the
 * API's pagination ever behaves unexpectedly.
 */
async function listAllAuthUsers() {
  const supabase = getSupabaseAdminClient();
  const perPage = 1000;
  const users: Array<{ id: string; email: string | null; created_at: string; last_sign_in_at: string | null }> = [];

  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    users.push(
      ...data.users.map((u) => ({
        id: u.id,
        email: u.email ?? null,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at ?? null,
      }))
    );
    if (data.users.length < perPage) break;
  }

  return users;
}

/**
 * Combined admin-facing user list — every `auth.users` row (for email
 * + sign-in metadata) left-joined in memory against `profiles` (for
 * role/display name). An auth user with no profile row yet (shouldn't
 * happen once `handle_new_user` has run, but the join doesn't assume
 * it) falls back to `role: "user"` and a `null` display name rather
 * than being dropped from the list — an admin should always be able to
 * see every account that can sign in, even one in an inconsistent
 * state.
 */
export async function listUsersForAdmin(): Promise<AdminUserListResult> {
  try {
    const [authUsers, profiles] = await Promise.all([listAllAuthUsers(), listAllProfiles()]);
    const profileById = new Map(profiles.map((p) => [p.id, p]));

    const data: AdminUserRow[] = authUsers.map((u) => {
      const profile = profileById.get(u.id);
      return {
        id: u.id,
        email: u.email,
        displayName: profile?.display_name ?? null,
        role: profile?.role ?? "user",
        createdAt: u.created_at,
        lastSignInAt: u.last_sign_in_at,
      };
    });

    data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return { ok: true, data };
  } catch (error) {
    console.error("listUsersForAdmin: query failed", error);
    return { ok: false, message: toAdminErrorMessage("load users") };
  }
}

/**
 * Changes a user's role. Refuses to change the calling admin's own
 * role — without this, an admin could demote themselves (or the last
 * remaining admin) and lock every admin out of `/admin` with no way
 * back in short of direct database access, since nothing else in this
 * codebase can grant the role back. This is an intentional product
 * decision (spec: "essential" user-management safeguards), not a rule
 * the database itself enforces — `profiles_enforce_role_immutable`
 * only asks "is the caller an admin," not "is the caller changing
 * their own row."
 */
export async function updateUserRoleForAdmin(
  actingAdminId: string,
  targetUserId: string,
  role: ProfileRole
): Promise<AdminUserMutationResult> {
  if (targetUserId === actingAdminId) {
    return { ok: false, message: "You can't change your own role." };
  }

  try {
    await updateProfileRole(targetUserId, role);
    return { ok: true };
  } catch (error) {
    console.error("updateUserRoleForAdmin: update failed", error);
    return { ok: false, message: toAdminErrorMessage("update this user's role") };
  }
}

/**
 * Permanently deletes a user via the Auth Admin API. This removes the
 * `auth.users` row outright, which cascades to `profiles` (`on delete
 * cascade`, `0001_profiles.sql`) and to every table with a
 * user-scoped foreign key — there is no soft-delete/archive concept
 * for accounts the way there is for CMS content, since a deleted
 * `auth.users` row can no longer authenticate by definition.
 *
 * Refuses to delete the calling admin's own account for the same
 * lock-yourself-out reason `updateUserRoleForAdmin` refuses a
 * self-role-change — deleting your only way into `/admin` isn't
 * something a misclick should be able to do.
 */
export async function deleteUserForAdmin(actingAdminId: string, targetUserId: string): Promise<AdminUserMutationResult> {
  if (targetUserId === actingAdminId) {
    return { ok: false, message: "You can't delete your own account." };
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.auth.admin.deleteUser(targetUserId);
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    console.error("deleteUserForAdmin: delete failed", error);
    return { ok: false, message: toAdminErrorMessage("delete this user") };
  }
}
