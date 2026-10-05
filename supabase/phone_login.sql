-- Run once in the Supabase dashboard AFTER challenge_v2.sql. Safe to re-run.
-- Fixed per-coach day links identify the participant by the phone number they
-- registered with, plus a free-text coach notes field on each registration.

alter table public.registrations add column if not exists coach_notes text not null default '';

-- Phone -> participant for one coach. Creates the participant on first entry
-- (respecting the coach's HoldOn-consent requirement). Returns the same jsonb
-- shape as get_participant, or null when nobody matches.
create or replace function public.identify_by_phone(p_coach_slug text, p_phone text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coach public.coaches%rowtype;
  v_phone text := public.normalize_phone(left(coalesce(p_phone, ''), 30));
  v_reg public.registrations%rowtype;
  v_id uuid;
begin
  if length(v_phone) < 9 or length(v_phone) > 15 then
    return null;
  end if;

  select * into v_coach from public.coaches where slug = p_coach_slug;
  if v_coach.id is null then
    return null;
  end if;

  select * into v_reg from public.registrations
    where coach_id = v_coach.id and phone = v_phone
    order by created_at limit 1;
  if v_reg.id is null then
    return null;
  end if;

  v_id := v_reg.participant_id;
  if v_id is null then
    if v_coach.require_holdon_consent and v_reg.consent_holdon_at is null then
      return null;
    end if;
    v_id := gen_random_uuid();
    insert into public.participants (id, coach_id, first_name, day1, day2, day3, toolbox)
    values (v_id, v_coach.id, split_part(v_reg.full_name, ' ', 1),
            '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb);
    update public.registrations set participant_id = v_id where id = v_reg.id;
  end if;

  return (
    select to_jsonb(p) || jsonb_build_object('coach_slug', v_coach.slug)
    from public.participants p where p.id = v_id
  );
end;
$$;

revoke all on function public.identify_by_phone(text, text) from public;
grant execute on function public.identify_by_phone(text, text) to anon, authenticated;

-- Coach notes about a person (e.g. "no WhatsApp").
create or replace function public.coach_set_notes(p_registration uuid, p_notes text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.registrations set coach_notes = left(coalesce(p_notes, ''), 2000)
  where id = p_registration and coach_id = auth.uid();
  if not found then
    raise exception 'not authorized or not found';
  end if;
end;
$$;

revoke all on function public.coach_set_notes(uuid, text) from public;
grant execute on function public.coach_set_notes(uuid, text) to authenticated;
