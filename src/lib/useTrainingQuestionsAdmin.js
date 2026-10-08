import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

// Admin-side hook for the Question Content Management feature — see
// supabase/migrations/022_question_versioning_and_rls.sql and
// src/components/TrainingQuestionEditor.js.
//
// Unlike useTrainingQuestions.js (the trainee/teacher read path, which
// only ever sees published rows), this hook sees every row — draft,
// published and archived — because an admin needs to see what's live
// AND keep working on a draft of it at the same time.
//
// Rows are grouped by `question_key`: every version of "the same
// question" shares one key. The admin UI works with one "question
// group" per question, not one row per question — editing always
// creates/updates the group's draft row, never the published row
// directly (see the migration's header comment: "Tell him not to
// simply overwrite the row").

const LANGUAGES = ["en", "af", "xh"];

function emptyTranslation() {
  return { text: "", choices: [{ id: "opt0", text: "" }, { id: "opt1", text: "" }] };
}

function blankQuestionDraft(moduleId, order) {
  const translations = {};
  LANGUAGES.forEach((lang) => { translations[lang] = emptyTranslation(); });
  return {
    module_id: moduleId,
    question_order: order,
    question_text: "",
    choices: [],
    correct_choice_id: null,
    correct_choice_ids: [],
    points: 1,
    multiple_select: false,
    shuffle_options: false,
    hint: "",
    category: "",
    translations,
    status: "draft",
    version: 1,
  };
}

function mapRow(row) {
  return {
    id: row.id,
    moduleId: row.module_id,
    questionKey: row.question_key,
    version: row.version,
    status: row.status, // draft | published | archived
    order: row.question_order,
    points: row.points ?? 1,
    multipleSelect: !!row.multiple_select,
    shuffleOptions: !!row.shuffle_options,
    correctChoiceIds: Array.isArray(row.correct_choice_ids) && row.correct_choice_ids.length
      ? row.correct_choice_ids
      : (row.correct_choice_id ? [row.correct_choice_id] : []),
    hint: row.hint || "",
    category: row.category || "",
    translations: row.translations && Object.keys(row.translations).length
      ? row.translations
      : { en: { text: row.question_text || "", choices: Array.isArray(row.choices) ? row.choices : [] } },
    updatedAt: row.updated_at,
  };
}

// Groups the raw rows for a module into one entry per question_key:
// { questionKey, order, published, draft, archivedVersions }
function groupRows(rows) {
  const byKey = new Map();
  rows.forEach((row) => {
    const key = row.questionKey;
    if (!byKey.has(key)) byKey.set(key, { questionKey: key, published: null, draft: null, archivedVersions: [] });
    const entry = byKey.get(key);
    if (row.status === "published") entry.published = row;
    else if (row.status === "draft") {
      // keep the highest version if more than one draft ever exists
      if (!entry.draft || row.version > entry.draft.version) entry.draft = row;
    } else {
      entry.archivedVersions.push(row);
    }
  });
  const groups = Array.from(byKey.values()).map((g) => ({
    ...g,
    order: (g.published || g.draft)?.order ?? 0,
  }));
  groups.sort((a, b) => a.order - b.order);
  return groups;
}

