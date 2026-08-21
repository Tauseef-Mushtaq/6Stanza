-- Module 9K — CMS media upload & multi-image management (spec §4/§18).
--
-- Inspection before writing this (see MODULE-9K-HANDOFF.md §A for the
-- full list) found exactly one place in the current public UI with a
-- genuine multi-image contract: `ProjectGallery.tsx`'s four panels
-- ("Panels are structured gradient/diagram placeholders today, ready
-- to swap for real screenshots/video without touching the layout or
-- motion" — the component's own existing comment). Services, Team,
-- and Insights each have exactly one image slot (or none consumed
-- publicly at all), so none of them need a relation table — their
-- existing `media_path`/`image_path` columns on `services`/
-- `team_members`/`insights` are untouched by this migration.
--
-- A dedicated `project_media` table (not a generic polymorphic
-- `content_media` table) was chosen deliberately: Projects is the
-- only content type with a real gallery need right now, a real FK to
-- `projects.id` is simpler and safer than a polymorphic
-- `content_type text` + `content_id uuid` pair with no referential
-- integrity, and nothing in the current schema needs the same gallery
-- shape reused across multiple tables yet. If a second content type
-- genuinely needs a gallery later, that's the point to reconsider a
-- shared table — not before.

create table public.project_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.project_media is 'Module 9K — CMS gallery images for `projects` (spec §4/§13), rendered by `ProjectGallery.tsx`''s four panels. `storage_path` is relative to the existing `projects` Storage bucket (0004_storage_buckets.sql), following the `{project_id}/{uuid}.{ext}` convention generated server-side by `lib/cms/storage.ts` — never a path the admin typed by hand (spec §3/§7).';
comment on column public.project_media.alt_text is 'Optional accessibility text for the rendered `<Image>` (spec §17). Falls back to the parent project''s `title` at the public adapter layer when absent — see `publicProjects.ts`.';
comment on column public.project_media.sort_order is 'Deterministic gallery order (spec §21) — never insertion order or filename. Admin reorder control writes new integers here; the public adapter always orders by this column.';

create trigger project_media_set_updated_at
  before update on public.project_media
  for each row execute function public.set_updated_at();

create index project_media_project_id_sort_order_idx on public.project_media (project_id, sort_order);

alter table public.project_media enable row level security;

-- Public/authenticated-non-admin: only media belonging to a published
-- project (spec §23/§24 — draft-project galleries never leak through
-- this table's own RLS; the object itself is still only as private as
-- the `projects` bucket already is — see MODULE-9K-HANDOFF.md §C for
-- why that bucket stays public rather than moving to signed URLs).
create policy project_media_select_published
  on public.project_media for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_media.project_id and p.status = 'published'
    )
  );

create policy project_media_select_admin_all
  on public.project_media for select
  to authenticated
  using (public.is_admin());

create policy project_media_insert_admin_only
  on public.project_media for insert
  to authenticated
  with check (public.is_admin());

create policy project_media_update_admin_only
  on public.project_media for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy project_media_delete_admin_only
  on public.project_media for delete
  to authenticated
  using (public.is_admin());
