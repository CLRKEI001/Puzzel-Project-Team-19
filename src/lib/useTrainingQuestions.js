import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

// Trainee/teacher-facing read path — used by the member-facing quiz
// (TrainingModuleQuiz.js). The admin editor (TrainingQuestionEditor.js)
// uses its own hook (useTrainingQuestionsAdmin.js) that also needs to
// see drafts and archived versions; this one deliberately never does.
//
// See supabase/migrations/022_question_versioning_and_rls.sql: every
// question now has a status (draft/published/archived) and a
// question_key grouping its versions together. This hook ALWAYS filters
// to status = 'published' and never caches across calls — a teacher must
// see a newly-published edit immediately, and must never be able to see
// a draft. That's enforced twice over: by this filter, and for real (not
// just "the UI didn't ask") by the RLS policy on training_questions
// itself, which only lets a non-admin read published rows at all.

function mapRow(row, language) {
  const translations = row.translations || {};
  const t = translations[language] || translations.en || null;

  const legacyChoices = Array.isArray(row.choices) ? row.choices : [];
  const choices = t && Array.isArray(t.choices) && t.choices.length ? t.choices : legacyChoices;
  const text = t && t.text ? t.text : row.question_text;

  const correctChoiceIds = Array.isArray(row.correct_choice_ids) && row.correct_choice_ids.length
    ? row.correct_choice_ids
    : (row.correct_choice_id ? [row.correct_choice_id] : []);

  return {
    id: row.id,
    moduleId: row.module_id,
    questionKey: row.question_key,
    version: row.version,
    order: row.question_order,
    text,
    choices,
    correctChoiceId: correctChoiceIds[0] || row.correct_choice_id, // back-compat: single-answer UIs keep working
    correctChoiceIds,
    multipleSelect: !!row.multiple_select,
    shuffleOptions: !!row.shuffle_options,
    points: row.points ?? 1,
  };
}

export function useTrainingQuestions(moduleId, language = "en") {
  const [questions, setQuestions] = useState(null); // null = still loading
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!moduleId) { setQuestions([]); return; }

    const { data, error: err } = await supabase
      .from("training_questions")
      .select("*")
      .eq("module_id", moduleId)
      .eq("status", "published")
      .order("question_order", { ascending: true });

    if (err) {
      console.error("Error loading quiz questions:", err);
      setError("Could not load this module's quiz.");
      setQuestions([]);
      return;
    }

    setError("");
    setQuestions((data || []).map((row) => mapRow(row, language)));
  }, [moduleId, language]);

  useEffect(() => { refresh(); }, [refresh]);

  return { questions: questions || [], loading: questions === null, error, refresh };
}