export function useTrainingQuestionsAdmin(moduleId) {
  const [rows, setRows] = useState(null); // null = loading
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!moduleId) { setRows([]); return; }
    const { data, error: err } = await supabase
      .from("training_questions")
      .select("*")
      .eq("module_id", moduleId)
      .order("question_order", { ascending: true })
      .order("version", { ascending: true });

    if (err) {
      console.error("Error loading questions (admin):", err);
      setError(
        "Could not load this module's questions — " + err.message +
        ". Has migration 022_question_versioning_and_rls.sql been run, and is this account's role 'admin' in the users table?"
      );
      setRows([]);
      return;
    }
    setError("");
    setRows((data || []).map(mapRow));
  }, [moduleId]);

  useEffect(() => { refresh(); }, [refresh]);

  const groups = groupRows(rows || []);

  // Starts a brand-new question: inserted straight as a draft, with a
  // fresh question_key. Nothing is visible to trainees until Publish.
  const createDraft = useCallback(async () => {
    if (!moduleId) return null;
    const nextOrder = groups.length ? Math.max(...groups.map((g) => g.order)) + 1 : 1;
    const base = blankQuestionDraft(moduleId, nextOrder);
    const { data, error: err } = await supabase
      .from("training_questions")
      .insert({ ...base, question_key: crypto.randomUUID() })
      .select()
      .single();
    if (err) { console.error("Error creating question draft:", err); return null; }
    refresh();
    return mapRow(data);
  }, [moduleId, groups, refresh]);

  // Starts editing an existing (published) question: clones it into a
  // new draft row at version+1 under the same question_key, rather than
  // touching the published row. If a draft already exists for this key,
  // just returns it (resume editing).
  const startEditing = useCallback(async (group) => {
    if (group.draft) return group.draft;
    const source = group.published;
    if (!source) return null;
    const { data, error: err } = await supabase
      .from("training_questions")
      .insert({
        module_id: moduleId,
        question_key: group.questionKey,
        question_order: source.order,
        question_text: source.translations?.en?.text || "",
        choices: source.translations?.en?.choices || [],
        correct_choice_id: source.correctChoiceIds[0] || null,
        correct_choice_ids: source.correctChoiceIds,
        points: source.points,
        multiple_select: source.multipleSelect,
        shuffle_options: source.shuffleOptions,
        hint: source.hint,
        category: source.category,
        translations: source.translations,
        status: "draft",
        version: source.version + 1,
      })
      .select()
      .single();
    if (err) { console.error("Error starting a draft from the published question:", err); return null; }
    refresh();
    return mapRow(data);
  }, [moduleId, refresh]);

  // Saves changes to a draft row in place — never touches the published
  // row for the same question_key.
  const saveDraft = useCallback(async (draftId, fields) => {
    const payload = {
      question_order: fields.order,
      question_text: fields.translations?.en?.text || "",
      choices: fields.translations?.en?.choices || [],
      correct_choice_id: fields.correctChoiceIds[0] || null,
      correct_choice_ids: fields.correctChoiceIds,
      points: fields.points,
      multiple_select: fields.multipleSelect,
      shuffle_options: fields.shuffleOptions,
      hint: fields.hint,
      category: fields.category,
      translations: fields.translations,
      updated_at: new Date().toISOString(),
    };
    const { error: err } = await supabase.from("training_questions").update(payload).eq("id", draftId);
    if (err) { console.error("Error saving question draft:", err); return false; }
    refresh();
    return true;
  }, [refresh]);

  // Discards a draft without ever having gone live — just archives that
  // one row (the published version, if any, is untouched).
  const discardDraft = useCallback(async (draftId) => {
    const { error: err } = await supabase
      .from("training_questions")
      .update({ status: "archived", updated_at: new Date().toISOString() })
      .eq("id", draftId);
    if (err) { console.error("Error discarding draft:", err); return false; }
    refresh();
    return true;
  }, [refresh]);

  // Atomically makes a draft the live, published version (see the
  // publish_training_question() function in migration 022 — this is a
  // single round trip, not two separate updates from here).
  const publish = useCallback(async (questionKey, rowId) => {
    const { error: err } = await supabase.rpc("publish_training_question", {
      p_question_key: questionKey,
      p_row_id: rowId,
    });
    if (err) { console.error("Error publishing question:", err); return false; }
    refresh();
    return true;
  }, [refresh]);

  // Soft-delete: archives every live/draft version of this question.
  // Never a hard DELETE — matches the project's archive-don't-destroy
  // convention and the spec's explicit requirement.
  const archiveQuestion = useCallback(async (questionKey) => {
    const { error: err } = await supabase.rpc("archive_training_question", {
      p_question_key: questionKey,
    });
    if (err) { console.error("Error archiving question:", err); return false; }
    refresh();
    return true;
  }, [refresh]);

  const moveQuestion = useCallback(async (group, direction) => {
    const ordered = groups.slice();
    const index = ordered.findIndex((g) => g.questionKey === group.questionKey);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= ordered.length) return false;
    const neighbour = ordered[swapIndex];

    const rowsForGroup = (g) => [g.published, g.draft, ...g.archivedVersions].filter(Boolean);
    const updates = [
      ...rowsForGroup(group).map((r) => supabase.from("training_questions").update({ question_order: neighbour.order }).eq("id", r.id)),
      ...rowsForGroup(neighbour).map((r) => supabase.from("training_questions").update({ question_order: group.order }).eq("id", r.id)),
    ];
    const results = await Promise.all(updates);
    const failed = results.find((r) => r.error);
    if (failed) { console.error("Error reordering questions:", failed.error); return false; }
    refresh();
    return true;
  }, [groups, refresh]);

  return {
    groups,
    loading: rows === null,
    error,
    refresh,
    createDraft,
    startEditing,
    saveDraft,
    discardDraft,
    publish,
    archiveQuestion,
    moveQuestion,
    LANGUAGES,
    emptyTranslation,
  };
}