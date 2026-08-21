"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ErrorText } from "@/components/ui/form/Field";
import { archiveServiceAction } from "@/features/admin/actions";

/**
 * Module 9B — archive action for a service (spec §13). A lightweight
 * inline confirm step (click once to arm, click again to confirm)
 * rather than a modal — keeps this a small client component instead
 * of pulling in a dialog primitive the design system doesn't already
 * have. Never deletes the row: calls `archiveServiceAction`, which
 * only ever sets `status = 'archived'` (spec §9).
 */
export function ArchiveServiceButton({ id, alreadyArchived }: { id: string; alreadyArchived: boolean }) {
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
      const result = await archiveServiceAction(id);
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
        disabled={pending}
        style={confirming ? { borderColor: "var(--color-error)", color: "var(--color-error)" } : undefined}
      >
        {pending ? "Archiving…" : confirming ? "Confirm archive" : "Archive"}
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
