# MODULE 10A — Global Error & Loading Foundation

## A. What was inspected

- `src/app/*`, `src/features/*`, `src/components/*`, `src/lib/*` for existing loading/error/empty primitives.
- `rg` searches for `loading`, `error`, `Spinner|Loader|Skeleton`, `EmptyState|ErrorState|NotFound`, `toast|notification|snackbar`, `useTransition`, `useActionState`, `isPending`, `pending`, `disabled`.

Findings:

- `src/app/admin/loading.tsx` already existed (Module 7A) — a skeleton-block loading UI for the whole `/admin` segment. Left untouched.
- No `loading.tsx` existed for `(site)` routes, no `error.tsx`, `global-error.tsx`, or `not-found.tsx` anywhere in the app.
- No reusable `Loader`, `ErrorState`, or generic `EmptyState` component existed. Each admin table (`TeamMemberTable.tsx`, `ServiceTable.tsx`, `ProjectTable.tsx`, `InsightTable.tsx`, `InquiryTable.tsx`) defines its own local, near-identical `EmptyState` function.
- `Button.tsx` had no pending/loading state; every mutation button (`ArchiveProjectButton`, `DeleteServiceButton`, etc.) already uses `useTransition` + local `pending` boolean, manually swapping button text and setting `disabled={pending}`.
- No toast/notification system exists anywhere. No `useActionState` usage — everywhere `useTransition` + a manual `startTransition` callback is the established pattern.
- Server Action results already follow one consistent, safe shape across every feature: `{ ok: true; data? } | { ok: false; message: string; fieldErrors?: ... }` (see `features/admin/actions.ts`). Messages returned this way are already validated/safe — no rewrite was needed or attempted here.
- `ErrorText` (`components/ui/form/Field.tsx`) already uses `role="alert"` for field-level errors — reused that same pattern for the new `ErrorState`.
- Reduced motion is already handled globally: `globals.css` collapses all `animation-duration`/`transition-duration` to ~0 under `prefers-reduced-motion: reduce`, so new spinner components don't need their own reduced-motion branch.

## B. Foundation created

New:

- `src/components/ui/Loader.tsx` — accessible spinner primitive (`role="status"`, `aria-live="polite"`), `sm`/`md`/`lg` sizes, optional visible label.
- `src/components/ui/ErrorState.tsx` — safe-message error display with optional retry button, `role="alert"`.
- `src/components/ui/EmptyState.tsx` — generic empty-result display (title/description/action), not CMS-specific.
- `src/lib/utils/getSafeErrorMessage.ts` — resolves a raw thrown `Error` to a safe fallback string for use in `error.tsx`/`global-error.tsx` only (Server Action results already carry their own safe messages and are untouched).
- `src/app/error.tsx` — app-level error boundary (covers both public and admin routes; both share the root layout, so one boundary suffices).
- `src/app/global-error.tsx` — root-layout-failure boundary; renders its own minimal `<html>/<body>`, deliberately dependency-free.
- `src/app/not-found.tsx` — generic not-found page; does not distinguish "never existed" from "draft/archived".
- `src/app/(site)/loading.tsx` — public-route loading boundary (centered `Loader`), sibling to the existing `src/app/admin/loading.tsx`.

Modified:

- `src/components/ui/Button.tsx` — added an optional `loading` prop (spinner + auto-disable + `aria-busy`). All existing variants, sizes, styles, and call sites are unchanged since the prop is optional and defaults to `false`.

Not created (inspected, judged unnecessary for 10A):

- Toast/notification system — no feature currently needs transient mutation feedback beyond the existing inline `ErrorText`/status-swap pattern; introducing one now would be unused scaffolding.
- Route-specific `loading.tsx`/`error.tsx` beyond the app-level and `(site)` ones — no route currently shows a distinct enough loading/failure shape to justify one yet.
- Rewrite of Server Action response shapes — already consistent and safe.

## C. Architecture

```
Route
  ↓
(site)/loading.tsx or admin/loading.tsx   — route loading boundary

Route render failure
  ↓
app/error.tsx (or app/global-error.tsx if the root layout itself fails)

Missing/inaccessible resource
  ↓
app/not-found.tsx

Mutation (existing per-feature useTransition pattern)
  ↓
pending state (Button `loading` prop now available)
  ↓
success (revalidate/refresh) or error (ErrorText / ErrorState)
```

## D. Accessibility

- `Loader`: `role="status"`, `aria-live="polite"`, label is screen-reader-only by default (`showLabel` to opt into a visible label).
- `ErrorState` / `error.tsx` / `global-error.tsx`: `role="alert"` so the message is announced immediately.
- `Button` `loading`: sets `aria-busy` and `disabled` together; spinner is `aria-hidden`.
- `not-found.tsx`: plain content semantics, a normal focusable link back to `/`.
- No component ships with a custom animation that ignores the project's global reduced-motion rule.

## E. Design-system integration

All new components use existing CSS custom properties only (`--color-border`, `--color-brand`, `--color-text-primary/secondary/muted`, `--color-error` via `ErrorText`, `--radius-lg`, `--text-body/small/caption`) and the existing `Button`, `Container`, and `TextLink` primitives. No new colors, radii, or type sizes were introduced.

## F. Deferred work

Explicitly deferred to later modules — no feature-specific pages, forms, or CMS tables were modified in 10A:

- **10B** — Public Website States (adopt `Loader`/`ErrorState`/`EmptyState` in public pages)
- **10C** — Admin CMS States (migrate each table's local `EmptyState` to the shared one; adopt `Button loading` in archive/delete buttons)
- **10D** — Forms / Authentication / Start Project
- **10E** — Media / Gallery States
- **10F** — Route Errors / Failure / Security QA
- **10G** — Final Production QA

## G. Verification

- `npm run lint` — 0 errors, 0 warnings.
- `npx tsc --noEmit` — 0 new errors. One pre-existing error remains, unrelated to 10A: `src/app/layout.tsx(23,50): error TS2304: Cannot find name 'LayoutProps'.`
- `rm -rf .next && npm run build` — succeeded. Build-time console output shows expected Supabase/dynamic-usage messages from routes that require request-time cookies/env (`/admin`, `getPublicTeamRows`, etc.) — these are pre-existing and unrelated to this module; no new errors were introduced.

## H. Remaining issues

- The pre-existing `LayoutProps` TypeScript error in `src/app/layout.tsx` is untouched and unrelated to 10A; noted for whichever module owns layout typing.
- Each admin table's local `EmptyState` duplicate is not yet migrated to the shared `components/ui/EmptyState.tsx` — left for 10C to avoid mixing CMS changes into this foundation module.
