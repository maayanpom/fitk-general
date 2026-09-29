-- Run once in the Supabase dashboard AFTER coaches.sql (SQL Editor -> New query -> paste -> Run).
-- Safe to re-run. Implements the "3 days" spec: per-coach settings, three
-- timestamped consents, lead sources (community / meta_ad / manual), CSV batches,
-- HoldOn registration status, manual + imported leads, summaries, deletion.
--
-- Model note: `registrations` is the person record (name, phone, email, source,
-- consents, HoldOn status). `participants` keeps the progress/answers, and its
-- random UUID id IS the personal code (122 bits, well over 16 characters).
-- `registrations.participant_id` links the two.

-- 1. Per-coach settings ------------------------------------------------------
-- WHATSAPP_NUMBER is the existing coaches.phone column (normalised in the app).
alter table public.coaches add column if not exists privacy_url text;
alter table public.coaches add column if not exists coupon_text text;
alter table public.coaches add column if not exists summary_delivery_text text;
alter table public.coaches add column if not exists long_gap_hours integer not null default 5;
alter table public.coaches add column if not exists require_holdon_consent boolean not null default true;

-- 2. Phone normalisation (digits only, 0xx -> 972xx, no plus) -----------------
create or replace function public.normalize_phone(p text)
returns text
language sql immutable
as $$
  select case
    when d = '' then ''
    when d like '00%' then substr(d, 3)
    when d like '0%' then '972' || substr(d, 2)
    else d
  end
  from (select regexp_replace(coalesce(p, ''), '\D', '', 'g') as d) t;
$$;

-- 3. Registrations: consents with timestamps, source, HoldOn, batch ----------
alter table public.registrations add column if not exists source text not null default 'community';
alter table public.registrations add column if not exists consent_privacy_at timestamptz;
alter table public.registrations add column if not exists consent_messages_at timestamptz;
alter table public.registrations add column if not exists consent_holdon_at timestamptz;
alter table public.registrations add column if not exists holdon_registered_at timestamptz;
alter table public.registrations add column if not exists import_batch text;
alter table public.registrations add column if not exists imported_at timestamptz;

alter table public.registrations drop constraint if exists registrations_source_check;
alter table public.registrations add constraint registrations_source_check
  check (source in ('community', 'meta_ad', 'manual'));

-- Older rows: carry their existing consents over as timestamps.
update public.registrations set consent_privacy_at = created_at
  where consent_privacy and consent_privacy_at is null;
update public.registrations set consent_holdon_at = created_at
  where consent_holdon and consent_holdon_at is null;

update public.registrations set phone = public.normalize_phone(phone)
  where phone <> public.normalize_phone(phone);

create index if not exists registrations_coach_phone_idx on public.registrations (coach_id, phone);

-- Coaches may read only their own rows (policy already exists); no direct writes.
-- 4. Public registration (community) ------------------------------------------
drop function if exists public.submit_registration(text, text, text, text, boolean, boolean);

