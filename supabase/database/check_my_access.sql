-- check_my_access.sql
--
-- Creates whoami(), so you can confirm the database recognises a signed-in
-- user BEFORE running 04_access_rules.sql. Safe to run any time.
--
-- 1. Run this file in the SQL Editor.
-- 2. Start the app with `npm start`, sign in, open the browser console (F12)
--    and run:
--        (await window.supabase.rpc("whoami")).data
--    (window.supabase only exists on the local dev server, never in the live site.)
-- 3. You should see your Firebase UID and your role. If firebase_uid is null,
--    Supabase is not accepting the Firebase token yet - do NOT run 04.

create or replace function public.whoami()
returns table (firebase_uid text, token_issuer text, role text, approved boolean)
language sql stable security definer set search_path = public, pg_temp
as $$
  select auth.jwt() ->> 'sub',
         auth.jwt() ->> 'iss',
         (select u.role from public.users u where u.id = auth.jwt() ->> 'sub'),
         (select u.is_verified from public.users u where u.id = auth.jwt() ->> 'sub')
$$;
grant execute on function public.whoami() to anon, authenticated;
