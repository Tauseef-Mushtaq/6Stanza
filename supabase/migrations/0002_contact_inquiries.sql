-- Module 5 — contact_inquiries (spec §8).
--
-- IMPORTANT: there is no contact form in the current frontend to wire
-- this to — /contact (ContactDetails.tsx) deliberately has no form and
-- points to /start-project instead. This table/RLS exist as the
-- backend foundation spec §8 asks for regardless; see
-- MODULE-5-HANDOFF.md's "Forms" section.

create type public.inquiry_status as enum ('new', 'in_progress', 'resolved', 'archived');

create table public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 200),
  email text not null check (char_length(email) between 1 and 320),
  message text not null check (char_length(message) between 1 and 5000),
  status public.inquiry_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.contact_inquiries is 'Not currently written to by any frontend form — see migration header comment.';

create trigger contact_inquiries_set_updated_at
  before update on public.contact_inquiries
  for each row execute function public.set_updated_at();

create index contact_inquiries_status_created_at_idx
  on public.contact_inquiries (status, created_at desc);

alter table public.contact_inquiries enable row level security;

-- Anonymous + authenticated visitors can submit — but per spec §7,
-- "anonymous users must NOT receive arbitrary read access": there is
-- deliberately no select policy for anon/authenticated below, so an
-- insert is genuinely write-only from a visitor's perspective (insert
-- doesn't implicitly grant the ability to read the row back, and
-- Supabase inserts don't return rows unless the caller can also
-- select them).
create policy contact_inquiries_insert_anyone
  on public.contact_inquiries for insert
  to anon, authenticated
  with check (true);

create policy contact_inquiries_select_admin_only
  on public.contact_inquiries for select
  to authenticated
  using (public.is_admin());

create policy contact_inquiries_update_admin_only
  on public.contact_inquiries for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