create or replace function public.submit_registration(
  coach_slug text,
  full_name text,
  phone text,
  email text,
  consent_privacy boolean,
  consent_messages boolean,
  consent_holdon boolean,
  website text default ''            -- honeypot: real users leave it empty
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coach public.coaches%rowtype;
  v_name text := left(trim(coalesce(full_name, '')), 100);
  v_phone text := public.normalize_phone(left(coalesce(phone, ''), 30));
  v_email text := lower(left(trim(coalesce(email, '')), 200));
begin
  -- Honeypot: pretend success, store nothing.
  if coalesce(website, '') <> '' then
    return;
  end if;

  select * into v_coach from public.coaches where slug = coach_slug;
  if v_coach.id is null then
    raise exception 'unknown coach link';
  end if;

  if v_name = '' or v_phone = '' or v_email = '' then
    raise exception 'name, phone and email are required';
  end if;
  if length(v_phone) < 9 or length(v_phone) > 15 then
    raise exception 'invalid phone';
  end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'invalid email';
  end if;

  if not consent_privacy or not consent_messages then
    raise exception 'privacy and messages consents are required';
  end if;
  if v_coach.require_holdon_consent and not consent_holdon then
    raise exception 'holdon consent is required';
  end if;

  -- Rate limit per coach link: at most 30 sign-ups in 10 minutes.
  if (select count(*) from public.registrations
      where coach_id = v_coach.id and created_at > now() - interval '10 minutes') >= 30 then
    raise exception 'too many requests';
  end if;

  -- Duplicate by phone: succeed silently (never reveal who is registered).
  if exists (select 1 from public.registrations where coach_id = v_coach.id and phone = v_phone) then
    return;
  end if;

  insert into public.registrations (
    coach_id, full_name, phone, email, source,
    consent_privacy, consent_holdon,
    consent_privacy_at, consent_messages_at, consent_holdon_at
  )
  values (
    v_coach.id, v_name, v_phone, v_email, 'community',
    true, coalesce(consent_holdon, false),
    now(), now(), case when consent_holdon then now() end
  );
end;
$$;

revoke all on function public.submit_registration(text, text, text, text, boolean, boolean, boolean, text) from public;
grant execute on function public.submit_registration(text, text, text, text, boolean, boolean, boolean, text) to anon;

-- 5. Coach adds leads: manual (one) or Meta CSV import (many) ------------------
-- rows: [{ "full_name": "...", "phone": "...", "email": "..." }, ...]
-- The single consent flag covers the whole call: everyone in it confirmed, in
-- the Meta form, registration to HoldOn and receiving messages.
-- Returns { inserted, skipped_duplicates }.
create or replace function public.coach_add_registrations(
  p_rows jsonb,
  p_source text,
  p_batch text,
  p_consent_confirmed boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coach uuid := auth.uid();
  r jsonb;
  v_name text;
  v_phone text;
  v_email text;
  v_inserted int := 0;
  v_skipped int := 0;
begin
  if v_coach is null or not exists (select 1 from public.coaches where id = v_coach) then
    raise exception 'not authorized';
  end if;
  if p_source not in ('manual', 'meta_ad') then
    raise exception 'invalid source';
  end if;
  if not coalesce(p_consent_confirmed, false) then
    raise exception 'consent confirmation is required';
  end if;
  if jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) > 2000 then
    raise exception 'invalid rows';
  end if;

  for r in select * from jsonb_array_elements(p_rows) loop
    v_name := left(trim(coalesce(r ->> 'full_name', '')), 100);
    v_phone := public.normalize_phone(left(coalesce(r ->> 'phone', ''), 30));
    v_email := lower(left(trim(coalesce(r ->> 'email', '')), 200));

    if v_name = '' or length(v_phone) < 9 or length(v_phone) > 15 then
      v_skipped := v_skipped + 1;
      continue;
    end if;

    if exists (
      select 1 from public.registrations
      where coach_id = v_coach
        and (phone = v_phone or (v_email <> '' and lower(email) = v_email))
    ) then
      v_skipped := v_skipped + 1;
      continue;
    end if;

    insert into public.registrations (
      coach_id, full_name, phone, email, source, import_batch, imported_at,
      consent_privacy, consent_holdon, consent_messages_at, consent_holdon_at
    )
    values (
      v_coach, v_name, v_phone, v_email, p_source,
      case when p_source = 'meta_ad' then left(p_batch, 100) end,
      case when p_source = 'meta_ad' then now() end,
      false, true, now(), now()
    );
    v_inserted := v_inserted + 1;
  end loop;

  return jsonb_build_object('inserted', v_inserted, 'skipped_duplicates', v_skipped);
end;
$$;

revoke all on function public.coach_add_registrations(jsonb, text, text, boolean) from public;
grant execute on function public.coach_add_registrations(jsonb, text, text, boolean) to authenticated;

-- 6. HoldOn status ------------------------------------------------------------
create or replace function public.set_holdon_registered(p_registration uuid, p_registered boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.registrations set holdon_registered_at = case when p_registered then now() end
  where id = p_registration and coach_id = auth.uid();
  if not found then
    raise exception 'not authorized or not found';
  end if;
end;
$$;

revoke all on function public.set_holdon_registered(uuid, boolean) from public;
grant execute on function public.set_holdon_registered(uuid, boolean) to authenticated;

-- 7. Personal code: create the participant for a registration -------------------
-- No code without HoldOn consent when the coach requires it (5.4).
create or replace function public.create_participant_for_registration(p_registration uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coach uuid := auth.uid();
  v_reg public.registrations%rowtype;
  v_require boolean;
  v_id uuid;
begin
  select * into v_reg from public.registrations where id = p_registration and coach_id = v_coach;
  if v_reg.id is null then
    raise exception 'not authorized or not found';
  end if;
  if v_reg.participant_id is not null then
    return v_reg.participant_id;
  end if;

  select require_holdon_consent into v_require from public.coaches where id = v_coach;
  if v_require and v_reg.consent_holdon_at is null then
    raise exception 'holdon consent is missing';
  end if;

  v_id := gen_random_uuid();
  insert into public.participants (id, coach_id, first_name, day1, day2, day3, toolbox)
  values (v_id, v_coach, split_part(v_reg.full_name, ' ', 1), '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb);
  update public.registrations set participant_id = v_id where id = v_reg.id;
  return v_id;
end;
$$;

revoke all on function public.create_participant_for_registration(uuid) from public;
grant execute on function public.create_participant_for_registration(uuid) to authenticated;

-- 8. Summaries (draft messages) ---------------------------------------------------
create table if not exists public.summaries (
  participant_id uuid primary key references public.participants(id) on delete cascade,
  coach_id uuid not null references public.coaches(id),
  draft text not null default '',
  sent_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.summaries enable row level security;
revoke all on public.summaries from anon, authenticated;

drop policy if exists "coach manages own summaries" on public.summaries;
create policy "coach manages own summaries" on public.summaries
  for all to authenticated
  using (coach_id = auth.uid())
  with check (coach_id = auth.uid());

grant select, insert, update on public.summaries to authenticated;

-- 9. Deletion on request: person, all answers, summary ---------------------------------
create or replace function public.coach_delete_person(p_registration uuid, p_participant uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coach uuid := auth.uid();
  v_participant uuid := p_participant;
begin
  if v_coach is null then
    raise exception 'not authorized';
  end if;

  if p_registration is not null then
    select participant_id into v_participant from public.registrations
      where id = p_registration and coach_id = v_coach;
    if not found then
      raise exception 'not authorized or not found';
    end if;
    delete from public.registrations where id = p_registration and coach_id = v_coach;
  end if;

  if v_participant is not null then
    delete from public.summaries where participant_id = v_participant and coach_id = v_coach;
    delete from public.participants where id = v_participant and coach_id = v_coach;
  end if;
end;
$$;

revoke all on function public.coach_delete_person(uuid, uuid) from public;
grant execute on function public.coach_delete_person(uuid, uuid) to authenticated;

-- 10. Public coach info: add what the register page needs ----------------------------
create or replace function public.get_coach_public(coach_id uuid)
returns jsonb
language sql stable security definer set search_path = public
as $$
  select to_jsonb(t) from (
    select name, email, phone, community_url, slug, privacy_url, require_holdon_consent, long_gap_hours, summary_delivery_text
    from public.coaches where id = coach_id
  ) t;
$$;

create or replace function public.get_coach_public_by_slug(coach_slug text)
returns jsonb
language sql stable security definer set search_path = public
as $$
  select to_jsonb(t) from (
    select name, email, phone, community_url, slug, privacy_url, require_holdon_consent, long_gap_hours, summary_delivery_text
    from public.coaches where slug = coach_slug
  ) t;
$$;

grant execute on function public.get_coach_public(uuid) to anon, authenticated;
grant execute on function public.get_coach_public_by_slug(text) to anon, authenticated;
