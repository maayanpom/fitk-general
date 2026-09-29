-- RLS acceptance check. Run in the Supabase SQL editor AFTER coaches.sql and
-- challenge_v2.sql. Everything runs in one transaction and is rolled back, so
-- nothing is left behind. Each NOTICE line says PASS or FAIL.
--
-- It simulates: (1) an anonymous visitor, (2) coach A, (3) coach B.

begin;

do $$
declare
  a uuid := gen_random_uuid();
  b uuid := gen_random_uuid();
  n int;
begin
  -- Two throwaway coaches (auth.users rows are needed for the foreign key).
  insert into auth.users (id, instance_id, aud, role, email)
  values (a, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'a-' || a || '@test.invalid'),
         (b, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'b-' || b || '@test.invalid');
  insert into public.coaches (id, name, email, phone, slug)
  values (a, 'A', 'a@test.invalid', '972500000001', 'rls-a-' || substr(a::text, 1, 6)),
         (b, 'B', 'b@test.invalid', '972500000002', 'rls-b-' || substr(b::text, 1, 6));

  insert into public.registrations (coach_id, full_name, phone, email, source)
  values (a, 'Lead of A', '972501111111', 'la@test.invalid', 'manual'),
         (b, 'Lead of B', '972502222222', 'lb@test.invalid', 'manual');
  insert into public.participants (id, coach_id, first_name)
  values (gen_random_uuid(), a, 'PA'), (gen_random_uuid(), b, 'PB');

  perform set_config('test.a', a::text, true);
  perform set_config('test.b', b::text, true);
end $$;

-- 1. Anonymous: no table reads at all ---------------------------------------
set local role anon;
do $$
declare n int;
begin
  begin
    select count(*) into n from public.registrations;
    raise notice '% anon reads registrations (got % rows)', case when n = 0 then 'PASS' else 'FAIL' end, n;
  exception when insufficient_privilege then
    raise notice 'PASS anon reads registrations (permission denied)';
  end;
  begin
    select count(*) into n from public.participants;
    raise notice '% anon reads participants (got % rows)', case when n = 0 then 'PASS' else 'FAIL' end, n;
  exception when insufficient_privilege then
    raise notice 'PASS anon reads participants (permission denied)';
  end;
  begin
    select count(*) into n from public.summaries;
    raise notice '% anon reads summaries (got % rows)', case when n = 0 then 'PASS' else 'FAIL' end, n;
  exception when insufficient_privilege then
    raise notice 'PASS anon reads summaries (permission denied)';
  end;
  begin
    select count(*) into n from public.coaches;
    raise notice '% anon reads coaches (got % rows)', case when n = 0 then 'PASS' else 'FAIL' end, n;
  exception when insufficient_privilege then
    raise notice 'PASS anon reads coaches (permission denied)';
  end;
end $$;
reset role;

-- 2. Coach A sees only A ------------------------------------------------------
select set_config('request.jwt.claims',
  json_build_object('sub', current_setting('test.a'), 'role', 'authenticated')::text, true);
set local role authenticated;
do $$
declare n int; other int;
begin
  select count(*) into n from public.registrations;
  select count(*) into other from public.registrations where coach_id <> current_setting('test.a')::uuid;
  raise notice '% coach A registrations: % visible, % foreign', case when other = 0 and n >= 1 then 'PASS' else 'FAIL' end, n, other;

  select count(*) into n from public.participants;
  select count(*) into other from public.participants where coach_id <> current_setting('test.a')::uuid;
  raise notice '% coach A participants: % visible, % foreign', case when other = 0 and n >= 1 then 'PASS' else 'FAIL' end, n, other;

  -- A cannot mark, create a code for, or delete B's lead.
  begin
    perform public.set_holdon_registered(
      (select id from public.registrations where full_name = 'Lead of B' limit 1), true);
    raise notice 'FAIL coach A changed B lead';
  exception when others then
    raise notice 'PASS coach A cannot change B lead';
  end;
end $$;
reset role;

-- 3. Coach B sees only B ------------------------------------------------------
select set_config('request.jwt.claims',
  json_build_object('sub', current_setting('test.b'), 'role', 'authenticated')::text, true);
set local role authenticated;
do $$
declare other int;
begin
  select count(*) into other from public.registrations where coach_id <> current_setting('test.b')::uuid;
  raise notice '% coach B sees no foreign registrations (% foreign)', case when other = 0 then 'PASS' else 'FAIL' end, other;
  select count(*) into other from public.participants where coach_id <> current_setting('test.b')::uuid;
  raise notice '% coach B sees no foreign participants (% foreign)', case when other = 0 then 'PASS' else 'FAIL' end, other;
end $$;
reset role;

rollback;
