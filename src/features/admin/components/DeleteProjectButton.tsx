"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ErrorText } from "@/components/ui/form/Field";
import { deleteProjectAction } from "@/features/admin/actions";

/**
 * Module 9M — permanent deletion for a project (spec §17/§19/§20).
 * `deleteProjectAction` deletes the `projects` row (cascading its
 * `project_media` gallery rows via the existing FK) and best-effort
 * cleans up both the project's own single-image Storage object and
 * every gallery image's Storage object. Same shape as
 * `DeleteServiceButton`.
 */
export function DeleteProjectButton({ id }: { id: string }) {
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
      const result = await deleteProjectAction(id);
      if (!result.ok) {
        setError(result.message);
        setConfirming(false);
        return;
      }
      router.push("/admin/projects");
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
            This will permanently delete this project and its gallery images.
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
