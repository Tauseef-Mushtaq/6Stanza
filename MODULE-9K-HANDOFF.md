# MODULE 9K — CMS MEDIA UPLOAD & MULTI-IMAGE MANAGEMENT — HANDOFF

## A. What was inspected

Before writing any code:

- `supabase/migrations/0004_storage_buckets.sql` — the four existing Storage buckets (`team`, `projects`, `insights`, `general`), all `public: true`, with `storage_public_read`/`storage_admin_write`/`storage_admin_update`/`storage_admin_delete` policies already gated on `public.is_admin()`.
- `supabase/migrations/0005_cms_content.sql` — every `media_path`/`image_path` column on `services`/`projects`/`team_members`/`insights`, and the `content_status` enum/RLS pattern this module's new table needed to match.
- `src/lib/validation/cmsContent.ts` — the existing `mediaPathSchema` (kept as-is; still the DB-facing validation for the plain path string each single-image field stores).
- `src/lib/repositories/*.ts`, `src/lib/services/*ContentService.ts`, `src/features/admin/actions.ts` — the established repository → service → Server Action layering this module extends rather than replaces.
- `src/lib/auth/session.ts` (`requireAdmin()`) and `src/lib/supabase/server.ts` (the per-request, cookie-authenticated, anon-key client) — confirmed there is no service-role client used anywhere in the existing CMS write path, and none was introduced here either.
- `src/features/admin/components/{ServiceForm,ProjectForm,TeamMemberForm,InsightForm}.tsx` — each form's existing raw "Media path" / "Image path" `<Input>`, the exact UX this module replaces.
- The public media consumer chain: `src/lib/cms/media.ts`'s `getPublicMediaUrl()` (used by the Team public adapter since Module 9H — the only content type with a real, already-wired single-image public consumer), and `src/features/services/data/publicServices.ts` / `publicProjects.ts` / `publicInsights.ts`, none of which read `media_path` at all before this module.
- `src/features/projects/sections/{ProjectGallery,ProjectDetailHero,ProjectSolution}.tsx` — specifically `ProjectGallery.tsx`, whose own pre-existing comment ("Panels are structured gradient/diagram placeholders today, ready to swap for real screenshots/video without touching the layout or motion") identified it as the one genuine multi-image contract in the current public UI.
- **A previously-uploaded partial implementation of this same module** (found in the project zip re-uploaded partway through this work) that added a narrower `AdminMediaUpload`/`lib/media/mediaUpload.ts` covering Team-only single-image upload, explicitly deferring Services/Insights/Projects. That implementation's own handoff documented that it had **not** been lint/typecheck/build-verified (no network access in that sandbox to `npm ci`). Rather than layering two parallel upload systems, this module supersedes it entirely with the fuller architecture below — every content type it deferred (Services, Insights, and the Project gallery) is covered here, using this module's `MediaUploadField`/`mediaService.ts` naming instead of that draft's `AdminMediaUpload`/`mediaUpload.ts`. No functionality from that draft was lost: single-image upload/replace/remove for Team works identically under the new implementation.

## B. Storage architecture

No new bucket was created (spec §6). The four existing buckets from Module 5 are reused exactly as they already are:

| Bucket | Used for |
|---|---|
| `team` | Team member portraits |
| `projects` | A project's own single `media_path`, **and** every gallery image in the new `project_media` table |
| `insights` | Insight cover images |
| `general` | Service images (Services has no dedicated bucket — `general` was already the intended catch-all) |

All four remain `public: true` with the same `storage_public_read`/`storage_admin_write`/`storage_admin_update`/`storage_admin_delete` policies from `0004_storage_buckets.sql` — none of that migration was touched.

**Path convention** (spec §7), implemented in `lib/cms/storage.ts`'s `generateStoragePath()`:

