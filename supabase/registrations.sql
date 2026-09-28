-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- Adds: the public-registration lead table, and a way to look up one
-- participant by id (needed by the new /start/:code personal links).

-- Leads from the public /register page --------------------------------------
create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text not null,
  consent_privacy boolean not null default false,
  consent_holdon boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.registrations enable row level security;

-- No direct table access for anyone - writes go through submit_registration,
-- reads go through the admin policy below (same pattern as participants).
revoke all on public.registrations from anon, authenticated;

create or replace function public.submit_registration(
  full_name text,
  phone text,
  email text,
  consent_privacy boolean,
  consent_holdon boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text := left(trim(coalesce(full_name, '')), 100);
  v_phone text := left(trim(coalesce(phone, '')), 30);
  v_email text := left(trim(coalesce(email, '')), 200);
begin
  if v_name = '' or v_phone = '' or v_email = '' then
    raise exception 'name, phone and email are required';
  end if;

  if not consent_privacy or not consent_holdon then
    raise exception 'both consents are required';
  end if;

  insert into public.registrations (full_name, phone, email, consent_privacy, consent_holdon)
  values (v_name, v_phone, v_email, true, true);
end;
$$;

revoke all on function public.submit_registration(text, text, text, boolean, boolean) from public;
grant execute on function public.submit_registration(text, text, text, boolean, boolean) to anon;

-- Admins can read every registration (lead), same pattern as participants.
drop policy if exists "admins read registrations" on public.registrations;
create policy "admins read registrations"
  on public.registrations for select
  to authenticated
  using (public.is_admin());

grant select on public.registrations to authenticated;

-- Look up one participant by id, for /start/:code -----------------------------
-- Symmetric with upsert_participant: anyone who already knows a participant's
-- id can read it back, same as they can already overwrite it. No new grant
-- lets anyone browse or guess participants - ids are random UUIDs.
create or replace function public.get_participant(participant_id uuid)
returns public.participants
language sql
stable
security definer
set search_path = public
as $$
  select * from public.participants where id = participant_id;
$$;

revoke all on function public.get_participant(uuid) from public;
grant execute on function public.get_participant(uuid) to anon, authenticated;
