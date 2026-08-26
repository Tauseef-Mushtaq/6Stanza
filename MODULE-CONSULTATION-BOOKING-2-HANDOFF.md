# Module: Consultation Booking 2 — Admin Bookings UI

## Summary

Adds an Admin → Consultation Bookings section so admins can see bookings that
Consultation Booking v1's Cal.com webhook already writes to
`consultation_bookings`. This module is read-only: it does not touch the
Cal.com integration, the webhook route, or the `consultation_bookings` schema.

## Files changed

**New:**
- `src/features/admin/components/BookingStatusFilterTabs.tsx` — status filter
  nav, same pattern as `InquiryFilterTabs.tsx`. Reuses `inquiryStatusValues`
  (`lib/validation/adminInquiry.ts`) since `consultation_bookings.status`
  reuses the same `inquiry_status` Postgres enum.
- `src/features/admin/components/ConsultationBookingTable.tsx` — booking list:
  mobile stacked cards + desktop table, same responsive split as
  `InquiryTable.tsx`. Columns: client name, email, consultation start,
  status, created date. Distinguishes "no bookings yet" from "no bookings
  match this filter" in its empty state.
- `src/app/admin/consultation-bookings/page.tsx` — list page (Server
  Component). Reads `?status=` from the URL, calls
  `listConsultationBookingsForAdmin`, renders the table or an error alert.
- `src/app/admin/consultation-bookings/[id]/page.tsx` — detail page (Server
  Component). Calls `getConsultationBookingForAdmin`; if the booking has a
  `project_inquiry_id`, also calls the existing
  `getProjectInquiryForAdmin` (Module 7A) to show the related inquiry, with
  its own independent loading/error handling.

**Modified:**
- `src/lib/repositories/consultationBookings.ts` — added `listConsultationBookings(status?)`
  and `getConsultationBooking(id)`, both using `createSupabaseServerClient()`
  (RLS-respecting), unlike the existing `upsertConsultationBooking` which
  uses the service-role admin client for the webhook write path. No schema
  or existing-function changes.
- `src/lib/services/consultationBookingService.ts` — added
  `listConsultationBookingsForAdmin(status?)` and
  `getConsultationBookingForAdmin(id)`, same discriminated
  `{ ok: true, data } | { ok: false, message }` result shape as
  `contactInquiryService.ts`'s admin reads (imports those result types rather
  than redeclaring them). No changes to `recordConsultationBooking` or the
  webhook-facing code.
- `src/features/admin/components/AdminNav.tsx` — added one entry
  (`{ href: "/admin/consultation-bookings", label: "Bookings" }`) to the
  single `adminLinks` array consumed by both the desktop and mobile nav
  blocks.

**No changes to:** the Cal.com webhook route, `calBookingWebhookSchema`,
`upsertConsultationBooking`, `0010_consultation_bookings.sql`, or
`database.types.ts`. No new migration was added.

## Admin route / navigation added

- `/admin/consultation-bookings` — list, with `?status=` filter tabs (All /
  New / In Progress / Resolved / Archived).
- `/admin/consultation-bookings/[id]` — detail view.
- "Bookings" added to the admin nav, between "Inquiries" and "Services", in
  both the desktop nav row and the mobile collapse panel (same array).

## Data flow

```
Admin visits /admin/consultation-bookings[?status=]
  → page.tsx (Server Component)
  → listConsultationBookingsForAdmin(status)      [service]
  → listConsultationBookings(status)               [repository]
  → createSupabaseServerClient() query, RLS-gated by
    consultation_bookings_select_admin_only         [0010 migration, unchanged]
  → ConsultationBookingTable renders rows or empty/error state

Admin opens a booking
  → [id]/page.tsx (Server Component)
  → getConsultationBookingForAdmin(id) → getConsultationBooking(id) → RLS-gated read
  → if project_inquiry_id is set: getProjectInquiryForAdmin(id)      [Module 7A, reused]
  → detail card renders full record + related inquiry link (or "no related inquiry")
```

Nothing in the new UI queries Supabase directly — both pages only call the
service layer, which calls the repository layer, matching the existing
inquiries module's shape.

## Authorization behavior

- `src/app/admin/layout.tsx` (unchanged) is the first gate: an anonymous
  visitor is redirected to `/login`, a non-admin authenticated user is
  redirected to `/`. Neither ever reaches the new pages or triggers any
  booking query.
- `consultation_bookings_select_admin_only` (existing RLS policy, unchanged)
  is the second, independent gate: the new repository reads use the
  cookie-scoped `createSupabaseServerClient()`, so even a request that
  somehow bypassed the layout redirect would still get zero rows back from
  Postgres unless the session's role is `admin`.
- No new insert/update policy or write path was added — this module is
  strictly read-only, consistent with "do not implement
  cancellation/reschedule synchronization yet."

## Verification status

Run in this environment (no live Supabase credentials configured here, so
runtime admin-login/click-through verification could not be executed
end-to-end):

- `npx tsc --noEmit` — no errors introduced by this module. One pre-existing
  error unrelated to this change (`src/app/layout.tsx`, `Cannot find name
  'LayoutProps'` — a Next.js-generated route type not present until
  `next build`/`next dev` regenerates `.next/types`; resolved automatically
  during the successful build below and not touched by this module).
- `npm run lint` — no errors introduced by this module. One pre-existing
  error in `src/features/start-project/sections/StartProjectPageContent.tsx`
  (unrelated file, not touched here).
- `npm run build` — succeeded. Build output lists both new routes:
  `/admin/consultation-bookings` and `/admin/consultation-bookings/[id]`.
  (Some `Dynamic server usage` log lines appear for cookie-dependent routes
  during static-page generation — expected in this sandbox without real
  Supabase env vars, not build failures; the build still completed with
  exit code 0.)

Not verified in this environment (requires a real deployment with Supabase
credentials and an actual admin session):
- Admin login → Consultation Bookings → bookings load
- Booking details open
- Empty state / error state against a live database
- Confirming a non-admin session is denied at the RLS layer in practice
- The full Cal.com booking → webhook → `consultation_bookings` → Admin
  Consultation Bookings chain end-to-end

These should be run against a staging environment with real credentials
before this ships.

## Known limitations

- **No timezone field.** The schema (`0010_consultation_bookings.sql`) has
  no timezone column — only UTC `timestamptz` values for `starts_at`/
  `ends_at`. Per the constraint against inventing fields or migrating
  unnecessarily, the detail/list views render these using the admin's own
  browser timezone (`toLocaleString`) rather than showing a stored timezone
  that doesn't exist.
- **No cancellation/reschedule status reflected.** The webhook service only
  records `BOOKING_CREATED` events (see
  `recordConsultationBookingService.ts`'s existing comment); a booking later
  cancelled or rescheduled in Cal.com will still show its original
  `starts_at`/`ends_at` and whatever `status` the row already had. This is
  explicitly out of scope for this module.
- **No admin-side status editing added.** The detail page displays
  `status` via the existing `StatusBadge` but does not add a status-change
  control for bookings — the task asked for visibility, not a new mutation
  path, so none was added to avoid overbuilding v1.
- **Related inquiry link points at the existing inquiry detail route**
  (`/admin/inquiries/project/[id]`) rather than duplicating inquiry fields
  on the booking page — kept intentionally thin.
