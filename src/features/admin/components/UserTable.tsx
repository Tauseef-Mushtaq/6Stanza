import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { UserRoleSelect } from "@/features/admin/components/UserRoleSelect";
import { DeleteUserButton } from "@/features/admin/components/DeleteUserButton";
import type { AdminUserRow } from "@/lib/services/userManagementService";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

/**
 * User management — the account list (spec: "change a user's role,
 * delete a user, and other essential related things"). Same
 * responsive treatment as `TeamMemberTable.tsx`/`ServiceTable.tsx`:
 * stacked cards below `md`, a real table at `md` and above. Fixed
 * columns — email, display name, role, joined, last sign-in — rather
 * than every field on the row, matching the rest of the admin area's
 * "table shows what you scan for, nothing needs a detail page" pattern
 * (there's no per-user detail page here; every action happens inline).
 */
export function UserTable({ users, currentUserId }: { users: AdminUserRow[]; currentUserId: string }) {
  if (users.length === 0) {
    return <EmptyState title="No users found." />;
  }

  return (
    <>
      {/* Mobile: stacked cards. Hidden at md and above. */}
      <ul className="flex flex-col gap-3 md:hidden">
        {users.map((user) => {
          const isSelf = user.id === currentUserId;
          return (
            <li
              key={user.id}
              className="flex flex-col gap-3 rounded-[var(--radius-lg)] border p-4"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="truncate" style={{ fontSize: "var(--text-body)", color: "var(--color-text-primary)" }}>
                    {user.email ?? "—"}
                  </span>
                  <span className="truncate" style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
                    {user.displayName ?? "No display name"}
                  </span>
                </div>
                <Badge tone={user.role === "admin" ? "brand" : "neutral"} variant="soft">
                  {user.role === "admin" ? "Admin" : "User"}
                </Badge>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span style={{ fontSize: "var(--text-caption)", color: "var(--color-text-muted)" }}>
                  Joined {formatDate(user.createdAt)} · Last sign-in {formatDate(user.lastSignInAt)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <UserRoleSelect userId={user.id} initialRole={user.role} isSelf={isSelf} />
                <DeleteUserButton userId={user.id} isSelf={isSelf} />
              </div>
            </li>
          );
        })}
      </ul>

      {/* Desktop: table. Hidden below md. */}
      <div className="hidden overflow-x-auto rounded-[var(--radius-lg)] border md:block" style={{ borderColor: "var(--color-border)" }}>
        <table className="w-full min-w-[820px] border-collapse text-left">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
              {["Email", "Name", "Role", "Joined", "Last sign-in", ""].map((heading) => (
                <th
                  key={heading}
                  className="whitespace-nowrap px-4 py-3 font-[var(--font-mono)] uppercase"
                  style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-secondary)" }}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isSelf = user.id === currentUserId;
              return (
                <tr
                  key={user.id}
                  className="transition-colors hover:bg-[var(--color-surface)]"
                  style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
                >
                  <td className="max-w-[16rem] truncate px-4 py-3" style={{ fontSize: "var(--text-small)" }}>
                    {user.email ?? "—"}
                  </td>
                  <td className="max-w-[12rem] truncate px-4 py-3" style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
                    {user.displayName ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <UserRoleSelect userId={user.id} initialRole={user.role} isSelf={isSelf} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3" style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3" style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
                    {formatDate(user.lastSignInAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <DeleteUserButton userId={user.id} isSelf={isSelf} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
