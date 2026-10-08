-- Offline screener: licences + offline fields on puzzlebox_screenings
-- Safe to run on production: creates one new table and adds four new
-- columns. No existing rows or columns are changed or removed.

-- 1. One row per offline download (one licence per device per download)
create table public.offline_licences (
  id              uuid primary key default gen_random_uuid(),
  user_id         text not null references public.users(id) on delete cascade,
  examiner        text,                         -- name shown in the watermark
  device_id       text not null,                -- random ID the browser generates
  issued_at       timestamptz not null default now(),
  expires_at      timestamptz not null,
  revoked         boolean not null default false,  -- admin sets true to cancel (lost device etc.)
  revoked_at      timestamptz,
  last_synced_at  timestamptz
);

create index offline_licences_user_id_idx on public.offline_licences (user_id);

alter table public.offline_licences enable row level security;

-- Admins can see and cancel any licence
create policy offline_licences_admin on public.offline_licences
  for all to anon, authenticated
  using (app.is_admin()) with check (app.is_admin());

-- Educators can see their own licences (read-only; the edge function creates them)
create policy offline_licences_read_own on public.offline_licences
  for select to anon, authenticated
  using (user_id = app.uid());

-- 2. Mark screenings that were captured offline.
--    offline_session_id is unique, so the same offline result can never be
--    saved twice, even if an upload is retried after a dropped connection.
alter table public.puzzlebox_screenings
  add column is_offline          boolean not null default false,
  add column licence_id          uuid references public.offline_licences(id) on delete set null,
  add column captured_at         timestamptz,
  add column offline_session_id  uuid unique;
