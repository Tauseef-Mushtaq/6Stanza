import type { Metadata } from "next";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { getCurrentProfile } from "@/lib/auth/session";
import { listUsersForAdmin } from "@/lib/services/userManagementService";
import { UserTable } from "@/features/admin/components/UserTable";
import { AdminErrorState } from "@/features/admin/components/AdminErrorState";

export const metadata: Metadata = { title: "Users" };

/**
 * User management (spec: "change a user role to admin, an admin role
 * to user, delete a user, and other related things that are
 * essential"). Server Component: the query runs through
 * `listUsersForAdmin` (`lib/services/userManagementService.ts`),
 * matching every other admin list page in this codebase — nothing
 * here talks to Supabase directly.
 *
 * Protection is layered exactly like every other `/admin` route:
 * `app/admin/layout.tsx` already redirects a non-admin before this
 * page's own code runs at all; `getCurrentProfile()` is called again
 * here purely to get the *current* admin's own id (`currentUserId`),
 * which `UserTable`/`UserRoleSelect`/`DeleteUserButton` need to disable
 * self-role-change and self-delete in the UI — not as a second
 * authorization check (the layout already did that; `updateUserRoleAction`/
 * `deleteUserAction` enforce the same self-protection server-side
 * regardless of what this page passes down, see
 * `userManagementService.ts`).
 */
export default async function AdminUsersPage() {
  const [profile, result] = await Promise.all([getCurrentProfile(), listUsersForAdmin()]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel>Admin</TechnicalLabel>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-[var(--font-display)]" style={{ fontSize: "var(--text-h2)", color: "var(--color-text-primary)" }}>
            Users
          </h1>
        </div>
        <p style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
          Change a user&rsquo;s role or permanently delete an account. You can&rsquo;t change your own role or delete your
          own account here — ask another admin if that&rsquo;s genuinely needed.
        </p>
      </div>

      {!result.ok || !profile ? (
        <AdminErrorState title="Unable to load users." message={!result.ok ? result.message : "Session expired."} />
      ) : (
        <UserTable users={result.data} currentUserId={profile.id} />
      )}
    </div>
  );
}
