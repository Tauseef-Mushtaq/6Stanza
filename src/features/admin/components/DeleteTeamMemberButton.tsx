"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ErrorText } from "@/components/ui/form/Field";
import { deleteTeamMemberAction } from "@/features/admin/actions";

/**
 * Module 9M — permanent deletion for a team member (spec §17/§19/§21).
 * `deleteTeamMemberAction` deletes the `team_members` row and
 * best-effort cleans up the associated portrait Storage object, then
 * revalidates `/` and `/team` (both real public consumers of Team
 * data) in addition to the admin list. Same shape as
 * `DeleteServiceButton`.
 */
export function DeleteTeamMemberButton({ id }: { id: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await deleteTeamMemberAction(id);
      if (!result.ok) {
        setError(result.message);
        setConfirming(false);
        return;
      }
      router.push("/admin/team");
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
            This will permanently delete this team member.
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
