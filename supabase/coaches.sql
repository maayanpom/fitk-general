-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- Converts the app from single-tenant (one shared admin list) to multi-tenant:
-- each coach self-signs-up, and sees only their own participants and leads.

-- Coach accounts (self-registered via /coach-signup) -----------------------
create table if not exists public.coaches (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,           -- Hebrew display name
  email text not null,
  phone text not null,          -- WhatsApp number
  community_url text,           -- optional, set later via the settings tab
  slug text not null unique,    -- public link: /{slug}/register
  created_at timestamptz not null default now()
);

alter table public.coaches enable row level security;
revoke all on public.coaches from anon, authenticated;

drop policy if exists "coach reads own row" on public.coaches;
create policy "coach reads own row" on public.coaches
  for select to authenticated using (id = auth.uid());

drop policy if exists "coach updates own row" on public.coaches;
create policy "coach updates own row" on public.coaches
  for update to authenticated using (id = auth.uid());

drop policy if exists "coach inserts own row" on public.coaches;
create policy "coach inserts own row" on public.coaches
  for insert to authenticated with check (id = auth.uid());

grant select, update, insert on public.coaches to authenticated;

-- Platform owner(s): minimal oversight only, no participant/lead access ----
create table if not exists public.super_admins (email text primary key);
alter table public.super_admins enable row level security;
revoke all on public.super_admins from anon, authenticated;
-- insert into public.super_admins (email) values ('maayanpom@gmail.com');

create or replace function public.is_super_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.super_admins
    where lower(email) = lower(auth.jwt() ->> 'email')
  );
$$;

revoke all on function public.is_super_admin() from public;
grant execute on function public.is_super_admin() to authenticated;

drop policy if exists "super admins read all coaches" on public.coaches;
create policy "super admins read all coaches" on public.coaches
  for select to authenticated using (public.is_super_admin());

-- Retire the old single-tenant "any admin sees everything" model -----------
drop policy if exists "admins read participants" on public.participants;
drop policy if exists "admins read registrations" on public.registrations;
drop function if exists public.is_admin();
drop table if exists public.admins;

-- Tag every participant/registration with its owning coach -----------------
-- Left nullable rather than "not null": safe to run whether or not the
-- earlier cleanup DELETEs were run first. Every row created from here on
-- always gets a coach_id (see the rewritten functions below); any leftover
-- untagged row just becomes invisible to every coach, never a leak.
alter table public.participants add column if not exists coach_id uuid references public.coaches(id);
alter table public.registrations add column if not exists coach_id uuid references public.coaches(id);

drop policy if exists "coach reads own participants" on public.participants;
create policy "coach reads own participants" on public.participants
  for select to authenticated using (coach_id = auth.uid());

drop policy if exists "coach reads own registrations" on public.registrations;
create policy "coach reads own registrations" on public.registrations
  for select to authenticated using (coach_id = auth.uid());

