# MODULE-CONSULTATION-BOOKING-1 — Handoff

## Summary

Adds a "Book a Consultation" step to the existing Start Project journey:

```
Start Project / Smart Discovery
        ↓
Inquiry (unchanged)
        ↓
Book a Consultation (new)
        ↓
Real Cal.com availability (new)
        ↓
Booking confirmed (new)
```

Before writing any code, the repository was inspected end-to-end (`package.json`, `src/`, `supabase/migrations/`) for an existing calendar/booking integration. **None exists** — no booking table, no scheduling SDK, no calendar dependency. This module therefore introduces the smallest integration-ready architecture rather than a custom calendar.

## Architecture chosen

**Cal.com inline embed**, loaded via Cal.com's own official vanilla-JS "queue" snippet (the same one `@calcom/embed-react` wraps) — no new npm dependency was added for this.

Why this over a custom calendar:
- Availability, timezone handling, double-booking prevention, and reschedule/cancel UX are all owned by the provider. Building any of that in-house would be exactly the "complex custom calendar system" the brief explicitly rules out.
- The embed renders **real, live availability** pulled from Cal.com at render time. Nothing in this module hardcodes or fabricates time slots — the UI, error, and empty states can only ever show what the provider itself reports (see "Never simulate successful booking" below).
- It reuses the site's own visual shell (`Container`, `Reveal`, `Loader`, `ErrorState`, `EmptyState`, design tokens) around the embed, so the surrounding page still looks and feels like 6STANZA; only the calendar widget itself is Cal.com's UI.

## Data flow

```
Visitor clicks "Book a Consultation" (from inquiry SuccessState, or directly)
        ↓
/start-project/consultation renders CalEmbed (client component)
        ↓
Cal.com embed script loads → inline iframe shows REAL availability
        ↓
Visitor picks a slot and confirms in Cal.com's own form
        ↓
Cal.com fires `bookingSuccessful` (postMessage event) → BookingConfirmedState renders
        │
        └── independently, Cal.com POSTs a `BOOKING_CREATED` webhook →
            /api/webhooks/cal-booking
                ↓
            HMAC signature verified (CAL_COM_WEBHOOK_SECRET)
                ↓
            recordConsultationBooking (validation → service → repository)
                ↓
            consultation_bookings table (Supabase), upserted on cal_booking_uid
```

Two independent confirmation paths are intentional:
- The **browser-side** `bookingSuccessful` event drives what the *visitor* sees (their own confirmation screen) — fast, but not itself proof a booking was durably recorded.
- The **webhook** is the only path that ever writes to Supabase, and only fires after Cal.com's own backend has confirmed the booking. A visitor can never cause a database row to exist just by loading a page or calling a client function — persistence is gated entirely on the provider's own server-to-server confirmation.

## Files added / modified

**New:**
- `supabase/migrations/0010_consultation_bookings.sql`
- `src/lib/validation/consultationBooking.ts`
- `src/lib/repositories/consultationBookings.ts`
- `src/lib/services/consultationBookingService.ts`
- `src/app/api/webhooks/cal-booking/route.ts`
- `src/features/consultation-booking/config.ts`
- `src/features/consultation-booking/lib/loadCalEmbed.ts`
- `src/features/consultation-booking/components/CalEmbed.tsx`
- `src/features/consultation-booking/components/BookingConfirmedState.tsx`
- `src/features/consultation-booking/sections/ConsultationBookingPageContent.tsx`
- `src/app/(site)/start-project/consultation/page.tsx`

**Modified (additive only):**
- `src/lib/supabase/database.types.ts` — added `consultation_bookings` table type
- `src/features/start-project/sections/SuccessState.tsx` — added a "Book a Consultation →" link; existing links/copy/behavior unchanged
- `src/features/start-project/sections/StartProjectPageContent.tsx` — `SuccessState` now receives the submitted inquiry's `name`/`email` (local state only, for query-string prefill); submission flow itself is unchanged
- `src/features/start-project/sections/ProjectForm.tsx` — `onSuccess` callback now passes the submitted `ProjectInquiry` back to its caller instead of firing with no arguments; `submitInquiry`/`validateInquiry` are untouched
- `.env.local` — appended `NEXT_PUBLIC_CAL_COM_LINK` and `CAL_COM_WEBHOOK_SECRET` (documented, left blank)

**Explicitly not touched:** `src/features/start-project/data/inquiry.ts`, `src/lib/validation/projectInquiry.ts`, `src/lib/services/projectInquiryService.ts`, `src/lib/repositories/projectInquiries.ts`, `src/features/start-project/actions.ts`, `src/features/start-project/lib/submitInquiry.ts`, all CMS/SEO/testimonials/auth/admin code, all existing migrations.

## Environment configuration required

| Variable | Scope | Required for |
|---|---|---|
| `NEXT_PUBLIC_CAL_COM_LINK` | Public (client) | The embed to render at all. Cal.com booking link/slug, e.g. `6stanza/consultation`. |
| `CAL_COM_WEBHOOK_SECRET` | Server-only | Booking persistence (the webhook route). |

