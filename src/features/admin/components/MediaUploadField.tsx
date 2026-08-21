"use client";

import { useRef, useState } from "react";
import { ErrorText, HelperText, Label } from "@/components/ui/form/Field";
import { Button } from "@/components/ui/Button";
import { uploadMediaAction, deleteMediaAction } from "@/features/admin/actions";
import { buildPublicMediaUrl } from "@/lib/cms/publicMediaUrl";
import { validateImageFile } from "@/lib/validation/media";
import type { PublicMediaBucket } from "@/lib/cms/storage";

/**
 * Module 9K — replaces the raw "type a storage path" text input
 * (spec §1/§11) on the Service/Project/Team/Insight forms with a real
 * upload control: choose or drop a file, it uploads immediately via
 * `uploadMediaAction`, and this field's `value`/`onChange` — the same
 * `mediaPath`/`imagePath` string the form already tracked — now holds
 * the resulting Storage path automatically instead of by hand. The
 * raw path is still shown as small secondary text under the preview
 * (spec §11 — "may still be available as secondary metadata... but
 * should not be the main workflow"), never as the primary input.
 *
 * The parent form only persists this path when the whole record is
 * saved (spec §26 Option A) — see `actions.ts`'s `uploadMediaAction`
 * header for why that's the right call for these single-image fields
 * specifically.
 */
export function MediaUploadField({
  id,
  label,
  bucket,
  value,
  onChange,
  helperText,
}: {
  id: string;
  label: string;
  bucket: PublicMediaBucket;
  value: string;
  onChange: (path: string) => void;
  helperText?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const previewUrl = localPreview ?? buildPublicMediaUrl(bucket, value);
  const filename = value.split("/").pop();

  async function handleFile(file: File) {
    setError(null);

    // Instant client-side check for fast feedback — `uploadMediaAction`
    // re-validates server-side regardless (spec §9's "do not rely on
    // client-side checks" — this is UX only, not the real gate).
    const clientCheck = validateImageFile({ type: file.type, size: file.size });
    if (!clientCheck.ok) {
      setError(clientCheck.message);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    setUploading(true);

    const previousPath = value;

    const formData = new FormData();
    formData.set("bucket", bucket);
    formData.set("file", file);

    const result = await uploadMediaAction(formData);
    setUploading(false);
    URL.revokeObjectURL(objectUrl);
    setLocalPreview(null);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    onChange(result.path);

    // Best-effort cleanup of the file this one just replaced (spec
    // §20's "upload new, persist new reference, then remove old
    // object" ordering) — never blocks the UI and never surfaces a
    // failure here, since the new image is already saved into form
    // state either way.
    if (previousPath) {
      deleteMediaAction(bucket, previousPath).catch(() => {
        // Swallowed deliberately — see MODULE-9K-HANDOFF.md §K.
      });
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) void handleFile(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  }

  function handleRemove() {
    if (value) {
      deleteMediaAction(bucket, value).catch(() => {
        // Swallowed deliberately — see MODULE-9K-HANDOFF.md §K.
      });
    }
    onChange("");
    setError(null);
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>

      {previewUrl ? (
        <div
          className="flex flex-col gap-3 rounded-[var(--radius-md)] border p-3 sm:flex-row sm:items-center"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- admin-only preview of an arbitrary uploaded/blob-URL image; next/image requires a static domain config this doesn't fit. */}
          <img
            src={previewUrl}
            alt=""
            className="h-24 w-24 shrink-0 rounded-[var(--radius-sm)] object-cover"
            style={{ border: "1px solid var(--color-border)" }}
          />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="truncate" style={{ fontSize: "var(--text-small)", color: "var(--color-text-primary)" }}>
              {uploading ? "Uploading…" : (filename ?? "Image")}
            </span>
            {!uploading && value ? (
              <span className="truncate" style={{ fontSize: "var(--text-caption)", color: "var(--color-text-muted)" }}>
                {value}
              </span>
            ) : null}
            <div className="mt-1 flex items-center gap-3">
              <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
                Replace
              </Button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={uploading}
                aria-label={`Remove ${label.toLowerCase()}`}
                className="underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                style={{ fontSize: "var(--text-caption)", color: "var(--color-error)" }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className="flex flex-col items-center justify-center gap-3 rounded-[var(--radius-md)] border border-dashed p-8 text-center transition-colors"
          style={{
            borderColor: dragActive ? "var(--color-brand)" : "var(--color-border)",
            background: dragActive ? "var(--color-surface)" : "transparent",
          }}
        >
          <span style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
            {uploading ? "Uploading…" : "Drag an image here, or"}
          </span>
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
            Choose Image
          </Button>
          <span style={{ fontSize: "var(--text-caption)", color: "var(--color-text-muted)" }}>JPG, PNG, WebP, or SVG · up to 5MB</span>
        </div>
      )}

      <input ref={inputRef} id={id} type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" onChange={handleInputChange} className="sr-only" aria-label={label} />

      {helperText ? <HelperText>{helperText}</HelperText> : null}
      {error ? (
        <ErrorText role="alert" aria-live="assertive">
          {error}
        </ErrorText>
      ) : null}
    </div>
  );
}