-- upsert_participant: creating is now coach-only, ownership is server-derived ---
-- Splits the old single "insert ... on conflict do update" so that creating a
-- brand-new participant requires a signed-in coach (who becomes its owner via
-- auth.uid(), never a client-supplied value), while updating an existing
-- participant's own answers stays open to anon (the participant's own browser
-- syncing progress) exactly as before, and never touches coach_id once set.
create or replace function public.upsert_participant(p jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid := (p ->> 'participantId')::uuid;
  v_name text := left(trim(coalesce(p ->> 'firstName', '')), 100);
  v_exists boolean;
begin
  if v_id is null or v_name = '' then
    raise exception 'participantId and firstName are required';
  end if;

  if octet_length(p::text) > 50000 then
    raise exception 'payload too large';
  end if;

  select exists(select 1 from public.participants where id = v_id) into v_exists;

  if not v_exists then
    if auth.uid() is null then
      raise exception 'only a signed-in coach can create a new participant';
    end if;

    insert into public.participants (id, coach_id, first_name, day1, day2, day3, toolbox, created_at, updated_at)
    values (v_id, auth.uid(), v_name, p->'day1', p->'day2', p->'day3', p->'toolbox',
            coalesce((p ->> 'createdAt')::timestamptz, now()), now());
  else
    update public.participants set
      first_name = v_name,
      day1 = p->'day1', day2 = p->'day2', day3 = p->'day3', toolbox = p->'toolbox',
      updated_at = now()
    where id = v_id;
  end if;
end;
$$;

revoke all on function public.upsert_participant(jsonb) from public;
grant execute on function public.upsert_participant(jsonb) to anon, authenticated;

-- submit_registration: now needs to know WHICH coach's public link was used ---
-- (anon has no session to derive identity from, unlike participant creation).
drop function if exists public.submit_registration(text, text, text, boolean, boolean);

create or replace function public.submit_registration(
  coach_slug text,
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
  v_coach_id uuid;
  v_name text := left(trim(coalesce(full_name, '')), 100);
  v_phone text := left(trim(coalesce(phone, '')), 30);
  v_email text := left(trim(coalesce(email, '')), 200);
begin
  select id into v_coach_id from public.coaches where slug = coach_slug;
  if v_coach_id is null then
    raise exception 'unknown coach link';
  end if;

  if v_name = '' or v_phone = '' or v_email = '' then
    raise exception 'name, phone and email are required';
  end if;

  if not consent_privacy or not consent_holdon then
    raise exception 'both consents are required';
  end if;

  insert into public.registrations (coach_id, full_name, phone, email, consent_privacy, consent_holdon)
  values (v_coach_id, v_name, v_phone, v_email, true, true);
end;
$$;

revoke all on function public.submit_registration(text, text, text, text, boolean, boolean) from public;
grant execute on function public.submit_registration(text, text, text, text, boolean, boolean) to anon;

-- link_registration_to_participant: ownership check instead of "is any admin" ---
create or replace function public.link_registration_to_participant(
  registration_id uuid, participant_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller uuid := auth.uid();
begin
  if v_caller is null then
    raise exception 'not authorized';
  end if;

  update public.registrations set participant_id = link_registration_to_participant.participant_id
  where id = registration_id
    and coach_id = v_caller
    and exists (
      select 1 from public.participants
      where id = link_registration_to_participant.participant_id and coach_id = v_caller
    );

  if not found then
    raise exception 'not authorized, or the registration/participant do not belong to you';
  end if;
end;
$$;

-- get_participant: now returns jsonb (was the plain participants row) so it can
-- include the owning coach's slug in one round trip, for /start/:code to know
-- which coach's public WhatsApp/community settings to show afterward.
drop function if exists public.get_participant(uuid);

create or replace function public.get_participant(participant_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select to_jsonb(p) || jsonb_build_object('coach_slug', c.slug)
  from public.participants p
  left join public.coaches c on c.id = p.coach_id
  where p.id = participant_id;
$$;

revoke all on function public.get_participant(uuid) from public;
grant execute on function public.get_participant(uuid) to anon, authenticated;

-- Public (safe-to-display) coach info, for the per-coach register/privacy
-- pages and for participant-facing pages to show the right WhatsApp/community
-- links/name. Includes email since the coach's own privacy-policy page needs
-- a contact address - never anything beyond these five fields.
create or replace function public.get_coach_public(coach_id uuid)
returns jsonb
language sql stable security definer set search_path = public
as $$
  select to_jsonb(t) from (
    select name, email, phone, community_url, slug from public.coaches where id = coach_id
  ) t;
$$;

create or replace function public.get_coach_public_by_slug(coach_slug text)
returns jsonb
language sql stable security definer set search_path = public
as $$
  select to_jsonb(t) from (
    select name, email, phone, community_url, slug from public.coaches where slug = coach_slug
  ) t;
$$;

revoke all on function public.get_coach_public(uuid) from public;
revoke all on function public.get_coach_public_by_slug(text) from public;
grant execute on function public.get_coach_public(uuid) to anon, authenticated;
grant execute on function public.get_coach_public_by_slug(text) to anon, authenticated;
