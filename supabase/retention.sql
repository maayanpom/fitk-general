-- 3-month data retention (matches the privacy policy at /privacy-policy).
--
-- What this does: permanently deletes any participant row whose data hasn't
-- been touched (created OR updated) in the last 3 months. This covers both
-- people who finish the whole challenge and people who start but never come
-- back - both get cleaned up 3 months after they go quiet.
--
-- Setup (one time):
--   1. Dashboard -> Database -> Extensions -> search "pg_cron" -> Enable.
--   2. Run this whole file once in the SQL Editor.
--
-- This is a real, unattended, recurring DELETE on production data. Read
-- through the "verify" queries at the bottom before and after enabling it.

create or replace function public.delete_expired_participants()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.participants
  where updated_at < now() - interval '3 months';
$$;

revoke all on function public.delete_expired_participants() from public;

-- Runs weekly, Sundays at 03:00 UTC. Safe to re-run this block - it replaces
-- any existing job with the same name instead of creating a duplicate.
select cron.unschedule('delete-expired-participants')
where exists (select 1 from cron.job where jobname = 'delete-expired-participants');

select cron.schedule(
  'delete-expired-participants',
  '0 3 * * 0',
  $$select public.delete_expired_participants()$$
);

-- ---------------------------------------------------------------------------
-- Verify it's registered:
--   select * from cron.job;
--
-- See its run history (empty until the first Sunday after you enable it):
--   select * from cron.job_run_details order by start_time desc limit 20;
--
-- Preview who WOULD be deleted right now, without deleting anything:
--   select id, first_name, updated_at from public.participants
--   where updated_at < now() - interval '3 months';
--
-- Turn it off entirely:
--   select cron.unschedule('delete-expired-participants');
-- ---------------------------------------------------------------------------
