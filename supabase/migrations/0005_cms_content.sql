-- Module 9A — CMS database & content foundation (spec §2–§9, §26).
--
-- Schema below is built directly from the real frontend content
-- sources, inspected before writing this migration:
--   src/features/home/data/services.ts       (ServiceItem)
--   src/features/services/data/serviceDetails.ts (ServiceDetail)
--   src/features/home/data/projects.ts        (ProjectItem)
--   src/features/projects/data/projectDetails.ts (ProjectDetail)
--   src/features/home/data/team.ts            (TeamMember)
--   src/features/insights/data/insights.ts    (Insight / InsightBlock)
-- See MODULE-9A-HANDOFF.md §A/§B for the full mapping and the reasoning
-- behind Six S staying out of this migration entirely.
--
-- This migration only adds tables — none of the existing static
-- frontend data files are touched or migrated into these tables yet
-- (spec §28/§29). No admin UI reads or writes these tables in this
-- module either; the repositories/services in src/lib/{repositories,
-- services}/* are the ready-to-consume foundation for Module 9B+.

create type public.content_status as enum ('draft', 'published', 'archived');

comment on type public.content_status is 'Shared publication-state enum for every CMS-managed content table (spec §4). Deliberately just draft/published/archived — no pending_review/scheduled/approved states, since nothing in the current admin foundation needs them yet.';

-- ---------------------------------------------------------------------
-- services
--
-- Merges the two real frontend shapes keyed by the same `slug`:
--   services.ts     -> category, label(name), description, tags, visual(icon_key)
--   serviceDetails.ts -> problem, capabilities, architecture, principles
-- Kept as one table (not two) because every current serviceDetails row
-- has exactly one corresponding services row and the detail page always
-- reads both together — splitting them would just reintroduce the
-- lookup-by-slug the frontend already does across two files today.
-- ---------------------------------------------------------------------

create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null check (char_length(name) between 1 and 200),
  category text not null check (char_length(category) between 1 and 100),
  short_description text not null check (char_length(short_description) between 1 and 1000),
  tags text[] not null default '{}',
  icon_key text not null check (char_length(icon_key) between 1 and 50),
  problem text,
  capabilities text[] not null default '{}',
  architecture text[] not null default '{}',
  principles smallint[] not null default '{}',
  media_path text,
  sort_order integer not null default 0,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  constraint services_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint services_slug_key unique (slug)
);

comment on table public.services is 'CMS foundation for the service offerings currently hardcoded in src/features/home/data/services.ts + src/features/services/data/serviceDetails.ts. Not read by the public frontend yet — see spec §28.';
comment on column public.services.icon_key is 'Corresponds to ServiceItem.visual (e.g. "web", "cloud", "devops") — which visual pattern ServiceVisual renders.';
comment on column public.services.principles is 'Indices into the static Six S list (src/features/home/data/sixS.ts), matching ServiceDetail.principles. Six S itself is not a CMS table — see MODULE-9A-HANDOFF.md §B.';

create trigger services_set_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

create index services_status_sort_order_idx on public.services (status, sort_order);
create index services_status_published_at_idx on public.services (status, published_at);

alter table public.services enable row level security;

create policy services_select_published
  on public.services for select
  to anon, authenticated
  using (status = 'published');

create policy services_select_admin_all
  on public.services for select
  to authenticated
  using (public.is_admin());

create policy services_insert_admin_only
  on public.services for insert
  to authenticated
  with check (public.is_admin());

create policy services_update_admin_only
  on public.services for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy services_delete_admin_only
  on public.services for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------
-- projects
--
-- Merges src/features/home/data/projects.ts (ProjectItem, the
-- canonical list/index shape) with src/features/projects/data/
-- projectDetails.ts (ProjectDetail, the case-study narrative), for the
-- same reason as `services` above. `architecture` stores the
-- ArchitectureGroup[] shape (label + items) as jsonb since it's a
-- small, always-together structure rather than a real relationship.
-- ---------------------------------------------------------------------

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null check (char_length(title) between 1 and 200),
  category text not null check (char_length(category) between 1 and 150),
  description text not null check (char_length(description) between 1 and 2000),
  technologies text[] not null default '{}',
  outcome text not null check (char_length(outcome) between 1 and 200),
  accent integer not null default 200,
  positioning text,
  overview_summary text,
  overview_contribution text,
  challenge text,
  solution text,
  architecture jsonb not null default '[]',
  outcome_statement text,
  media_path text,
  sort_order integer not null default 0,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  constraint projects_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint projects_slug_key unique (slug)
);

comment on table public.projects is 'CMS foundation for case studies currently hardcoded in src/features/home/data/projects.ts + src/features/projects/data/projectDetails.ts. Not read by the public frontend yet — see spec §28.';
comment on column public.projects.accent is 'ProjectItem.accent — deterministic gradient hue for the placeholder visual, kept as-is rather than replaced by real imagery (spec §11 says not to invent fields; this one already exists).';
comment on column public.projects.architecture is 'ArchitectureGroup[] ({ label, items }) from ProjectDetail.architecture. Stored as jsonb, not a join table — always read/written together with the project, not queried independently (spec §14).';

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create index projects_status_sort_order_idx on public.projects (status, sort_order);
create index projects_status_published_at_idx on public.projects (status, published_at);

alter table public.projects enable row level security;

create policy projects_select_published
  on public.projects for select
  to anon, authenticated
  using (status = 'published');

create policy projects_select_admin_all
  on public.projects for select
  to authenticated
  using (public.is_admin());

create policy projects_insert_admin_only
  on public.projects for insert
  to authenticated
  with check (public.is_admin());

create policy projects_update_admin_only
  on public.projects for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy projects_delete_admin_only
  on public.projects for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------
-- team_members
--
-- Matches src/features/home/data/team.ts (TeamMember) directly. That
-- interface already has its own `slug` (used by the dedicated /team
-- page's individual-focus chapter — spec §6 says to inspect before
-- deciding), so team_members gets a slug/uniqueness constraint like
-- services/projects rather than being treated as non-route-addressable.
-- `social_links` mirrors TeamMember.socialLinks ({ label, href }[]).
-- ---------------------------------------------------------------------

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null check (char_length(name) between 1 and 200),
  role text not null check (char_length(role) between 1 and 200),
  discipline text not null check (char_length(discipline) between 1 and 100),
  short_bio text not null check (char_length(short_bio) between 1 and 1000),
  initials text not null check (char_length(initials) between 1 and 4),
  image_path text,
  social_links jsonb not null default '[]',
  sort_order integer not null default 0,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  constraint team_members_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint team_members_slug_key unique (slug)
);

comment on table public.team_members is 'CMS foundation for src/features/home/data/team.ts. Not read by the public frontend yet — see spec §28.';
comment on column public.team_members.image_path is 'Corresponds to TeamMember.image — optional real portrait path. Falls back to initials in the frontend when absent, same as today.';

create trigger team_members_set_updated_at
  before update on public.team_members
  for each row execute function public.set_updated_at();

create index team_members_status_sort_order_idx on public.team_members (status, sort_order);

alter table public.team_members enable row level security;

create policy team_members_select_published
  on public.team_members for select
  to anon, authenticated
  using (status = 'published');

create policy team_members_select_admin_all
  on public.team_members for select
  to authenticated
  using (public.is_admin());

create policy team_members_insert_admin_only
  on public.team_members for insert
  to authenticated
  with check (public.is_admin());

create policy team_members_update_admin_only
  on public.team_members for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy team_members_delete_admin_only
  on public.team_members for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------
-- insights
--
-- Matches src/features/insights/data/insights.ts (Insight/InsightBlock)
-- directly. `content` stores the InsightBlock[] union verbatim as
-- jsonb — it's a small, block-based document body, not a set of
-- relational rows, and the frontend already renders it as one
-- ordered array. No `author`/`cover_image` columns: the current
-- Insight interface has neither, so none are invented here (spec
-- §13/§16) — `media_path` is included only because the `insights`
-- Storage bucket already exists specifically for this table's future
-- cover imagery (Module 5, spec §17), not as a generic CMS field.
-- No `sort_order`: insights are ordered by `published_at`, matching
-- how `insights.ts` is already ordered by `date`.
-- ---------------------------------------------------------------------

create table public.insights (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null check (char_length(title) between 1 and 200),
  category text not null check (char_length(category) between 1 and 100),
  excerpt text not null check (char_length(excerpt) between 1 and 500),
  content jsonb not null default '[]',
  reading_time text not null check (char_length(reading_time) between 1 and 20),
  media_path text,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  constraint insights_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint insights_slug_key unique (slug)
);

comment on table public.insights is 'CMS foundation for src/features/insights/data/insights.ts. Not read by the public frontend yet — see spec §28.';
comment on column public.insights.content is 'InsightBlock[] union (paragraph/heading/quote/list/code/callout) stored verbatim, matching Insight.content.';

create trigger insights_set_updated_at
  before update on public.insights
  for each row execute function public.set_updated_at();

create index insights_status_published_at_idx on public.insights (status, published_at desc);

alter table public.insights enable row level security;

create policy insights_select_published
  on public.insights for select
  to anon, authenticated
  using (status = 'published');

create policy insights_select_admin_all
  on public.insights for select
  to authenticated
  using (public.is_admin());

create policy insights_insert_admin_only
  on public.insights for insert
  to authenticated
  with check (public.is_admin());

create policy insights_update_admin_only
  on public.insights for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy insights_delete_admin_only
  on public.insights for delete
  to authenticated
  using (public.is_admin());
