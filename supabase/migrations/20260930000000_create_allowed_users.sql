-- Migration: Create allowed_users table and auth helper functions
-- Description: Controls allowed readers for the invite-only access flow.

create table if not exists public.allowed_users (
  id           uuid primary key default gen_random_uuid(),
  email        text unique not null,
  name         text,
  role         text not null default 'reader' check (role in ('reader', 'admin')),
  status       text not null default 'invited' check (status in ('invited', 'active')),
  invited_by   uuid references auth.users(id) on delete set null,
  has_password boolean not null default false,
  created_at   timestamptz not null default now(),
  activated_at timestamptz
);

alter table public.allowed_users enable row level security;

-- Strip default privileges
revoke all on public.allowed_users from anon, authenticated;

-- Policies for allowed_users:
-- 1. Admin can view all allowed users
create policy "allowed_users_admin_select"
  on public.allowed_users for select
  to authenticated
  using ( public.is_admin() );

-- 2. Admin can insert new allowed users
create policy "allowed_users_admin_insert"
  on public.allowed_users for insert
  to authenticated
  with check ( public.is_admin() );

-- 3. Admin can update, and user can update their own row once authenticated
create policy "allowed_users_update"
  on public.allowed_users for update
  to authenticated
  using ( public.is_admin() or lower(email) = lower(coalesce(auth.jwt()->>'email', '')) )
  with check ( public.is_admin() or lower(email) = lower(coalesce(auth.jwt()->>'email', '')) );

-- 4. Admin can delete allowed users
create policy "allowed_users_admin_delete"
  on public.allowed_users for delete
  to authenticated
  using ( public.is_admin() );

grant select, insert, update, delete on public.allowed_users to authenticated;
grant all on public.allowed_users to service_role;

-- Function: check_user_auth_status
-- Security definer so unauthenticated clients can check if an email is authorized
-- without having access to query all rows of allowed_users or auth.users.
create or replace function public.check_user_auth_status(lookup_email text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  norm_email text := lower(trim(lookup_email));
  auth_user_id uuid;
  user_has_pwd boolean := false;
  is_allowed boolean := false;
  user_name text := null;
  allow_row record;
begin
  if norm_email is null or norm_email = '' then
    return json_build_object(
      'allowed', false,
      'hasPassword', false,
      'isFirstAccess', false,
      'message', 'E-mail inválido.'
    );
  end if;

  -- 1. Check if user already exists in auth.users
  select id, (encrypted_password is not null and encrypted_password != '')
    into auth_user_id, user_has_pwd
    from auth.users
    where lower(email) = norm_email
    limit 1;

  -- 2. Check if user is in allowed_users
  select * into allow_row
    from public.allowed_users
    where lower(email) = norm_email
    limit 1;

  if allow_row.id is not null then
    is_allowed := true;
    user_name := allow_row.name;
    if allow_row.has_password then
      user_has_pwd := true;
    end if;
  end if;

  -- If user is in auth.users
  if auth_user_id is not null then
    -- Check profile for name if not in allowed_users
    if user_name is null then
      select name into user_name from public.profiles where id = auth_user_id;
    end if;

    return json_build_object(
      'allowed', true,
      'hasPassword', user_has_pwd,
      'isFirstAccess', not user_has_pwd,
      'name', coalesce(user_name, split_part(norm_email, '@', 1))
    );
  end if;

  -- If only in allowed_users (not yet signed in / no auth.users record yet)
  if is_allowed then
    return json_build_object(
      'allowed', true,
      'hasPassword', user_has_pwd,
      'isFirstAccess', true,
      'name', coalesce(user_name, split_part(norm_email, '@', 1))
    );
  end if;

  -- Neither in auth.users nor in allowed_users
  return json_build_object(
    'allowed', false,
    'hasPassword', false,
    'isFirstAccess', false,
    'message', 'E-mail não autorizado pela coordenação da biblioteca.'
  );
end;
$$;

revoke execute on function public.check_user_auth_status(text) from public;
grant execute on function public.check_user_auth_status(text) to anon, authenticated, service_role;

-- Function: complete_user_first_access
-- Updates allowed_users status when password is set
create or replace function public.complete_user_first_access(user_email text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  norm_email text := lower(trim(user_email));
begin
  update public.allowed_users
  set status = 'active',
      has_password = true,
      activated_at = now()
  where lower(email) = norm_email;
end;
$$;

revoke execute on function public.complete_user_first_access(text) from public;
grant execute on function public.complete_user_first_access(text) to authenticated, service_role;

-- Seed known fixture emails if allowed_users was empty
insert into public.allowed_users (email, name, role, status, has_password)
values
  ('admin@cnviegas.org', 'Coordenação da Biblioteca', 'admin', 'active', true),
  ('leitor@cnviegas.org', 'Leitor Comunitário', 'reader', 'active', true),
  ('beatriz@cnviegas.org', 'Beatriz Nascimento', 'reader', 'active', true),
  ('lucas@cnviegas.org', 'Lucas Andrade', 'reader', 'active', true)
on conflict (email) do nothing;
