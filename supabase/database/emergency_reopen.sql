-- emergency_reopen.sql
--
-- ONLY if 04_access_rules.sql locks everyone out of the app (usually because
-- Supabase isn't accepting the Firebase sign-in token). This puts back the old
-- "anyone with the public key can do anything" behaviour, which is NOT safe for
-- real children's data - fix the token setup and re-run 04 as soon as you can.
--
-- Student numbers and hidden names (file 01) are not affected, except that the
-- real names become readable by anyone again while this is in place.

begin;

do $$
declare t record;
begin
  for t in
    select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public' and c.relkind in ('r', 'p')
  loop
    perform app.drop_all_policies(format('public.%I', t.relname)::regclass);
    execute format('create policy emergency_open on public.%I for all to anon, authenticated using (true) with check (true)', t.relname);
  end loop;
end $$;

commit;
