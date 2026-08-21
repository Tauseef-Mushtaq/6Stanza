"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ErrorText } from "@/components/ui/form/Field";
import { deleteServiceAction } from "@/features/admin/actions";

/**
 * Module 9M — permanent deletion for a service (spec §17/§19/§22),
 * distinct from `ArchiveServiceButton`: archiving keeps the row and
 * only flips `status`; this calls `deleteServiceAction`, which
 * removes the database row entirely and best-effort cleans up its
 * Storage object. Same click-to-arm / click-to-confirm shape as the
 * archive button, but the armed state states plainly that the action
 * is permanent (spec §19), and a successful delete navigates back to
 * the list — the detail page it was on no longer exists.
 */
export function DeleteServiceButton({ id }: { id: string }) {
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
      const result = await deleteServiceAction(id);
      if (!result.ok) {
        setError(result.message);
        setConfirming(false);
        return;
      }
      router.push("/admin/services");
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
            This will permanently delete this record.
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
