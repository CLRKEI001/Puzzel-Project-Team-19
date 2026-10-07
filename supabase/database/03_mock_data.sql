-- 03_mock_data.sql
--
-- The 15 made-up children ("Child PB-001" ... "Child PB-015") and their
-- screening sessions, kept for testing next to the real pilot data. They are
-- marked data_source = 'demo' so they can always be told apart or removed.
--
-- Run after 01. Safe to run more than once: if demo children already exist
-- (for example the ones the old app created by itself), nothing is added.
--
-- Demo children start with no teacher, so only admins and psychologists see
-- them. To test as a teacher, give them to a teacher account:
--     select app.assign_demo_children('teacher@example.com');
-- To remove all mock data:
--     delete from public.screening_sessions where child_id in (select id from public.children where data_source = 'demo');
--     delete from public.children where data_source = 'demo';

begin;

do $$
begin
  if exists (select 1 from public.children where data_source = 'demo') then
    raise notice 'demo children already present - nothing added';
    return;
  end if;

  with mock (name, school, age, gender, language, cognitive, motor, language_score, social, emotion, moral, total,
             status, flagged, date, stage, follow_up_stage) as (values
    ('Child PB-001', 'Adelaide Primary',    5, 'Female', 'isiXhosa',  72, 85, 68, 60, 74, 55, 69, 'Progressing',            false, date '2026-02-10', 'stage4', 'fu1'),
    ('Child PB-002', 'Adelaide Primary',    6, 'Male',   'isiXhosa',  45, 52, 40, 38, 42, 35, 42, 'Developmental Concerns', true,  date '2026-02-10', 'stage4', 'fu2'),
    ('Child PB-003', 'Komani ECD',          5, 'Female', 'English',   88, 92, 85, 90, 88, 82, 88, 'On Track',               false, date '2026-02-14', 'stage4', 'fu1'),
    ('Child PB-004', 'Komani ECD',          6, 'Male',   'Afrikaans', 35, 40, 32, 28, 38, 30, 34, 'Developmental Concerns', true,  date '2026-02-14', 'stage3', 'fu5'),
    ('Child PB-005', 'Fort Beaufort',       5, 'Female', 'isiXhosa',  78, 80, 75, 72, 79, 70, 76, 'On Track',               false, date '2026-02-18', 'stage3', 'fu4'),
    ('Child PB-006', 'Fort Beaufort',       6, 'Male',   'isiXhosa',  55, 60, 58, 52, 56, 50, 55, 'Progressing',            false, date '2026-02-18', 'stage2', 'fu2'),
    ('Child PB-007', 'Stutterheim Primary', 5, 'Female', 'Afrikaans', 90, 88, 92, 87, 91, 85, 89, 'On Track',               false, date '2026-02-21', 'stage4', 'fu1'),
    ('Child PB-008', 'Stutterheim Primary', 6, 'Male',   'English',   42, 38, 45, 35, 40, 32, 39, 'Developmental Concerns', true,  date '2026-02-21', 'stage2', 'fu6'),
    ('Child PB-009', 'Adelaide Primary',    5, 'Male',   'isiXhosa',  65, 70, 62, 68, 66, 60, 65, 'Progressing',            false, date '2026-02-25', 'stage1', 'fu1'),
    ('Child PB-010', 'Komani ECD',          6, 'Female', 'isiXhosa',  82, 79, 84, 80, 83, 78, 81, 'On Track',               false, date '2026-02-25', 'stage4', 'fu1'),
    ('Child PB-011', 'Fort Beaufort',       5, 'Male',   'English',   30, 35, 28, 25, 32, 27, 30, 'Developmental Concerns', true,  date '2026-03-03', 'stage1', 'fu5'),
    ('Child PB-012', 'Adelaide Primary',    6, 'Female', 'Afrikaans', 75, 77, 73, 76, 74, 72, 75, 'On Track',               false, date '2026-03-03', 'stage3', 'fu1'),
    ('Child PB-013', 'Stutterheim Primary', 5, 'Male',   'isiXhosa',  58, 62, 55, 60, 57, 52, 57, 'Progressing',            false, date '2026-03-07', 'stage1', 'fu1'),
    ('Child PB-014', 'Komani ECD',          6, 'Female', 'English',   48, 50, 46, 44, 49, 43, 47, 'Progressing',            false, date '2026-03-07', 'stage2', 'fu3'),
    ('Child PB-015', 'Adelaide Primary',    5, 'Female', 'isiXhosa',  93, 90, 95, 92, 94, 88, 92, 'On Track',               false, date '2026-03-10', 'stage1', 'fu1')
  ),
  added as (
    insert into public.children (name, school, province, age, gender, language, cognitive, motor, language_score,
                                 social, emotion, moral, total, status, flagged, date, examiner, data_source)
    select name, school, 'Eastern Cape', age, gender, language, cognitive, motor, language_score,
           social, emotion, moral, total, status, flagged, date, 'Dr. Mokoena (demo)', 'demo'
      from mock
    returning id, school, age, language, cognitive, motor, language_score, social, emotion, moral, total, status, date
  )
  insert into public.screening_sessions (child_id, school, age, language, score, date, examiner, status, stage,
                                         follow_up_stage, cognitive, motor, language_score, social, emotion, moral)
  select a.id, a.school, a.age, a.language, a.total, a.date, 'Dr. Mokoena (demo)', a.status, m.stage,
         m.follow_up_stage, a.cognitive, a.motor, a.language_score, a.social, a.emotion, a.moral
    from added a
    join mock m on m.date = a.date and m.total = a.total;

  raise notice 'added 15 demo children and their screening sessions';
end $$;

-- Hand every demo child to one teacher so a teacher login has something to test with.
-- Runs with the caller's own rights (not security definer), so the admin check
-- and the normal row rules both apply.
create or replace function app.assign_demo_children(p_teacher_email text) returns int
language plpgsql
as $$
declare v_uid text; n int;
begin
  if not (app.is_trusted() or app.is_admin()) then
    raise exception 'Only an administrator can assign demo children';
  end if;
  select id into v_uid from public.users where lower(email) = lower(p_teacher_email) and role = 'educator';
  if v_uid is null then raise exception 'No educator account with email %', p_teacher_email; end if;
  update public.children set teacher_uid = v_uid, teacher_email = lower(p_teacher_email)
   where data_source = 'demo';
  get diagnostics n = row_count;
  return n;
end $$;
revoke all on function app.assign_demo_children(text) from public, anon;
grant execute on function app.assign_demo_children(text) to authenticated, service_role;

commit;
