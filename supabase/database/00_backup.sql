-- 00_backup.sql
--
-- Run FIRST. Copies every public table and the current access rules into a private schema "backup_20261006" inside the same
-- database. The app can't reach it. To restore a table, e.g. children (do this
-- before running 01, or the columns won't match):
--   truncate public.children cascade;
--   insert into public.children select * from backup_20261006.children;

create schema if not exists backup_20261006;
revoke all on schema backup_20261006 from public, anon, authenticated;

do $$
declare t record;
begin
  for t in select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
            where n.nspname = 'public' and c.relkind = 'r'
  loop
    execute format('drop table if exists backup_20261006.%I', t.relname);
    execute format('create table backup_20261006.%I as table public.%I', t.relname, t.relname);
  end loop;
  drop table if exists backup_20261006.policies;
  create table backup_20261006.policies as select * from pg_policies where schemaname = 'public';
end $$;
