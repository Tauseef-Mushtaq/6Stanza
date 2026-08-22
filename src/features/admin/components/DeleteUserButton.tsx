"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ErrorText } from "@/components/ui/form/Field";
import { deleteUserAction } from "@/features/admin/actions";

/**
 * User management — permanent account deletion. Same confirm-then-delete
 * shape as `DeleteTeamMemberButton.tsx`, but stays on `/admin/users`
 * afterward (there's no detail page to navigate away from — this only
 * ever renders inline in the user table) and uses `router.refresh()`
 * to re-render the server list without the deleted row, rather than
 * `router.push()`.
 *
 * `isSelf` disables the control outright — `deleteUserAction` already
 * refuses self-deletion server-side (the real enforcement point; see
 * `userManagementService.ts`), this just reflects that rule in the UI
 * instead of making the acting admin click through a confirmation only
 * to have it rejected.
 */
export function DeleteUserButton({ userId, isSelf }: { userId: string; isSelf: boolean }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (isSelf) {
    return (
      <span title="You can't delete your own account." style={{ fontSize: "var(--text-caption)", color: "var(--color-text-muted)" }}>
        —
      </span>
    );
  }

  function handleClick() {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await deleteUserAction({ userId });
      if (!result.ok) {
        setError(result.message);
        setConfirming(false);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleClick}
        loading={pending}
        style={{ borderColor: "var(--color-error)", color: "var(--color-error)" }}
      >
        {confirming ? "Confirm delete" : "Delete"}
      </Button>
      {confirming && !pending ? (
        <>
          <span style={{ fontSize: "var(--text-caption)", color: "var(--color-error)" }}>
            This permanently deletes the account and all associated access.
          </span>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="underline-offset-2 hover:underline"
            style={{ fontSize: "var(--text-caption)", color: "var(--color-text-muted)" }}
          >
            Cancel
          </button>
        </>
      ) : null}
      {error ? <ErrorText>{error}</ErrorText> : null}
    </div>
  );
}
