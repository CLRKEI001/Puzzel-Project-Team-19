import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

// Shared by the admin quiz editor (TrainingQuizEditor.js) and the
// member-facing quiz (TrainingModuleQuiz.js) — both read the same table.
// See supabase/migrations/005_training_content.sql.

function mapRow(row) {
  return {
    id: row.id,
    moduleId: row.module_id,
    order: row.question_order,
    text: row.question_text,
    choices: Array.isArray(row.choices) ? row.choices : [],
    correctChoiceId: row.correct_choice_id,
    points: row.points ?? 1,
  };
}

export function useTrainingQuestions(moduleId) {
  const [questions, setQuestions] = useState(null); // null = still loading
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!moduleId) { setQuestions([]); return; }

    const { data, error: err } = await supabase
      .from("training_questions")
      .select("*")
      .eq("module_id", moduleId)
      .order("question_order", { ascending: true });

    if (err) {
      console.error("Error loading quiz questions:", err);
      setError("Could not load this module's quiz.");
      setQuestions([]);
      return;
    }

    setError("");
    setQuestions((data || []).map(mapRow));
  }, [moduleId]);

  useEffect(() => { refresh(); }, [refresh]);

  return { questions: questions || [], loading: questions === null, error, refresh };
}