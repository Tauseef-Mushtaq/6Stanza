-- Module 5 — profiles + role foundation (spec §5/§6/§7).
-- Connects an authenticated auth.users row to application-level
-- profile info, with a `role` column the authorization helpers in
-- `src/lib/auth/session.ts` read instead of ever trusting a
-- client-supplied role.

create type public.profile_role as enum ('user', 'admin');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  role public.profile_role not null default 'user',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Application-level profile info, one row per auth.users row. role drives every requireAdmin() check — never inferred from email or client input.';

-- updated_at housekeeping, reused by every table in this migration set.
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profiles row whenever a new auth.users row is created,
-- so "authenticated user with no profile yet" is never a state the
-- app has to handle. security definer: runs as the function owner
-- (not the invoking user), which is required to insert into
-- public.profiles from a trigger on auth.users.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Prevents a user from granting themselves admin via a normal profile
-- update (the `profiles.Update` type in database.types.ts already
-- omits `role` at the TypeScript layer; this is the DB-level backstop
-- for that same rule — RLS alone can't express "this column may not
-- change" without a trigger). Admin role changes are deferred to the
-- future admin module's own privileged path (via the service-role
-- client, which bypasses this trigger's own is_admin() check
-- deliberately — see note below).
create function public.enforce_profile_role_immutable()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Only admins can change profile roles.';
  end if;
  return new;
end;
$$;

create trigger profiles_enforce_role_immutable
  before update on public.profiles
  for each row execute function public.enforce_profile_role_immutable();

-- security definer + a fixed search_path: the standard, recursion-safe
-- way to let an RLS policy ask "is the current user an admin?" without
-- the policy's own query against profiles recursively invoking RLS on
-- profiles again.
create function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;

create policy profiles_select_own_or_admin
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

create policy profiles_update_own_or_admin
  on public.profiles for update
  to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- No insert/delete policy for regular users: rows are created solely
-- by the handle_new_user trigger (security definer, bypasses RLS) and
-- deleted only via the auth.users cascade. Admins get insert/delete
-- through the future admin module's service-role path, not RLS.
