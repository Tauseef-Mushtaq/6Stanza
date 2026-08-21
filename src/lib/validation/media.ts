/**
 * Module 9K — file validation for CMS image uploads (spec §8).
 *
 * Pure and framework-agnostic (no `server-only`, no Node-specific
 * APIs) so the same rules can give instant client-side feedback in
 * `MediaUploadField` *and* be the actual server-side source of truth
 * in `lib/services/mediaService.ts` — the client check is only ever a
 * UX convenience; the server check is what's actually authoritative
 * (spec §9's "do not rely on client-side checks" applies to file
 * validation as much as admin authorization).
 */

/**
 * Matches the four image formats the public site's `<Image>`
 * components already handle (`next/image` supports all four) —
 * inspected against `TeamSequence.tsx`/`TeamFocus.tsx`'s existing
 * `<Image src={member.image} .../>` usage before hardcoding this list
 * (spec §8's "inspect the actual application requirements").
 */
export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"] as const;
export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

/** Maps a validated MIME type to a safe, predictable file extension — the stored filename is always generated server-side (spec §7), never derived from the browser-supplied original filename. */
const EXTENSION_BY_MIME: Record<AllowedImageMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

/**
 * 5 MB — generous enough for real marketing photography while staying
 * far under Next.js's Server Action body limit once `next.config.ts`
 * raises it (spec §8's "reasonable maximum after inspecting current
 * hosting/storage constraints" — this project has no CDN/image
 * pipeline in front of Storage yet, so keeping originals modest-sized
 * matters more than it would with one).
 */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export type FileValidationResult = { ok: true; extension: string } | { ok: false; message: string };

/** Validates a MIME type + byte size pair against the rules above. Takes primitives rather than a `File`/`Blob` so it works identically against a browser `File` (client) and a `FormData`-decoded file (Server Action) without any environment-specific glue. */
export function validateImageFile(input: { type: string; size: number }): FileValidationResult {
  if (input.size <= 0) {
    return { ok: false, message: "That file is empty." };
  }
  if (input.size > MAX_IMAGE_BYTES) {
    return { ok: false, message: `Images must be under ${Math.floor(MAX_IMAGE_BYTES / (1024 * 1024))}MB.` };
  }
  if (!(ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(input.type)) {
    return { ok: false, message: "Use a JPG, PNG, WebP, or SVG image." };
  }
  return { ok: true, extension: EXTENSION_BY_MIME[input.type as AllowedImageMimeType] };
}
