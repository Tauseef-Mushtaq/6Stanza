"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ErrorText } from "@/components/ui/form/Field";
import { archiveInsightAction } from "@/features/admin/actions";

/**
 * Module 9E — archive action for an insight (spec §21), same
 * click-to-arm / click-to-confirm shape as `ArchiveTeamMemberButton.tsx`
 * / `ArchiveServiceButton.tsx` / `ArchiveProjectButton.tsx`. Never
 * deletes the row: calls `archiveInsightAction`, which only ever sets
 * `status = 'archived'`.
 */
export function ArchiveInsightButton({ id, alreadyArchived }: { id: string; alreadyArchived: boolean }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (alreadyArchived) return null;

  function handleClick() {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await archiveInsightAction(id);
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
        style={confirming ? { borderColor: "var(--color-error)", color: "var(--color-error)" } : undefined}
      >
        {confirming ? "Confirm archive" : "Archive"}
      </Button>
      {confirming && !pending ? (
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="underline-offset-2 hover:underline"
          style={{ fontSize: "var(--text-caption)", color: "var(--color-text-muted)" }}
        >
          Cancel
        </button>
      ) : null}
      {error ? <ErrorText>{error}</ErrorText> : null}
    </div>
  );
}
