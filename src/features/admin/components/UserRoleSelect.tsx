"use client";

import { useState, useTransition } from "react";
import { Select } from "@/components/ui/form/Field";
import { ErrorText } from "@/components/ui/form/Field";
import { updateUserRoleAction } from "@/features/admin/actions";
import type { ProfileRole } from "@/lib/supabase/database.types";
import { profileRoleValues } from "@/lib/validation/adminUser";

const ROLE_LABEL: Record<ProfileRole, string> = {
  user: "User",
  admin: "Admin",
};

/**
 * User management — the one interactive control that changes a role,
 * same shape as `StatusSelect.tsx`: optimistic-ish (reverts on
 * failure rather than trusting the browser's choice), reports
 * success/error inline, no full page reload.
 *
 * `isSelf` disables the control outright rather than letting the
 * request round-trip and fail — `updateUserRoleAction` already refuses
 * a self-role-change server-side (the real enforcement point; this is
 * just the UI reflecting that rule up front instead of making the
 * acting admin click it to find out).
 */
export function UserRoleSelect({
  userId,
  initialRole,
  isSelf,
}: {
  userId: string;
  initialRole: ProfileRole;
  isSelf: boolean;
}) {
  const [role, setRole] = useState<ProfileRole>(initialRole);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleChange(next: string) {
    const previous = role;
    const nextRole = next as ProfileRole;
    setRole(nextRole);
    setError(null);
    setJustSaved(false);

    startTransition(async () => {
      const result = await updateUserRoleAction({ userId, role: nextRole });
      if (!result.ok) {
        setRole(previous);
        setError(result.message);
        return;
      }
      setJustSaved(true);
    });
  }

  if (isSelf) {
    return (
      <span
        title="You can't change your own role."
        style={{ fontSize: "var(--text-small)", color: "var(--color-text-muted)" }}
      >
        {ROLE_LABEL[role]} (you)
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Select
        aria-label="User role"
        value={role}
        disabled={pending}
        onChange={(e) => handleChange(e.target.value)}
        className="w-auto min-w-[8rem]"
      >
        {profileRoleValues.map((value) => (
          <option key={value} value={value}>
            {ROLE_LABEL[value]}
          </option>
        ))}
      </Select>
      {pending ? (
        <span style={{ fontSize: "var(--text-caption)", color: "var(--color-text-muted)" }}>Saving…</span>
      ) : justSaved ? (
        <span style={{ fontSize: "var(--text-caption)", color: "var(--color-success)" }}>Role updated.</span>
      ) : error ? (
        <ErrorText>{error}</ErrorText>
      ) : null}
    </div>
  );
}
