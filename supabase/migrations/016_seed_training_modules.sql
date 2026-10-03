-- 016_seed_training_modules.sql
--
-- Seeds the canonical 7-module PuzzleBox training course into
-- training_modules, publishing all seven now that each has real content
-- (see src/data/trainingContent.v1.js, rendered by
-- src/components/TrainingModuleContent.js and looked up by sort_order —
-- so these sort_order values must stay 1-7 and in this order for the
-- rich content to attach to the right module).
--
-- Only inserts when the table is currently empty, so this never
-- overwrites modules an admin has already created/edited on the live
-- project (whether from the original, missing 004/005 migrations, or
-- through the Admin → Training Modules screen since).
insert into training_modules (sort_order, title, description, color_key, status, video_url, content_url)
select * from (values
  (1, 'Introduction to The Puzzle Box', 'Where The PuzzleBox began — the back story, and why it exists.', 'teal', 'published', null::text, null::text),
  (2, 'Research Background & Psychometric Properties', 'Guiding principles, theoretical framework, the 4-phase development methodology, and the four developmental domains.', 'pink', 'published', null::text, null::text),
  (3, 'Test Equipment & Setting Up', 'Introducing The PuzzleBox, the Tier 1 / Tier 2 screener structure, and what''s in the Record Book.', 'purple', 'published', null::text, null::text),
  (4, 'Administration', 'The full 40-item Record Book script, item by item.', 'orange', 'published', null::text, null::text),
  (5, 'Interpretation', 'Scoring, percentile bands, and the "Beyond the Score" interpretation framework.', 'teal', 'published', null::text, null::text),
  (6, 'Online Navigation', 'Using the online platform to run a screening.', 'pink', 'published', null::text, null::text),
  (7, 'Report Writing & Referral', 'From a completed screening to a report and, where appropriate, a referral.', 'purple', 'published', null::text, null::text)
) as seed(sort_order, title, description, color_key, status, video_url, content_url)
where not exists (select 1 from training_modules);