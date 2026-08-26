-- MODULE-TESTIMONIAL-1 — Testimonials CMS foundation (spec §2/§8/§24).
--
-- Follows the exact table/RLS/index shape established for
-- services/projects/team_members/insights in 0005_cms_content.sql:
-- same `content_status` enum, same publish/draft/archive lifecycle,
-- same admin-only write policies, same `set_updated_at` trigger.
--
-- No `slug` column — unlike Services/Projects/Team/Insights,
-- testimonials have no public detail route to key by slug (spec §2:
-- "do not invent unnecessary fields"); admin read/write is by `id`,
-- same as `contact_inquiries`/`project_inquiries`.
--
-- `project_id` is a nullable FK to `public.projects` (spec §3) so a
-- testimonial can optionally be attributed to a specific case study
-- without requiring one — `on delete set null` so deleting a project
-- never cascades into deleting real client testimonial content.

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 200),
  role text check (role is null or char_length(role) between 1 and 200),
  company text check (company is null or char_length(company) between 1 and 200),
  quote text not null check (char_length(quote) between 1 and 2000),
  image_path text,
  project_id uuid references public.projects (id) on delete set null,
  sort_order integer not null default 0,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

comment on table public.testimonials is 'CMS content for client testimonials (spec MODULE-TESTIMONIAL-1). No public detail route — read/written by id, same as inquiries. Real client-supplied content only; never seeded with placeholder data.';
comment on column public.testimonials.project_id is 'Optional attribution to the case study this testimonial is about. Nullable — most testimonials will have no project relationship.';
comment on column public.testimonials.image_path is 'Storage-relative path in the `general` bucket (same bucket Services/Insights already use), matching mediaPathSchema. Optional — the public card renders correctly with initials-style treatment when empty.';

create trigger testimonials_set_updated_at
  before update on public.testimonials
  for each row execute function public.set_updated_at();

create index testimonials_status_sort_order_idx on public.testimonials (status, sort_order);
create index testimonials_project_id_idx on public.testimonials (project_id);

alter table public.testimonials enable row level security;

create policy testimonials_select_published
  on public.testimonials for select
  to anon, authenticated
  using (status = 'published');

create policy testimonials_select_admin_all
  on public.testimonials for select
  to authenticated
  using (public.is_admin());

create policy testimonials_insert_admin_only
  on public.testimonials for insert
  to authenticated
  with check (public.is_admin());

create policy testimonials_update_admin_only
  on public.testimonials for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy testimonials_delete_admin_only
  on public.testimonials for delete
  to authenticated
  using (public.is_admin());
