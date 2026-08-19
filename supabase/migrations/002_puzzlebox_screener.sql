-- 002_puzzlebox_screener.sql
--
-- Adds the table backing the digital PuzzleBox Screener (Phase 2+).
-- Run this in Supabase Dashboard → SQL Editor (or via the Supabase CLI).
--
-- Design notes:
--   * `responses` is JSONB rather than one row per question. A 32-item form
--     with per-question rows would mean 32 inserts/updates per autosave —
--     one row per session keeps autosave to a single UPSERT. Shape:
--       { "q1": { "score": 2, "rawValueSeconds": 310 },
--         "q1a": { "score": 1 }, "q9": { "score": 1, "checked": [...] }, ... }
--   * `content_version` + `content_snapshot` implement the versioning
--     requirement (§13 of the dev requirements doc): a completed screening
--     keeps the exact question set/scoring it was taken against, even if an
--     admin later edits or republishes the content (Phase 5).
--   * `status` mirrors the workflow in the requirements doc: in_progress →
--     completed → awaiting_review → reviewed. Phase 4 (psychologist
--     notification) will insert into the existing `messages` table when a
--     screening moves to "completed" — not implemented in this migration.
--   * RLS below is intentionally permissive (matches the anon-key,
--     Firebase-Auth-not-Supabase-Auth setup already used by the
--     `children` / `screening_sessions` tables in this project). Tighten
--     this before going to production — right now any holder of the anon
--     key can read/write every screening.

create table if not exists puzzlebox_screenings (
  id uuid primary key default gen_random_uuid(),

  -- who/what this screening is for
  child_id uuid references children(id) on delete set null,
  child_name text not null,
  school text,

  -- who conducted it (Firebase Auth user — stored as text, not a Supabase
  -- auth.uid(), to match how the rest of this project identifies users)
  teacher_email text not null,
  teacher_name text,

  -- which version of the screener content this session is using/used
  content_version text not null default '1.0',
  content_snapshot jsonb, -- filled in on completion; freezes the content this session was scored against

  status text not null default 'in_progress'
    check (status in ('in_progress', 'completed', 'awaiting_review', 'reviewed')),

  -- per-question answers, keyed by question id (see src/data/puzzleBoxContent.v1.js)
  responses jsonb not null default '{}'::jsonb,

  -- puzzle timer (Phase 3 — columns added now so Phase 3 doesn't need a migration)
  puzzle_time_seconds integer,
  puzzle_over_time boolean not null default false,

  -- free-text notes/observations captured at the end of the form
  observations text,

  child_age integer,     -- snapshot of the child's age at screening time (age tables need this)
  raw_score integer,      -- computed total once completed
  interpretation_band text, -- 'on_track' | 'progressing' | 'concerns'

  started_at timestamptz not null default now(),
  completed_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists puzzlebox_screenings_child_id_idx on puzzlebox_screenings(child_id);
create index if not exists puzzlebox_screenings_teacher_email_idx on puzzlebox_screenings(teacher_email);
create index if not exists puzzlebox_screenings_status_idx on puzzlebox_screenings(status);

-- keep updated_at current on every autosave
create or replace function set_puzzlebox_screenings_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_puzzlebox_screenings_updated_at on puzzlebox_screenings;
create trigger trg_puzzlebox_screenings_updated_at
  before update on puzzlebox_screenings
  for each row execute function set_puzzlebox_screenings_updated_at();

alter table puzzlebox_screenings enable row level security;

-- Permissive policy to match the rest of this project's current setup
-- (anon key, no Supabase Auth). Replace with real per-role policies once
-- the team wires Supabase Auth or a server-side proxy.
drop policy if exists "Allow all on puzzlebox_screenings" on puzzlebox_screenings;
create policy "Allow all on puzzlebox_screenings"
  on puzzlebox_screenings
  for all
  using (true)
  with check (true);

-- Enable Realtime for live status updates (Psychologist Home / Phase 4).
-- Supabase Dashboard → Database → Replication → add this table, or:
-- alter publication supabase_realtime add table puzzlebox_screenings;