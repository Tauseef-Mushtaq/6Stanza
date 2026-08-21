# MODULE 8 — Admin Dashboard & Operational Overview — Handoff

## A. Overview

`/admin` is now a real operational dashboard instead of a redirect straight to `/admin/inquiries`. It shows four metric cards (Total, New, In Progress, Resolved), a "Recent Inquiries" panel of the latest 8 inquiries across both types, and two quick-action links ("View all inquiries", "View new inquiries"). Nothing beyond that was added — no charts, no analytics, no CRM/notifications, per the spec's scope limit.

## B. Dashboard data

- **Total** — count of all rows in `contact_inquiries` + all rows in `project_inquiries`.
- **New / In Progress / Resolved** — count of rows with that `status` value, summed across both tables. `archived` is intentionally not a card (it remains fully visible/filterable in `/admin/inquiries`, per spec §5).
- **Recent Inquiries** — the latest 8 rows from `contact_inquiries` and the latest 8 from `project_inquiries` (each already the cheapest possible per-table query, ordered by `created_at desc`), merged into one list using the existing `toListItems` projection from Module 7A/7B, re-sorted, and trimmed to 8. Each row links to the existing `/admin/inquiries/contact/[id]` or `/admin/inquiries/project/[id]` route — no new detail page was created.

## C. Architecture

```
AdminDashboardPage (Server Component, src/app/admin/page.tsx)
        ↓
getAdminDashboardSummary() / getRecentInquiries()  (new: src/lib/services/adminDashboardService.ts)
        ↓
countContactInquiries / countProjectInquiries (new)
listContactInquiries / listProjectInquiries (existing, extended with an optional `limit`)
        ↓
createSupabaseServerClient() — same RLS-respecting server client every other repository uses
```

New pieces:

- `src/lib/services/adminDashboardService.ts` — the dashboard's data layer, following the existing `AdminListResult`/`AdminGetResult`-style pattern from `contactInquiryService.ts` (a new `AdminDashboardResult<T>` type was used instead of reusing `AdminGetResult<T>` directly, since the dashboard's `data` is never legitimately `null` the way a single fetched-by-id record can be).
- `countContactInquiries` / `countProjectInquiries` in the existing repositories — use `{ count: "exact", head: true }` so Postgres returns a row count only, never the rows themselves (spec §17).
- `listContactInquiries` / `listProjectInquiries` gained an optional `limit` parameter (backward compatible — existing callers pass nothing and are unaffected).
- `src/features/admin/components/MetricCard.tsx` and `RecentInquiries.tsx` — new, small, presentation-only components built on the existing `Card`, `Badge`, and `StatusBadge` primitives.

All 8 count queries and the 2 recent-list queries run via `Promise.all` inside their respective service functions — no N+1s, no client-side aggregation of inquiry records, no fetching full row sets just to count them.

## D. Security

No changes to `middleware.ts`, `src/app/admin/layout.tsx`, or `src/lib/auth/session.ts`. `/admin` still renders inside the same admin layout, whose server-side `getCurrentProfile()` + role check runs before this (or any) admin page's body executes — anonymous visitors are redirected to `/login`, authenticated non-admins to `/`, before any dashboard query fires. Every new query goes through `createSupabaseServerClient()` (the anon-key, RLS-respecting client), the same one every 7A repository already uses — no service-role client was introduced, and the existing `contact_inquiries_select_admin_only` / `project_inquiries_select_admin_only` RLS policies are what actually gate the reads at the database level, independent of the layout check.

## E. UX

- **Responsive:** metric cards use a `grid grid-cols-2 lg:grid-cols-4` — 2-up on mobile, 4-up on desktop. `RecentInquiries` rows stack vertically below `sm` and go to a single row (badge/name/company left, status/date right) at `sm` and up, matching the same mobile-card-first approach used for the inquiry list in Module 7B.
- **Loading:** reuses the existing shared `app/admin/loading.tsx` from Module 7A — it already renders a generic title-bar-plus-skeleton-blocks treatment for the whole `/admin` segment, which fits the dashboard without a dedicated loading file.
- **Empty:** with zero inquiries, every metric card correctly shows `0` (counts naturally return 0, nothing throws), and `RecentInquiries` shows "No inquiries yet." instead of an empty list.
- **Error:** if either query fails, the page shows a scoped inline error ("Unable to load the dashboard summary...` / `Unable to load recent inquiries...") in the relevant section only — a summary failure doesn't take down the recent-inquiries panel or vice versa. No Supabase/Postgres detail is ever surfaced; failures are logged server-side via `console.error` first.

## F. Verification

Actually run in the extracted project:

```
npx eslint src/features/admin src/app/admin src/lib/repositories src/lib/services   # no errors
npm run build      # ✓ Compiled successfully, TypeScript passed, 36/36 pages generated, /admin listed as ƒ (dynamic)
npm run lint       # ✓ no errors (full project)
```

Not verified: live browser testing against a real Supabase instance (no running dev server / database connection available in this environment), so the actual metric numbers, recent-inquiry ordering, and access-denial behavior for anonymous/non-admin sessions were not clicked through live. Static verification (clean build + typecheck + lint) and manual review of the query logic and the (unmodified) `AdminLayout` authorization stand in for it — flagging this explicitly rather than claiming it was tested. The count/list query logic itself follows the exact same repository patterns already exercised and verified in Modules 7A/7B.

## G. Remaining work

- Analytics (traffic, conversion, revenue, visitor trends) — explicitly out of scope, future module
- CMS, user management, media management — explicitly out of scope
- Notifications, exports, reporting engine — explicitly out of scope
- Advanced search / pagination on the inquiry list — deferred since Module 7B
