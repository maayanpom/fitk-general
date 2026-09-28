-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- Lets the super admin delete a coach who has zero trainees, from the
-- coaches oversight list. Never exposes trainee data - only a count.

-- Super-admin oversight list, now including a trainee count so the UI can
-- decide whether deletion is allowed - never exposes trainee data itself.
create or replace function public.admin_coaches_with_counts()
returns table(
  id uuid, name text, email text, phone text, slug text,
  created_at timestamptz, participant_count bigint
)
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_super_admin() then
    raise exception 'not authorized';
  end if;
  return query
    select c.id, c.name, c.email, c.phone, c.slug, c.created_at, count(p.id)
    from public.coaches c
    left join public.participants p on p.coach_id = c.id
    group by c.id
    order by c.created_at desc;
end;
$$;

revoke all on function public.admin_coaches_with_counts() from public;
grant execute on function public.admin_coaches_with_counts() to authenticated;

-- Deletes a coach with zero trainees. Also clears any of their still-pending
-- leads (registrations.coach_id has no ON DELETE clause, so leftover leads
-- would otherwise block the delete with a foreign-key violation).
create or replace function public.admin_delete_coach(target_coach_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_trainee_count integer;
begin
  if not public.is_super_admin() then
    raise exception 'not authorized';
  end if;

  select count(*) into v_trainee_count
  from public.participants where coach_id = target_coach_id;

  if v_trainee_count > 0 then
    raise exception 'coach has trainees';
  end if;

  delete from public.registrations where coach_id = target_coach_id;
  delete from public.coaches where id = target_coach_id;
end;
$$;

revoke all on function public.admin_delete_coach(uuid) from public;
grant execute on function public.admin_delete_coach(uuid) to authenticated;
