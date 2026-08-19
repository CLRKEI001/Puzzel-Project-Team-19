# PuzzleBox Screener — feature/puzzlebox-screener

Phase 2 (teacher screening flow) of the PuzzleBox Screener, per the dev
requirements doc.

## What's here

- `src/data/puzzleBoxContent.v1.js` — the screening content (sections,
  questions, scoring rules) transcribed from the paper record book, as a
  single data-driven object. Nothing about the screening is hard-coded into
  the UI component itself — this is what Phase 5 (Admin Content Management)
  will eventually replace with a Supabase-backed, admin-editable version,
  without needing to touch the screening UI.
- `src/components/PuzzleBoxScreener.js` (+ `.css`) — the teacher-facing flow:
  search/select a child → confirm → work through the digital form section by
  section → autosave → submit. Resumes an in-progress screening for a child
  if one already exists.
- `supabase/migrations/002_puzzlebox_screener.sql` — the new
  `puzzlebox_screenings` table. **This has not been applied to your Supabase
  project** — I don't have network access to your Supabase instance from
  here. Run it via Supabase Dashboard → SQL Editor (or `supabase db push`
  if you're using the CLI), then enable Realtime replication on the table
  (Dashboard → Database → Replication) if you want the Psychologist Home
  screen to live-update in a later phase.
- `TeacherHome.js` — added a "PuzzleBox Screener" nav item + home-page quick
  link that opens the new flow.
- `src/lib/mappers.js` — added `mapPuzzleboxScreeningRow` for consistency
  with the other Supabase row mappers, ready for when Psychologist/Admin
  screens need to read this table.

## Not in this phase (on purpose)

- **Phase 3 — Puzzle timer.** Items 1 and 19 (the ones that are timed in the
  paper form) currently take a manually-entered minutes/seconds value —
  the score is still derived automatically from the age-based table, just
  without a live running clock or the automatic "Over Time" flag yet.
- **Phase 4 — Psychologist notification.** Submitting a screening sets
  `status: "completed"` and stores the raw score/interpretation band, but
  doesn't yet write to the `messages` table the Psychologist Home screen
  reads from.
- **Phase 5 — Admin Content Management.** The content is data-driven (see
  above) specifically so this phase is a swap, not a rewrite.

## One pre-existing issue this branch does NOT fix

`npm run build` currently fails on this repo (including on `main` /
`supabase-migration`, unrelated to this branch) because `src/firebase.js`
deliberately removed its Firestore `db` export when the project migrated to
Supabase, but `App.js`, `TeacherHome.js`, and `Sidebar.js` still import
`db` from it (for the `users` profile lookup and the psychologist-messages
listener, which haven't been migrated off Firestore yet). Confirmed this
predates this branch by stashing these changes and rebuilding. Worth a
quick fix — either restore a Firestore `db` export in `firebase.js`, or
migrate those two read paths to Supabase like the rest of the app — before
merging any of these branches.

## Unresolved scoring rule

Per the requirements doc's instruction not to guess at scoring the
psychologists haven't finalised: item 1's age-based time table only covers
completed puzzle attempts. What a child should score if they go **over**
the 10-minute limit is left as `overTimeScoreRule: null` in the content
file — the time is still recorded, just with no auto-derived 0–2 score
until that's confirmed.

## What's still needed to push this branch

I built this in a sandbox without push access to
`github.com/CLRKEI001/Puzzel-Project-Team-19`. The branch and commit are
ready locally — see the zip/patch provided — you'll need to push
`feature/puzzlebox-screener` from your own machine or CI with your GitHub
credentials.
