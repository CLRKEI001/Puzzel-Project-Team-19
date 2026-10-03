-- 015_training_course_tables.sql
--
-- Backfills this repo with the DDL for the `training_modules` and
-- `training_questions` tables. Both already exist on the live Supabase
-- project (the app has read/written them since early on — see
-- src/lib/useTrainingModules.js, src/lib/useTrainingQuestions.js,
-- src/components/TrainingModulesAdmin.js, TrainingQuizEditor.js) but the
-- migration file(s) that originally created them (likely numbered
-- 004/005, per comments left in the code) are missing from this repo's
-- supabase/migrations folder. Written with `if not exists` throughout so
-- it is safe to run against the live project without clobbering existing
-- rows, and still works to bootstrap a fresh project from scratch.
--
-- Also adds two new tables needed for the training course rebuild:
--   - training_progress    — per-user, per-module "viewed" / "quiz passed"
--     state, so the training course can show real progress and gate
--     certification on something more than "the quiz banner was visible
--     for a second" (previously nothing was persisted at all — see
--     TrainingModuleQuiz.js's own comment: "nothing is written back, so
--     retaking is always available").
--   - training_certificates — one row per user once every published
--     module has been viewed and its quiz passed, recording when
--     certification was completed.
--
-- RLS follows this project's established convention (see migrations 003,
-- 013, 014): identity is enforced by the app (Firebase UID), not
-- Postgres, so policies here are permissive "soft gates", not a replacement
-- for ownership checks in app code.

create extension if not exists pgcrypto;

create table if not exists training_modules (
  id uuid primary key default gen_random_uuid(),
  sort_order int not null default 0,
  title text not null,
  description text,
  color_key text not null default 'teal',
  status text not null default 'coming_soon',
  video_url text,
  content_url text,
  created_at timestamptz not null default now()
);

alter table training_modules enable row level security;

drop policy if exists "training_modules read" on training_modules;
create policy "training_modules read" on training_modules for select using (true);

drop policy if exists "training_modules write" on training_modules;
create policy "training_modules write" on training_modules for all using (true) with check (true);

create table if not exists training_questions (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references training_modules(id) on delete cascade,
  question_order int not null default 0,
  question_text text not null,
  choices jsonb not null default '[]'::jsonb,
  correct_choice_id text,
  points int not null default 1,
  created_at timestamptz not null default now()
);

alter table training_questions enable row level security;

drop policy if exists "training_questions read" on training_questions;
create policy "training_questions read" on training_questions for select using (true);

drop policy if exists "training_questions write" on training_questions;
create policy "training_questions write" on training_questions for all using (true) with check (true);

-- Per-user, per-module progress. `status` is "viewed" once a trainee has
-- opened the module content, then "quiz_passed" once they've scored
-- >=70% on that module's quiz (same pass threshold TrainingModuleQuiz.js
-- already uses). best_score_percent is kept so a later better attempt can
-- update it without losing the earlier pass.
create table if not exists training_progress (
  user_id text not null,
  module_id uuid not null references training_modules(id) on delete cascade,
  status text not null default 'viewed',
  best_score_percent int,
  viewed_at timestamptz not null default now(),
  quiz_passed_at timestamptz,
  primary key (user_id, module_id)
);

alter table training_progress enable row level security;

drop policy if exists "training_progress read" on training_progress;
create policy "training_progress read" on training_progress for select using (true);

drop policy if exists "training_progress write" on training_progress;
create policy "training_progress write" on training_progress for all using (true) with check (true);

-- One row per user, written once every published module has been both
-- viewed and had its quiz passed. user_email/user_name are snapshotted at
-- issue time purely for display on the certificate (so it still reads
-- correctly even if a profile name changes later).
create table if not exists training_certificates (
  user_id text primary key,
  user_email text,
  user_name text,
  issued_at timestamptz not null default now()
);

alter table training_certificates enable row level security;

drop policy if exists "training_certificates read" on training_certificates;
create policy "training_certificates read" on training_certificates for select using (true);

drop policy if exists "training_certificates write" on training_certificates;
create policy "training_certificates write" on training_certificates for all using (true) with check (true);