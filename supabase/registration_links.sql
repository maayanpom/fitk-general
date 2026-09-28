-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- Tracks which registration (lead) became which participant, so the admin
-- "add participant" action can't be run twice for the same lead.

alter table public.registrations
  add column if not exists participant_id uuid references public.participants(id);

create or replace function public.link_registration_to_participant(
  registration_id uuid, participant_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  update public.registrations set participant_id = link_registration_to_participant.participant_id
  where id = registration_id;
end;
$$;

revoke all on function public.link_registration_to_participant(uuid, uuid) from public;
grant execute on function public.link_registration_to_participant(uuid, uuid) to authenticated;
