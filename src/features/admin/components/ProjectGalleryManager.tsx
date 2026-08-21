"use client";

import { useRef, useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { Label, ErrorText, HelperText } from "@/components/ui/form/Field";
import {
  addProjectGalleryImageAction,
  removeProjectGalleryImageAction,
  reorderProjectGalleryAction,
} from "@/features/admin/actions";
import { buildPublicMediaUrl } from "@/lib/cms/publicMediaUrl";
import { validateImageFile } from "@/lib/validation/media";
import type { ProjectMediaRow } from "@/lib/repositories/projectMedia";

/**
 * Module 9K — the Project gallery manager (spec §12/§13). Lives on
 * `/admin/projects/[id]` only — edit mode, never create mode — since
 * every gallery row needs a real `project_id` (see
 * `projectMediaService.ts`'s header for why). Persists each upload
 * and each removal/reorder immediately (spec §26 Option B), separate
 * from the surrounding `ProjectForm`'s own save button — the gallery
 * is not part of that form's submit payload at all.
 *
 * Reordering is plain up/down buttons, not drag-and-drop (spec §12 —
 * this codebase has no existing DnD primitive, and the brief is
 * explicit that adding one just for this isn't worth it). The public
 * order is still fully deterministic either way: every move writes
 * real `sort_order` integers through `reorderProjectGalleryAction`.
 */
export function ProjectGalleryManager({ projectId, initialMedia }: { projectId: string; initialMedia: ProjectMediaRow[] }) {
  const [media, setMedia] = useState(initialMedia);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  // Distinguishes *which* pending operation is running so the status
  // text below can say "Saving order…" vs "Removing image…" instead of
  // one generic label — spec §18/§19's "Saving order..." /
  // "Removing..." states are otherwise indistinguishable from each
  // other since both share the same `pending` flag.
  const [pendingAction, setPendingAction] = useState<"remove" | "reorder" | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList) {
    setError(null);
    const fileArray = Array.from(files);

    // Uploads run one at a time rather than in parallel — keeps the
    // resulting `sort_order` values (computed server-side from the
    // current max) correct even when several files are dropped at
    // once, and keeps a single failure from being ambiguous about
    // which files actually made it in (spec §25 — "do not block
    // already-successful uploads because one file failed; clearly
    // identify failures").
    setUploading(true);
    let successCount = 0;
    const failures: string[] = [];
    for (const file of fileArray) {
      const clientCheck = validateImageFile({ type: file.type, size: file.size });
      if (!clientCheck.ok) {
        failures.push(`${file.name}: ${clientCheck.message}`);
        continue;
      }

      const formData = new FormData();
      formData.set("file", file);
      const result = await addProjectGalleryImageAction(projectId, formData);
      if (result.ok) {
        successCount += 1;
        setMedia((prev) => [...prev, result.data]);
      } else {
        failures.push(`${file.name}: ${result.message}`);
      }
    }
    setUploading(false);

    if (failures.length > 0) {
      // Spec §14/§16 — report both sides of a partial failure, not just
      // the failure list: "3 images uploaded. 1 image failed..." makes
      // it clear the successes were kept, not silently lost alongside
      // the one that failed.
      const successPrefix = successCount > 0 ? `${successCount} image${successCount === 1 ? "" : "s"} uploaded. ` : "";
      const failureLabel = failures.length === 1 ? "1 image failed to upload: " : `${failures.length} images failed to upload: `;
      setError(`${successPrefix}${failureLabel}${failures.join(" ")}`);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    e.target.value = "";
    if (files && files.length > 0) void handleFiles(files);
  }

  function handleRemove(id: string) {
    setError(null);
    setPendingAction("remove");
    startTransition(async () => {
      const result = await removeProjectGalleryImageAction(projectId, id);
      if (!result.ok) {
        setError(result.message);
        setPendingAction(null);
        return;
      }
      setMedia((prev) => prev.filter((row) => row.id !== id));
      setPendingAction(null);
    });
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= media.length) return;

    const reordered = [...media];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setMedia(reordered);
    setPendingAction("reorder");

    startTransition(async () => {
      const result = await reorderProjectGalleryAction(projectId, reordered.map((row) => row.id));
      if (!result.ok) {
        setError(result.message);
        setMedia(media); // revert to the last known-good order
        setPendingAction(null);
        return;
      }
      setMedia(result.data);
      setPendingAction(null);
    });
  }

  return (
    <Card variant="bordered" className="gap-6">
      <div className="flex flex-col gap-2">
        <Label>Project gallery</Label>
        <HelperText>Renders in the case-study page&apos;s Gallery chapter. Up to 4 images are used there; extras are kept but not shown.</HelperText>
      </div>

      {media.length > 0 ? (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {media.map((item, index) => {
            const url = buildPublicMediaUrl("projects", item.storage_path);
            return (
              <li key={item.id} className="flex flex-col gap-2 rounded-[var(--radius-md)] border p-2" style={{ borderColor: "var(--color-border)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- admin gallery thumbnail of an arbitrary Storage object; not a next/image-configured domain. */}
                <img src={url} alt={item.alt_text ?? ""} className="aspect-square w-full rounded-[var(--radius-sm)] object-cover" />
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0 || pending || uploading}
                      aria-label="Move image earlier"
                      className="disabled:cursor-not-allowed disabled:opacity-30"
                      style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === media.length - 1 || pending || uploading}
                      aria-label="Move image later"
                      className="disabled:cursor-not-allowed disabled:opacity-30"
                      style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}
                    >
                      ↓
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    disabled={pending || uploading}
                    aria-label="Remove image"
                    aria-busy={pending && pendingAction === "remove"}
                    className="underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ fontSize: "var(--text-caption)", color: "var(--color-error)" }}
                  >
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        // Spec §21 — a small gallery-specific empty presentation rather
        // than the generic CMS-table `EmptyState`, which would look
        // oversized inside this compact editor card.
        <p style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
          No gallery images yet. Upload images to build this project&apos;s gallery.
        </p>
      )}

      {pending && pendingAction ? (
        <Loader size="sm" label={pendingAction === "reorder" ? "Saving order…" : "Removing image…"} showLabel />
      ) : null}

      <div>
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading || pending}>
          {uploading ? "Uploading images…" : "Upload images"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          onChange={handleInputChange}
          className="sr-only"
          aria-label="Upload gallery images"
        />
      </div>

      {error ? <ErrorText role="alert">{error}</ErrorText> : null}
    </Card>
  );
}
