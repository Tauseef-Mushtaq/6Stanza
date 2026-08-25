"use client";

import { forwardRef, useImperativeHandle, useRef, useState, useTransition } from "react";
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
 * Module 9K (revised) — the Project gallery manager (spec §12/§13).
 *
 * Originally this only rendered on `/admin/projects/[id]` (edit mode)
 * because every gallery row needs a real `project_id` FK, and that FK
 * only exists once the project has been saved once. That's still true
 * at the database level — but it made the gallery invisible on
 * `/admin/projects/new`, which read as "the feature doesn't work" to
 * anyone creating a project for the first time.
 *
 * Fix: when `projectId` is omitted (create mode), this component runs
 * in a "staged" mode instead of persisting anything immediately —
 * selected files are kept as in-memory `File` objects with local
 * object-URL previews, no server action is called yet, and reordering
 * is instant local array reordering. Once the parent `ProjectForm`
 * successfully creates the project and has a real id, it calls
 * `flush(projectId)` (exposed via `ref`) to upload every staged file
 * through the exact same `addProjectGalleryImageAction` used by edit
 * mode — so the actual upload path, validation, and Storage layout are
 * identical in both modes; only *when* the network call happens
 * differs.
 */
export interface ProjectGalleryManagerHandle {
  /** Uploads every staged file against a newly-created project. No-op (resolves immediately) if there are no staged files — safe to call unconditionally after create succeeds. */
  flush: (projectId: string) => Promise<void>;
}

interface StagedFile {
  key: string;
  file: File;
  previewUrl: string;
}

export const ProjectGalleryManager = forwardRef<
  ProjectGalleryManagerHandle,
  { projectId?: string; initialMedia?: ProjectMediaRow[] }
