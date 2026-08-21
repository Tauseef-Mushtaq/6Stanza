# MODULE 10C — Admin CMS Loading, Error & Success States — Handoff

## A. What was inspected

- All Admin CMS routes: `/admin/{services,projects,team,insights}` and their `/new` and `/[id]` sub-routes.
- `src/features/admin/components/*Table.tsx`, `*Form.tsx`, `Archive*Button.tsx`, `Delete*Button.tsx` for all four content types.
- `src/features/admin/actions.ts` — the Server Action result contract (`{ ok: true, data }` / `{ ok: false, message }` / `{ ok: false, fieldErrors }`).
- Module 10A primitives: `src/components/ui/Loader.tsx`, `ErrorState.tsx`, `EmptyState.tsx`, `Button.tsx` (`loading` prop), and `src/app/admin/loading.tsx`.
- `src/features/admin/components/MediaUploadField.tsx` and `ProjectGalleryManager.tsx` for silent-failure risk (media scope itself is 10E, but user-facing feedback risk was checked).
- `InquiryTable.tsx` / `StatusSelect.tsx` (Module 7A/7B) — left untouched; not in this module's route scope and already has its own loading/pending/error/success handling.

**Finding:** Modules 9B–9M had already built a very consistent, largely-correct state model across all four CMS content types (Services/Projects/Team/Insights) — save/archive/delete pending states, confirm-before-destructive-action, field vs. form errors, `notFound()` for missing records, `router.refresh()`/`router.push()` invalidation, and preserved-on-error form state were all already present and identical across the four types. 10C's real work was therefore consolidation onto the 10A shared primitives (which none of the CMS code had adopted yet) and closing the remaining small gaps, not building the state machine from scratch.

## B. Admin list states

For Services / Projects / Team / Insights (all four, identical pattern):

