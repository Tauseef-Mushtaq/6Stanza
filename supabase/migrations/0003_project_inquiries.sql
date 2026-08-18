-- Module 5 — project_inquiries (spec §9), schema shaped to match the
-- actual `ProjectInquiry` interface in
-- src/features/start-project/data/inquiry.ts — the form was not
-- changed to fit the backend (spec §9: "the backend must adapt to the
-- existing form").

create table public.project_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 200),
  email text not null check (char_length(email) between 1 and 320),
  company text check (company is null or char_length(company) <= 200),
  project_title text not null check (char_length(project_title) between 1 and 200),
  -- Service slugs (e.g. "web-development") — kept as text[] rather
  -- than a normalized join table for now: this module intentionally
  -- does not migrate `features/home/data/services.ts` into the
  -- database (spec §16 — "future CMS content, not required for Module
  -- 5"), so there is no `services` table yet for a foreign key to
  -- reference. Application-layer validation
  -- (lib/validation/projectInquiry.ts) checks each slug against the
  -- current canonical list at submission time instead.
  services text[] not null check (array_length(services, 1) >= 1),
  stage text,
  timeline text,
  budget text,
  message text not null check (char_length(message) between 1 and 5000),
  status public.inquiry_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger project_inquiries_set_updated_at
  before update on public.project_inquiries
  for each row execute function public.set_updated_at();

create index project_inquiries_status_created_at_idx
  on public.project_inquiries (status, created_at desc);

alter table public.project_inquiries enable row level security;

create policy project_inquiries_insert_anyone
  on public.project_inquiries for insert
  to anon, authenticated
  with check (true);

create policy project_inquiries_select_admin_only
  on public.project_inquiries for select
  to authenticated
  using (public.is_admin());

create policy project_inquiries_update_admin_only
  on public.project_inquiries for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