- Single-image fields (Services/Team/Insights/a Project's own `media_path`): `{uuid}.{ext}` at the bucket root. No content-id folder — the owning row's column *is* the association, and a UUID alone already guarantees no collision.
- Project gallery images: `{projectId}/{uuid}.{ext}` inside the `projects` bucket — grouped by project so every image for one project is discoverable without a database round-trip.

The extension is always derived from the **validated MIME type** (`jpg`/`png`/`webp`/`svg`), never from the browser-supplied filename — there is no path built from user input, so there is no path-traversal surface.

**Public vs. private decision** (spec §23/§24): buckets stay `public: true` rather than moving to signed URLs. This was a deliberate, documented choice, not an oversight — every bucket was already public before this module (Team portraits have used public URLs since Module 9H), and none of the new gallery functionality changes that trust model. The consequence is stated plainly: **a draft project's gallery images are not publicly *listed* (RLS on `project_media` hides the rows), but the underlying Storage objects are not cryptographically private** — if someone already has (or guesses) the exact UUID-named path, the bucket's public-read policy would still serve it. This is an accepted limitation for a small marketing-site CMS with no genuinely sensitive imagery, not a claim that draft media is fully private. See §H for the specific claim this module does and doesn't make.

## C. Upload architecture

```
Admin UI                          Single image:  MediaUploadField.tsx
                                   Gallery:       ProjectGalleryManager.tsx
   ↓ FormData({ bucket, file })   /   FormData({ file, altText })
Server Action (features/admin/actions.ts)
   uploadMediaAction / deleteMediaAction                      (single-image)
   addProjectGalleryImageAction / removeProjectGalleryImageAction / reorderProjectGalleryAction   (gallery)
   ↓
Service layer
   lib/services/mediaService.ts        — requireAdmin() + validateImageFile() + calls storage.ts
   lib/services/projectMediaService.ts — requireAdmin() + calls mediaService.ts + project_media repository
   ↓
lib/cms/storage.ts   — raw Supabase Storage upload()/remove(), server-generated paths
   ↓
Supabase Storage + RLS (storage_admin_write / storage_admin_delete — public.is_admin())
```

Every upload/delete goes through `createSupabaseServerClient()` — the same per-request, cookie-authenticated, anon-key client every repository in this codebase already uses. `requireAdmin()` runs inside `mediaService.ts`/`projectMediaService.ts` themselves (not only in the Server Action), so it's checked independently of the Storage RLS policy underneath it — the same defense-in-depth relationship `serviceContentService.ts` etc. already have with table RLS. No file in this module imports `lib/supabase/admin.ts` (the service-role client) or reads `SUPABASE_SERVICE_ROLE_KEY`.

## D. Content types

| Content type | Single image | Gallery | Public integration |
|---|---|---|---|
| **Services** | `media_path` → `MediaUploadField` (bucket `general`) in `ServiceForm.tsx` | — | Not integrated — Services has no public image slot to fill (icon-based visual only); infrastructure only, per spec §14 |
| **Projects** | `media_path` → `MediaUploadField` (bucket `projects`) in `ProjectForm.tsx` | New `project_media` table, `ProjectGalleryManager.tsx` on `/admin/projects/[id]` (edit mode only) | **Gallery is fully integrated** — `ProjectGallery.tsx`'s four panels render real uploaded images where present, falling back to the original procedural placeholder per-panel otherwise |
| **Team** | `image_path` → `MediaUploadField` (bucket `team`) in `TeamMemberForm.tsx` | — | Already integrated since Module 9H (`getPublicMediaUrl` → `TeamSequence`/`TeamFocus`) — this module only changed *how the admin sets the path*, not how the public site consumes it |
| **Insights** | `media_path` → `MediaUploadField` (bucket `insights`) in `InsightForm.tsx` | — | Not integrated — confirmed (again, per prior modules' handoffs) that the public Insights article page has no cover-image slot; infrastructure only, per spec §16 |

Every single-image field on every form got the same upload control (spec §11/§30 — eliminate manual path typing everywhere, not only where the public site already renders it), while public rendering was extended **only** where a genuine existing contract justified it (Team, already true; Projects gallery, newly true because `ProjectGallery.tsx` already had the four-panel placeholder structure waiting for it).

## E. Multiple images

A dedicated `project_media` table (`supabase/migrations/0006_project_media.sql`) — not a generic polymorphic `content_media` table — with:

```sql
id uuid primary key
project_id uuid not null references projects(id) on delete cascade
storage_path text not null
alt_text text
sort_order integer not null default 0
created_at / updated_at timestamptz
```

**Why project-specific, not polymorphic**: Projects is the only content type with a real gallery need right now (per §A's inspection). A real foreign key to `projects.id` is simpler and safer than a `content_type text + content_id uuid` pair with no referential integrity, and nothing in the current schema needs the same gallery shape reused elsewhere yet.

- **Ordering**: `sort_order`, written as plain sequential integers by the reorder action — never insertion order, never filename order. The public adapter always queries `order by sort_order asc`.
- **Removal**: `removeProjectGalleryImage()` deletes the database row first, then attempts Storage cleanup — see §H for the documented failure-mode handling.
- **Replacement**: there's no dedicated "replace" for gallery images — an admin removes the one they don't want and uploads a new one. (Single-image fields do have a real Replace action — see §F — because there's exactly one slot to swap; a gallery's "replace" is just "remove + add" using the controls already there.)
- **New uploads land at the end**: `addProjectGalleryImage()` computes `max(sort_order) + 1` for the new row, so multi-file uploads keep a stable, predictable append order.
- **Reordering UX**: plain up/down buttons (spec §12's explicitly-sanctioned fallback), not drag-and-drop — this codebase has no existing DnD primitive, and the spec is explicit that adding one just for this isn't worth it. The public order is still fully deterministic either way.
- **Gallery management only exists in edit mode** (`/admin/projects/[id]`, never `/admin/projects/new`) — every `project_media` row needs a real `project_id`, which only exists once the parent project has been saved at least once. This sidesteps spec §27's "upload without saving" problem entirely for this content type: there is no UI state in which a gallery row could become orphaned from an unsaved parent, because the manager component simply can't render before the project exists.

## F. Admin UX

**`MediaUploadField.tsx`** (single image — Services/Projects/Team/Insights):

- **Idle** — dashed dropzone: "Drag an image here, or [Choose Image]" + format/size hint.
- **Uploading** — an instant local preview (`URL.createObjectURL`) appears immediately on file selection, before the network round-trip completes; the button disables to prevent duplicate submissions.
- **Success** — a real preview (built from the returned Storage path via `buildPublicMediaUrl`), the filename, the raw path as small secondary text (never the primary interaction — spec §11), and **Replace**/**Remove** controls.
- **Error** — a plain message via the existing `ErrorText` primitive (`role="alert"`, `aria-live="assertive"`), never a raw Supabase/Postgres error.
- **Drag-and-drop** — implemented with plain `onDragOver`/`onDrop` handlers, no library.

**`ProjectGalleryManager.tsx`** (multi-image — Projects only, edit page):

- Grid of thumbnails, each with ↑/↓ reorder buttons and a **Remove** link.
- **Upload images** supports multi-file selection; files upload sequentially (not in parallel) so `sort_order` stays correct and one failure doesn't block or obscure the others (spec §25) — failures are collected and reported together, successes still land in the grid.
- All state changes (`useState` for the visible list) are optimistic but reconciled against the actual server response; a failed reorder reverts to the last known-good order.

Both reuse the existing `Card`/`Button`/`Label`/`HelperText`/`ErrorText`/`FieldGroup` primitives — no new design system, no image editor, no cropping.

**Responsive/accessibility**: both components inherit the existing primitives' responsive/focus behavior; the file `<input>` is `sr-only` with a real `aria-label`, remove/reorder controls have explicit `aria-label`s, and error text uses `role="alert"`.

## G. Security

- **Route boundary**: unchanged — `src/app/admin/layout.tsx` still gates every `/admin/*` page, including the four CMS forms these upload controls live inside.
- **Server Action boundary**: `uploadMediaAction`/`deleteMediaAction`/`addProjectGalleryImageAction`/`removeProjectGalleryImageAction`/`reorderProjectGalleryAction` all delegate to service functions that call `requireAdmin()` themselves.
- **Storage RLS**: `storage_admin_write`/`storage_admin_update`/`storage_admin_delete` (from Module 5, `public.is_admin()`-gated) are the actual, independent authority underneath every upload/delete call — the anon-key session client used throughout this module is still fully subject to them.
- **Table RLS**: `project_media`'s five policies (public-published-select / admin-select-all / admin-insert/update/delete) mirror the exact pattern already established for `services`/`projects`/`team_members`/`insights` in Module 9A.
- **`bucket` allow-list**: both `uploadMediaAction` and `deleteMediaAction` validate the client-supplied `bucket` string against a fixed four-value list (`team`/`projects`/`insights`/`general`) before it ever reaches a Storage call — the browser can request an upload, but it cannot choose an arbitrary bucket name.
- **No service-role key anywhere** in this module — confirmed by direct `grep` across every new file; only `createSupabaseServerClient()` (anon-key, session-authenticated) is used.
- **Public read** of `project_media` is scoped by the same `status = 'published'` join every other public read function already relies on — draft project galleries never appear in `getPublishedProjectGallery()`'s results, regardless of what the admin UI shows.

## H. Existing path compatibility

No `media_path`/`image_path` value written by any earlier module was touched, migrated, or invalidated. `MediaUploadField` treats an existing legacy path (e.g. a manually-typed `/marketing.png` from before this module) exactly like a freshly-uploaded one: it builds a preview URL from the existing `value` prop via `buildPublicMediaUrl` and renders the "already has an image" state (preview + Replace/Remove) instead of the empty dropzone. An admin opening a record with an old manually-typed path sees a working preview immediately — no forced re-upload, no broken state, no silent data rewrite.

**Documented limitation — orphaned Storage objects** (spec §19/§20/§37): this architecture does not, and cannot, guarantee zero orphaned files in Storage:

- **Single-image fields** (Option A — upload immediately, persist on form save): if an admin uploads a new image via Replace/Remove and then **never saves the form**, the newly-uploaded object remains in Storage with no database reference to it. There is no reliable "the admin gave up and left" signal available without a much larger session/draft-tracking system, which is out of scope here (spec §27's "choose the smallest reliable approach"). This is a real, bounded gap: an abandoned edit session can leave one orphaned file per abandoned upload.
- **Gallery images** (Option B — persist immediately): no equivalent gap exists, because upload and database-row creation happen as one action (`addProjectGalleryImage`) — there's no "unsaved" intermediate state to abandon. The narrower failure mode here is the reverse: if the upload succeeds but the subsequent database insert fails, `addProjectGalleryImage` makes a best-effort attempt to delete the just-uploaded object so the failure doesn't silently leave an unreferenced file — but that cleanup call can itself fail (logged, not surfaced to the admin as a second error).
- **Replace/Remove cleanup** (both single-image and gallery) is always attempted, but always best-effort: a failed Storage delete is logged server-side and never blocks or reverses the database change that already succeeded (spec §19's "if storage deletion fails, do not silently claim success" is honored at the *logging* level — nothing pretends the delete worked — but it does not roll back an otherwise-successful save, matching spec §20's ordering guidance).

No scheduled or background cleanup job was built. This is a genuine, acknowledged limitation, not an oversight — see §K.

## I. Public integration

Exactly two public consumers now read uploaded CMS media, and nothing else does:

- **Team** (unchanged from Module 9H): `team_members.image_path` → `getPublicMediaUrl("team", ...)` → `TeamMember.image` → `TeamSequence.tsx`/`TeamFocus.tsx`. This module changed how the admin *sets* that path, not how the public site renders it.
- **Projects gallery** (new): `project_media` rows for a published project → `getPublishedProjectGallery()` (`projectMediaService.ts`) → `getProjectGalleryImages()` in `publicProjects.ts` (maps each row to a typed `{ src, alt }` via `getPublicMediaUrl("projects", ...)`, falling back to the project's own `title` when `alt_text` is empty) → `ProjectDetail.gallery` → `ProjectGallery` component's `images` prop → real `next/image` elements in up to the first four panels, any remaining panels keep the original procedural gradient/pattern placeholder.

`services.media_path` and `insights.media_path` have **no public consumer** — uploading an image through `ServiceForm`/`InsightForm` stores a real, working Storage path, but nothing on `/services` or `/insights` reads it yet, exactly as scoped (spec §14/§16).

`next.config.ts` was updated to add `images.remotePatterns` for the Supabase Storage hostname — required for `next/image` to actually render any of these URLs at all; without it, `next/image` would refuse to optimize a remote domain it hadn't explicitly allowed, and this gap existed (undetected, because no real image had ever been uploaded) since Module 9H. Also raised `experimental.serverActions.bodySizeLimit` to `8mb` (Server Actions default to 1MB, well under the 5MB image cap plus multipart overhead).

## J. Verification

Commands actually run in this environment:

- `npm install` — succeeded (441 packages).
- `npx eslint` (project-wide) — **passed, zero errors/warnings.**
- `npx tsc --noEmit` — **one error, pre-existing and unrelated**: `src/app/layout.tsx(23,50)`: `Cannot find name 'LayoutProps'`. This predates Module 9K (documented in the 9A/9B handoffs already) and no file in this module touches `layout.tsx`. Every file this module added or changed produces zero typecheck errors.
- `npm run build` (`next build`) — **succeeded** (exit code 0). Every route compiled and appears in the final route table, including all four admin edit/new pages and the updated `/projects/[slug]`. The build log's repeated `Dynamic server usage: ... couldn't be rendered statically because it used cookies` messages are pre-existing, expected output for every cookie-authenticated route in this app (confirmed against the same pattern in the Module 9A/9B build logs) — not something this module introduced, and not a build failure; Next.js falls back to on-demand rendering for those routes exactly as it already did before.
- **File validation** (`validateImageFile`) exercised directly via `tsx`: confirmed a valid PNG passes, an empty file is rejected, a file over 5MB is rejected, a disallowed MIME type (`application/pdf`) is rejected, and SVG is correctly allowed.
- **Storage path generation** (`generateStoragePath`'s logic): confirmed the flat `{uuid}.{ext}` shape for single-image uploads and the `{folder}/{uuid}.{ext}` shape for gallery uploads, both via direct regex verification of the actual implementation logic (`lib/cms/storage.ts` itself couldn't be `tsx`-imported standalone outside the Next.js runtime, because its `server-only` guard correctly throws when loaded outside a server-component context — confirmed that guard fires as intended, then verified the underlying pure logic directly).
- **Public URL builder** (`buildPublicMediaUrl`) exercised directly: confirmed correct URL construction, leading-slash normalization, and `undefined` returned for empty/`null`/`undefined` paths.
- **Migration structure** (`0006_project_media.sql`) verified via a structural parse: exactly one table, five RLS policies (matching the public-published/admin-select-all/admin-insert/admin-update/admin-delete pattern used everywhere else), one composite index, one real foreign key to `projects`.
- **Security grep**: confirmed no occurrence of a service-role key/import in any new file, and confirmed neither `MediaUploadField.tsx` nor `ProjectGalleryManager.tsx` imports a Supabase client directly (both go exclusively through Server Actions).

**Not run — no live Supabase project is connected in this sandbox** (same limitation documented in every prior CMS module's handoff): applying migration `0006_project_media.sql` against a real database, uploading a real file end-to-end and confirming it lands in the expected bucket/path, exercising Storage RLS against real anonymous/authenticated/admin sessions, confirming a public `/projects/[slug]` page actually renders an uploaded gallery image in the browser, and confirming Storage cleanup behavior on Replace/Remove were **not performed**. What was verified instead, as listed above, is that every layer compiles, lints, validates correctly in isolation, and that the full production build succeeds with the new routes and the new public integration point present.

## K. Remaining work

Explicitly out of scope for this module, and not claimed as implemented:

- **Orphaned Storage cleanup for abandoned single-image uploads** — documented in §H as a real, bounded gap. No scheduled sweep or background job was built (spec §13/§37 both caution against over-building this).
- **Services/Insights public image placements** — infrastructure (upload, validation, storage) is fully in place for both; no new public-facing image section was added to either, per spec §14/§16's explicit instruction not to invent one.
- **Signed URLs / private media** — every bucket stays public-read; see §B's documented trade-off. If draft-project gallery images ever need to be genuinely inaccessible (not just unlisted), that would require moving the `projects` bucket to private and generating signed URLs for the admin gallery manager — a larger change, not attempted here.
- **Drag-and-drop gallery reordering** — up/down buttons only, per spec §12's own sanctioned fallback.
- **Image editing** (crop/filters/color correction/background removal) — explicitly out of scope per spec §34; not built.
- **A shared/generic `content_media` table** — deliberately not built; see §E's reasoning. If a second content type genuinely needs a gallery later, that's the point to revisit this decision, not before.