Production setup (outside this codebase):
1. Create/confirm a Cal.com account and an "Event Type" for consultations (e.g. `6stanza/consultation`).
2. Set `NEXT_PUBLIC_CAL_COM_LINK` to that event type's link in the hosting platform's environment variables.
3. In Cal.com → Settings → Developer → Webhooks, add a webhook pointed at `https://<production-domain>/api/webhooks/cal-booking`, subscribed at minimum to `BOOKING_CREATED`, with a secret.
4. Set `CAL_COM_WEBHOOK_SECRET` in the hosting platform to that same secret.
5. Run `supabase/migrations/0010_consultation_bookings.sql` against the real Supabase project (same process as every other migration in this repo).

**If `NEXT_PUBLIC_CAL_COM_LINK` is not set**, `/start-project/consultation` renders an explicit `EmptyState` ("Consultation booking isn't configured yet…") rather than a blank page, a fake calendar, or a broken embed. **No booking can ever be simulated or faked** by this module under any configuration state.

## Security considerations

- `CAL_COM_WEBHOOK_SECRET` is read only in a `server-only`-guarded route handler; never sent to the client.
- The webhook route verifies Cal.com's `x-cal-signature-256` HMAC over the raw request body using `crypto.timingSafeEqual` before parsing or trusting any payload field. Requests without a valid signature are rejected with `401`; if the secret itself isn't configured, the route rejects everything with `503` rather than accepting unverified writes.
- `consultation_bookings` has **no insert policy** for `anon`/`authenticated` — the only writer is the webhook's service-role client (`getSupabaseAdminClient()`), matching the existing carve-out documented in `src/lib/supabase/admin.ts` for "genuinely privileged operations RLS can't express" (a webhook has no visitor session for RLS to evaluate against in the first place).
- Redelivered/retried webhooks are idempotent via `upsert(..., { onConflict: "cal_booking_uid" })` — a duplicate delivery updates the existing row rather than creating a second booking record.
- The optional `inquiryId` passed from the inquiry success screen to the booking page is carried only as a UI convenience query param and later as Cal.com "metadata" — it is never trusted as an assertion of identity or ownership; the foreign key column allows `null` and simply links a booking back to an inquiry when present.

## Verification status

Ran in this environment (network-restricted sandbox, no live Cal.com/Supabase credentials):

- `npx tsc --noEmit` — clean, aside from one **pre-existing** unrelated error in `src/app/layout.tsx` (`LayoutProps`), present before this module and untouched by it.
- `npm run lint` — clean, aside from one **pre-existing** unrelated `react-hooks/set-state-in-effect` warning-as-error in `StartProjectPageContent.tsx`'s discovery-prefill effect, which predates this module (only the callback signature it invokes was touched, not that effect).
- `npm run build` — **compiles successfully** (`✓ Compiled successfully`). `/start-project/consultation` and `/api/webhooks/cal-booking` both appear correctly in the route output. Build-time console noise about "Dynamic server usage… cookies" on unrelated routes (`/`, `/services`, `/admin`, `/sitemap.xml`, etc.) is pre-existing behavior of this sandbox's placeholder Supabase credentials having no real network access, not a failure introduced here.

**Not verified in this environment** (no live provider/credentials/browser available here — requires a deployed environment with real `NEXT_PUBLIC_CAL_COM_LINK`/`CAL_COM_WEBHOOK_SECRET`):
- Real/available slots rendering from an actual Cal.com calendar
- Unavailable-state rendering (a fully-booked event type)
- A live booking error (network failure loading the embed)
- An actual successful booking end-to-end, including webhook delivery and Supabase persistence
- Duplicate/redelivered webhook idempotency against a live Cal.com retry
- Mobile viewport rendering of the embed
- Keyboard navigation through Cal.com's own iframe UI
- `prefers-reduced-motion` behavior end-to-end in a real browser

What *was* verified by code inspection/build:
- `/start-project` direct → inquiry submission path is unchanged (`submitInquiry`, `validateInquiry`, `projectInquirySchema`, `insertProjectInquiry` were not modified)
- Smart Discovery → Start Project prefill bridge (`prefillBridge.ts`) is untouched
- `CalEmbed` has explicit `loading` / `error` (with retry) / `empty` (unconfigured) / `ready` states, each independently reachable and none faking availability
- `role="region"` + `aria-label`/`aria-busy` on the embed container; Cal.com's iframe is natively tabbable, so no custom keyboard handling was needed or added
- `useReducedMotion()` is read in `CalEmbed`; the one CSS transition this module owns (a min-height ramp on the embed container) is disabled under reduced motion, matching the site's existing `Reveal`/`Loader` bail-out pattern

## Known limitations (v1)

- Only `BOOKING_CREATED` is recorded. Cancellations/reschedules (`BOOKING_CANCELLED`, `BOOKING_RESCHEDULED`) are acknowledged (200, to stop Cal.com retries) but not yet written — `consultation_bookings.status` exists for this but nothing currently transitions it.
- No admin UI for viewing bookings yet. The table and admin-only `select` RLS policy exist so a future module can add one without another migration; today, bookings are inspectable only via the Supabase dashboard.
- No email/notification logic beyond what Cal.com sends natively (its own confirmation email + calendar invite).
- The `bookingSuccessful` browser event and the webhook are not reconciled client-side — if a webhook delivery is delayed or fails, the visitor still sees `BookingConfirmedState` (correct, since Cal.com itself confirmed the booking), but the Supabase record may lag briefly or, in a true webhook failure, never arrive. This module does not add retry/backfill tooling for that gap.
- No analytics were added, per scope.
