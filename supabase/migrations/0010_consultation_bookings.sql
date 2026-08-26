-- Module: Consultation Booking v1 (spec: "if booking persistence is
-- genuinely required, follow the existing Supabase architecture and
-- add only the minimum required schema").
--
-- Consultation Booking v1 does NOT build a custom calendar/availability
-- system — availability and slot selection are owned entirely by the
-- external scheduling provider (Cal.com; see
-- MODULE-CONSULTATION-BOOKING-1-HANDOFF.md). This table is a
-- read-side mirror of bookings that actually happened, written by the
-- provider's webhook, not by the browser — so a booking can only ever
-- be recorded here after the provider itself confirms it. No table
-- here can produce a "successful booking" the provider doesn't agree
-- happened.
--
-- `cal_booking_uid` is the provider's own booking identifier: the
-- natural idempotency key for a webhook that may be retried/redelivered
-- (spec: "duplicate/invalid booking attempt" must be handled, not
-- silently double-recorded).

create table public.consultation_bookings (
  id uuid primary key default gen_random_uuid(),
  -- Cal.com's booking UID (their `booking.uid`) — unique per real,
  -- provider-confirmed booking. `unique` is what makes webhook
  -- redelivery/retries idempotent (see repository's insert).
  cal_booking_uid text not null unique check (char_length(cal_booking_uid) between 1 and 200),
  event_type_slug text not null check (char_length(event_type_slug) between 1 and 200),
  attendee_name text not null check (char_length(attendee_name) between 1 and 200),
  attendee_email text not null check (char_length(attendee_email) between 1 and 320),
  -- Links back to the project inquiry that led here, when the visitor
  -- arrived via the Start Project → Book a Consultation path and the
  -- provider's booking form was seeded with it. Nullable: a
  -- consultation can also be booked without a prior inquiry existing
  -- (spec: booking is its own distinct action, not a required part of
  -- Start Project). `on delete set null`, not cascade — deleting an
  -- inquiry should never delete a booking record that already
  -- happened.
  project_inquiry_id uuid references public.project_inquiries (id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.inquiry_status not null default 'new',
  -- Full webhook payload, for auditing/debugging without needing a
  -- second migration every time a new field from the provider becomes
  -- relevant. Never rendered directly to any client — see repository.
  raw_payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger consultation_bookings_set_updated_at
  before update on public.consultation_bookings
  for each row execute function public.set_updated_at();

create index consultation_bookings_starts_at_idx
  on public.consultation_bookings (starts_at desc);

create index consultation_bookings_project_inquiry_id_idx
  on public.consultation_bookings (project_inquiry_id);

alter table public.consultation_bookings enable row level security;

-- Deliberately NO insert policy for `anon`/`authenticated`: the only
-- writer is the webhook route handler
-- (`src/app/api/webhooks/cal-booking/route.ts`), which uses the
-- service-role client (`src/lib/supabase/admin.ts`) and therefore
-- bypasses RLS entirely — exactly the "genuinely privileged operation
-- RLS can't express" case `admin.ts`'s own doc comment carves out,
-- since a webhook request has no visitor session/cookie for RLS to
-- evaluate in the first place. No policy here means the browser
-- cannot write to this table under any circumstance, at any privilege
-- level — which is intentional: a "successful booking" can only ever
-- be recorded server-side, after the provider confirms it.
create policy consultation_bookings_select_admin_only
  on public.consultation_bookings for select
  to authenticated
  using (public.is_admin());
