"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ErrorText } from "@/components/ui/form/Field";
import { deleteInsightAction } from "@/features/admin/actions";

/**
 * Module 9M — permanent deletion for an insight (spec §17/§19/§23).
 * `deleteInsightAction` deletes the `insights` row and best-effort
 * cleans up its associated Storage object. After deletion,
 * `/insights/[slug]` resolves through the existing `notFound()` path
 * unchanged, since no row remains to match the slug. Same shape as
 * `DeleteServiceButton`.
 */
export function DeleteInsightButton({ id }: { id: string }) {
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
      const result = await deleteInsightAction(id);
      if (!result.ok) {
        setError(result.message);
        setConfirming(false);
        return;
      }
      router.push("/admin/insights");
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
        style={{ borderColor: "var(--color-error)", color: "var(--color-error)" }}
      >
        {pending ? "Deleting…" : confirming ? "Confirm delete" : "Delete"}
      </Button>
      {confirming && !pending ? (
        <>
          <span style={{ fontSize: "var(--text-caption)", color: "var(--color-error)" }}>
            This will permanently delete this insight.
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
