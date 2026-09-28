-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- Tracks which registration (lead) became which participant, so the admin
-- "add participant" action can't be run twice for the same lead.

alter table public.registrations
  add column if not exists participant_id uuid references public.participants(id);

-- link_registration_to_participant used to be defined here, checking only
-- is_admin() with no per-coach ownership check. It's superseded by a
-- coach-scoped version in coaches.sql (checks coach_id = auth.uid() on both
-- the registration and the participant). Do not recreate the old version -
-- re-running it alone would silently regress that ownership check and let
-- any coach link any other coach's registration/participant.
