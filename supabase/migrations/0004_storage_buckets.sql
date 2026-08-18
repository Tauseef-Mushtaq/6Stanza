-- Module 5 — Storage foundation for future CMS media (spec §15).
-- Buckets only — no upload UI, no rows written by this module. Public
-- read (this is marketing-site media meant to be publicly visible once
-- used) — write restricted to admins, matching the same public.is_admin()
-- helper the table policies use.

insert into storage.buckets (id, name, public)
values
  ('team', 'team', true),
  ('projects', 'projects', true),
  ('insights', 'insights', true),
  ('general', 'general', true)
on conflict (id) do nothing;

create policy storage_public_read
  on storage.objects for select
  to anon, authenticated
  using (bucket_id in ('team', 'projects', 'insights', 'general'));

create policy storage_admin_write
  on storage.objects for insert
  to authenticated
  with check (bucket_id in ('team', 'projects', 'insights', 'general') and public.is_admin());

create policy storage_admin_update
  on storage.objects for update
  to authenticated
  using (bucket_id in ('team', 'projects', 'insights', 'general') and public.is_admin());

create policy storage_admin_delete
  on storage.objects for delete
  to authenticated
  using (bucket_id in ('team', 'projects', 'insights', 'general') and public.is_admin());