>(function ProjectGalleryManager({ projectId, initialMedia = [] }, ref) {
  const isStaged = !projectId;

  const [media, setMedia] = useState(initialMedia);
  const [staged, setStaged] = useState<StagedFile[]>([]);
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

  useImperativeHandle(ref, () => ({
    async flush(newProjectId: string) {
      if (staged.length === 0) return;

      setUploading(true);
      let successCount = 0;
      const failures: string[] = [];

      // Same one-at-a-time rationale as the persisted-mode path below:
      // correct server-computed `sort_order` values and unambiguous
      // per-file failure reporting.
      for (const item of staged) {
        try {
          const formData = new FormData();
          formData.set("file", item.file);
          const result = await addProjectGalleryImageAction(newProjectId, formData);
          if (result.ok) {
            successCount += 1;
          } else {
            failures.push(`${item.file.name}: ${result.message}`);
          }
        } catch (err) {
          console.error("ProjectGalleryManager: staged upload failed", err);
          failures.push(`${item.file.name}: Upload failed unexpectedly.`);
        } finally {
          URL.revokeObjectURL(item.previewUrl);
        }
      }

      setStaged([]);
      setUploading(false);

      if (failures.length > 0) {
        const successPrefix = successCount > 0 ? `${successCount} image${successCount === 1 ? "" : "s"} uploaded. ` : "";
        const failureLabel = failures.length === 1 ? "1 image failed to upload: " : `${failures.length} images failed to upload: `;
        setError(`${successPrefix}${failureLabel}${failures.join(" ")}`);
      }
    },
  }));

  async function handleFiles(fileArray: File[]) {
    setError(null);

    if (isStaged) {
      // Nothing to persist yet — just validate and hold onto the files
      // with local previews until the project is created.
      const accepted: StagedFile[] = [];
      const failures: string[] = [];
      for (const file of fileArray) {
        const clientCheck = validateImageFile({ type: file.type, size: file.size });
        if (!clientCheck.ok) {
          failures.push(`${file.name}: ${clientCheck.message}`);
          continue;
        }
        accepted.push({ key: `${file.name}-${file.size}-${crypto.randomUUID()}`, file, previewUrl: URL.createObjectURL(file) });
      }
      if (accepted.length > 0) setStaged((prev) => [...prev, ...accepted]);
      if (failures.length > 0) {
        const failureLabel = failures.length === 1 ? "1 image was rejected: " : `${failures.length} images were rejected: `;
        setError(`${failureLabel}${failures.join(" ")}`);
      }
      return;
    }

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

      try {
        const formData = new FormData();
        formData.set("file", file);
        const result = await addProjectGalleryImageAction(projectId, formData);
        if (result.ok) {
          successCount += 1;
          setMedia((prev) => [...prev, result.data]);
        } else {
          failures.push(`${file.name}: ${result.message}`);
        }
      } catch (err) {
        // A thrown error here (network failure, a Server Action crash
        // that didn't return the expected result shape, etc.) used to
        // propagate as an unhandled rejection — the upload button would
        // just sit there with nothing visibly happening and nothing
        // logged from this component's own code. Catch it explicitly
        // so a failure is always visible, both to the admin and in the
        // console.
        console.error("ProjectGalleryManager: upload failed", err);
        failures.push(`${file.name}: Upload failed unexpectedly.`);
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
    // Extract the actual File objects out of the FileList *before*
    // resetting `.value` below. `e.target.files` is a live reference
    // tied to the input, not a snapshot — clearing the input's value
    // (done so selecting the same file twice in a row still fires a
    // change event next time) also empties that same FileList out
    // from under a held reference to it. Converting to a plain array
    // here decouples the actual File objects from the input, the same
    // way `MediaUploadField`'s single-file version already does with
    // `e.target.files?.[0]`.
    const fileArray = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = "";
    if (fileArray.length > 0) void handleFiles(fileArray);
  }

  function handleRemove(id: string) {
    setError(null);
    setPendingAction("remove");
    startTransition(async () => {
      const result = await removeProjectGalleryImageAction(projectId!, id);
      if (!result.ok) {
        setError(result.message);
        setPendingAction(null);
        return;
      }
      setMedia((prev) => prev.filter((row) => row.id !== id));
      setPendingAction(null);
    });
  }

  function removeStaged(key: string) {
    setError(null);
    setStaged((prev) => {
      const target = prev.find((item) => item.key === key);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.key !== key);
    });
  }

  function move(index: number, direction: -1 | 1) {
    if (isStaged) {
      const target = index + direction;
      if (target < 0 || target >= staged.length) return;
      const reordered = [...staged];
      [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
      setStaged(reordered);
      return;
    }

    const target = index + direction;
    if (target < 0 || target >= media.length) return;

    const reordered = [...media];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setMedia(reordered);
    setPendingAction("reorder");

    startTransition(async () => {
      const result = await reorderProjectGalleryAction(projectId!, reordered.map((row) => row.id));
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

  const itemCount = isStaged ? staged.length : media.length;

  return (
    <Card variant="bordered" className="gap-6">
      <div className="flex flex-col gap-2">
        <Label>Project gallery</Label>
        <HelperText>
          Renders in the case-study page&apos;s Gallery chapter.
          {isStaged ? " Images are uploaded once you create the project." : ""}
        </HelperText>
      </div>

      {itemCount > 0 ? (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {isStaged
            ? staged.map((item, index) => (
                <li key={item.key} className="flex flex-col gap-2 rounded-[var(--radius-md)] border p-2" style={{ borderColor: "var(--color-border)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- local blob-URL preview of a not-yet-uploaded file. */}
                  <img src={item.previewUrl} alt="" className="aspect-square w-full rounded-[var(--radius-sm)] object-cover" />
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => move(index, -1)}
                        disabled={index === 0}
                        aria-label="Move image earlier"
                        className="disabled:cursor-not-allowed disabled:opacity-30"
                        style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => move(index, 1)}
                        disabled={index === staged.length - 1}
                        aria-label="Move image later"
                        className="disabled:cursor-not-allowed disabled:opacity-30"
                        style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}
                      >
                        ↓
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeStaged(item.key)}
                      aria-label="Remove image"
                      className="underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                      style={{ fontSize: "var(--text-caption)", color: "var(--color-error)" }}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))
            : media.map((item, index) => {
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
});