- **Loading** — handled by the existing segment-level `src/app/admin/loading.tsx` (Module 7A). All four lists are plain `async` Server Components with no client fetch, so no additional local loading state was needed (spec §4 — "do not introduce client-side fetching merely to display a spinner").
- **Empty** — previously each table (`ServiceTable`, `ProjectTable`, `TeamMemberTable`, `InsightTable`) defined its own copy-pasted local `EmptyState` function. **Migrated all four** to the shared `src/components/ui/EmptyState.tsx`, and added the relevant "Create ___" action button to the unfiltered-empty case (filtered-empty intentionally has no action — creating a record doesn't address "nothing matches this filter"). Filtered vs. unfiltered empty copy ("No services match this status." vs. "No services found.") is preserved.
- **Error** — previously each list page rendered its own inline `<div role="alert">` on `!result.ok`. **Migrated all four list pages** to a new shared `AdminErrorState` component (see §E) with a working retry button.

Inquiry/dashboard states were reviewed (§D) but not materially changed — Module 7A/7B's Inquiry handling is a different UX (no create action, no CMS status model) and was already solid.

## C. Form states

Create and edit forms (`ServiceForm`, `ProjectForm`, `TeamMemberForm`, `InsightForm`) already correctly implemented, unchanged:

- Idle → Saving → Success/Error, driven by `useTransition`.
- Failed saves **already preserved user input** — `setForm` is only called with server data on a *successful* edit-mode save; on any failure (validation or server) the form state is left exactly as the user typed it. Verified this holds for all four forms; no change needed (spec §11 — "if the current architecture already preserves state, do not change it").
- Validation vs. server-error distinction already correct: `fieldErrors` render per-field via `ErrorText` under each input; a bare `message` renders once via `ErrorText` under the form (`formError`) and is already a safe, pre-validated string from the Server Action — never a raw Supabase/Postgres error (confirmed against `serviceContentService.ts` et al., which construct `message` themselves).
- Success feedback: edit-mode save shows an inline "Saved." message next to the button; create-mode save navigates to the new record's detail page, which is itself sufficient success feedback (spec §13) — no toast was added, matching §36.

**Changed:** the submit button in all four forms swapped its manual `disabled={pending}` + `{pending ? "Saving…" : ...}` text-swap for the shared `Button`'s `loading` prop (`loading={pending}`), so the pending state (spinner, `aria-busy`, disabled) comes from the Module 10A primitive instead of being hand-rolled per form (spec §10/§29).

## D. Mutation states

**Archive** (`Archive*Button` × 4) and **Delete** (`Delete*Button` × 4): both already had click-to-arm/click-to-confirm, a disabled/pending button during the transition, safe error messages via `ErrorText`, and correct post-mutation invalidation (`router.refresh()` for archive, `router.push()` back to the list for delete, since the detail page's record is gone). **Changed:** all eight buttons now use `Button`'s `loading` prop instead of manually disabling and swapping in `"Archiving…"`/`"Deleting…"` text — the button label now stays `"Confirm archive"`/`"Confirm delete"` (or the idle label) and the spinner communicates pending state, consistent with the forms above and with spec §29 ("do not create `AdminSpinner`/`SaveSpinner`/`DeleteSpinner`/`CMSLoader` duplicates").

There is no separate "Publish" action in this codebase — publishing is one value (`published`) in the same `status` select used for draft/archived, submitted through the normal form save flow, so it already inherits the form's Saving/Success/Error handling. No separate publish-pending affordance was needed or added.

## E. Shared primitive adoption

- **`EmptyState`** — adopted in `ServiceTable`, `ProjectTable`, `TeamMemberTable`, `InsightTable` (replacing four duplicated local implementations).
- **`ErrorState`** — adopted via a new small client wrapper, `src/features/admin/components/AdminErrorState.tsx`. The four list pages and four `[id]` detail pages are Server Components that already produce a safe `result.message` on failure; they can't hold an `onClick` retry handler themselves, so `AdminErrorState` is the minimal client boundary that takes that message and wires `ErrorState`'s `onRetry` to `router.refresh()`. Used in all 8 pages (§B).
- **`Button loading`** — adopted in all four forms' submit buttons and all eight archive/delete buttons, replacing manual `disabled`/text-swap pending indication everywhere it existed in CMS mutation UI.
- **`Loader`** — not directly needed as a standalone insert; the existing `src/app/admin/loading.tsx` (route-segment loading) already covers list/record loading and was left as-is per spec §4.

## F. Delete behavior (confirmed, unchanged logic)

- Pending state: button shows a spinner and is disabled (via `Button loading`) for the duration of the transition; the confirmation copy/cancel link stay hidden while pending.
- Confirmation: click-to-arm, explicit "This will permanently delete this record." warning, cancel option.
- Success: `router.push()` back to the type's list — no stale detail view of a now-nonexistent record is left rendered (spec §17).
- Failure: safe message via `ErrorText`, confirmation state is reset (`setConfirming(false)`) so the admin re-confirms rather than being stuck in an ambiguous armed state.
- Storage cleanup (Module 9M/9K) — left untouched, still best-effort/fire-and-forget with a documented swallowed catch; out of scope here (§33 of the module spec) and correctly non-blocking for the database delete the admin is actually waiting on.

## G. Security

- No changes to `requireAdmin()`, RLS policies, or Server Action authorization — all edits were presentational (which shared component renders a given state), not to the action/service/repository layers.
- `AdminErrorState` only ever receives the `message` string the page's existing `result.ok === false` branch already produced (already a safe, validated string from the service layer) — it introduces no new path for a raw backend error to reach the UI.
- No Supabase/Postgres/SQL/stack-trace/RLS details are exposed anywhere touched in this module.

## H. Verification

- **Static review performed:** every edited/created file was re-read in full after editing; brace/paren balance was checked programmatically across all 25 touched files (all balanced); the four archive buttons, four delete buttons, and four forms were diffed against each other before and after editing to confirm the four content types stayed structurally identical.
- **Silent-mutation-failure audit performed:** searched all `startTransition` call sites (29) and all mutation-calling components in `src/features/admin/components` — every `await *Action(...)` call site checks `result.ok` before proceeding. The only "fire and forget" pattern found is `MediaUploadField`'s best-effort old-file cleanup (`deleteMediaAction(...).catch(() => {})`), which is a deliberate, already-documented (Module 9K handoff) non-blocking cleanup of a file that's already been superseded in form state — not a failure the admin is waiting on an answer for, so it's correctly silent. No `console.error`-only failure paths were found in `src/features/admin`.
- **NOT run in this environment:** `npm run lint`, `npx tsc --noEmit`, `npm run build`. This sandbox has no network egress, and `npm install` failed (`403` fetching a package from the registry) before any tooling could run. **This must be run before merging** — the changes are mechanical (JSX prop swaps and a handful of one-file-at-a-time component migrations) and were manually re-read line-by-line, but they are not compiler-verified.
- **Browser testing:** not performed — no running dev server / Supabase connection available in this environment. Should be done per the module's §41 checklist (create/edit/publish/archive/delete for each of the four content types) before this is considered fully verified.
- **Responsive QA:** not performed for the same reason.

## I. Remaining work

- Run `npm run lint`, `npx tsc --noEmit`, and `npm run build` in an environment with registry access, and fix anything that surfaces (none is expected from these changes, but they're unverified).
- Perform the browser CRUD-state walkthrough (§41) and failure testing (§42) for all four content types.
- Perform responsive QA (§43) at the specified breakpoints, particularly the new `EmptyState` create-action button and the new `AdminErrorState` retry button on mobile widths.
- Module 10D will cover `/login`, `/signup`, `/auth/*`, and `/start-project` — not touched here.
- Module 10E will cover media upload/gallery operation states beyond the "still compiles against shared primitives" check done here — `MediaUploadField` and `ProjectGalleryManager` were reviewed but deliberately not restructured.
