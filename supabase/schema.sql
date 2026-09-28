-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

-- Participants and their answers ------------------------------------------------
create table if not exists public.participants (
  id uuid primary key,
  first_name text not null,
  day1 jsonb,
  day2 jsonb,
  day3 jsonb,
  toolbox jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Emails allowed to view the dashboard ------------------------------------------
create table if not exists public.admins (
  email text primary key
);

alter table public.participants enable row level security;
alter table public.admins enable row level security;

-- No direct table access for anonymous visitors.
revoke all on public.participants from anon;
revoke all on public.admins from anon, authenticated;

-- Is the signed-in user an admin? --------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(auth.jwt() ->> 'email')
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- Admins can read every participant.
drop policy if exists "admins read participants" on public.participants;
create policy "admins read participants"
  on public.participants for select
  to authenticated
  using (public.is_admin());

grant select on public.participants to authenticated;

-- Participants save their answers only through this function (insert or update by id).
create or replace function public.upsert_participant(p jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text := left(trim(coalesce(p ->> 'firstName', '')), 100);
begin
  if (p ->> 'participantId') is null or v_name = '' then
    raise exception 'participantId and firstName are required';
  end if;

  if octet_length(p::text) > 50000 then
    raise exception 'payload too large';
  end if;

  insert into public.participants (id, first_name, day1, day2, day3, toolbox, created_at, updated_at)
  values (
    (p ->> 'participantId')::uuid,
    v_name,
    p -> 'day1',
    p -> 'day2',
    p -> 'day3',
    p -> 'toolbox',
    coalesce((p ->> 'createdAt')::timestamptz, now()),
    now()
  )
  on conflict (id) do update set
    first_name = excluded.first_name,
    day1 = excluded.day1,
    day2 = excluded.day2,
    day3 = excluded.day3,
    toolbox = excluded.toolbox,
    updated_at = now();
end;
$$;

revoke all on function public.upsert_participant(jsonb) from public;
grant execute on function public.upsert_participant(jsonb) to anon, authenticated;

-- After creating your admin user (Authentication -> Users -> Add user), run:
-- insert into public.admins (email) values ('your-email@example.com');
