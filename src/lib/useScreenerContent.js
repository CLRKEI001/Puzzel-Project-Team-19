import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { puzzleBoxContentV1, interpretationBands as fallbackBands } from "../data/puzzleBoxContent.v1";

// Loads the screener's content — sections, questions, scoring rules,
// interpretation bands — from the tables created by
// supabase/migrations/007_screener_content.sql, edited by an admin via
// Admin → Screener Content (ScreenerContentAdmin.js).
//
// Reconstructs the exact shape PuzzleBoxScreener.js was already written
// against (see that file's original header comment, which anticipated
// exactly this swap), so the screening UI itself needs no redesign —
// only its content source changes.
//
// SAFETY NET: if the screener_* tables haven't been migrated/seeded yet,
// or Supabase is briefly unreachable, this falls back to the original
// hardcoded content in src/data/puzzleBoxContent.v1.js — a screening in
// progress in a classroom should never break because of a content-admin
// change or a network hiccup. That file is kept for exactly this reason;
// it is no longer the primary source once migration 008 has been run.

// Same evaluate-in-order, first-match rule as the original hardcoded
// scoring predicates in puzzleBoxContent.v1.js — just built from
// (score, min, max) rows an admin can edit instead of a JS function.
export function scoreFromAgeTable(table, age, value) {
  const rows = table[age] || table[6];
  if (!rows) return null;
  for (const row of rows) {
    if (row.test(value)) return row.score;
  }
  return null;
}

function rangeRowsToTestRows(rows) {
  return [...rows]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((r) => ({
      score: r.score,
      min: r.min_value,
      max: r.max_value,
      test: (v) => (r.min_value == null || v >= r.min_value) && (r.max_value == null || v <= r.max_value),
    }));
}

export function useScreenerContent() {
  const [content, setContent] = useState(null); // null = still loading
  const [bands, setBands] = useState(null);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const [
      { data: meta, error: metaErr },
      { data: sections, error: secErr },
      { data: questions, error: qErr },
      { data: scoreTables, error: stErr },
      { data: bandRows, error: bandErr },
    ] = await Promise.all([
      supabase.from("screener_meta").select("*").eq("id", 1).maybeSingle(),
      supabase.from("screener_sections").select("*").order("sort_order", { ascending: true }),
      supabase.from("screener_questions").select("*").order("sort_order", { ascending: true }),
      supabase.from("screener_score_tables").select("*"),
      supabase.from("screener_interpretation_bands").select("*").order("sort_order", { ascending: true }),
    ]);

    const firstError = metaErr || secErr || qErr || stErr || bandErr;
    if (firstError) {
      console.error("Error loading screener content:", firstError);
      setError("Could not load screener content — using the built-in default.");
      setContent(puzzleBoxContentV1);
      setBands(fallbackBands);
      return;
    }

    if (!sections || sections.length === 0) {
      // Migrations 007/008 not run yet, or content table cleared.
      setError("");
      setContent(puzzleBoxContentV1);
      setBands(fallbackBands);
      return;
    }

    const tablesByQuestion = {};
    for (const row of scoreTables || []) {
      tablesByQuestion[row.question_id] = tablesByQuestion[row.question_id] || {};
      tablesByQuestion[row.question_id][row.age] = tablesByQuestion[row.question_id][row.age] || [];
      tablesByQuestion[row.question_id][row.age].push(row);
    }

    const questionsBySection = {};
    for (const q of questions || []) {
      questionsBySection[q.section_id] = questionsBySection[q.section_id] || [];
      const ageRows = tablesByQuestion[q.id];
      let ageTable = null;
      if (ageRows) {
        ageTable = {};
        for (const [age, rows] of Object.entries(ageRows)) {
          ageTable[age] = rangeRowsToTestRows(rows);
        }
      }
      questionsBySection[q.section_id].push({
        id: q.id,
        label: q.label,
        instruction: q.instruction || undefined,
        toPass: q.to_pass || undefined,
        domain: q.domain_override || undefined,
        scoringType: q.scoring_type,
        needsConfirmation: !!q.needs_confirmation,
        checklistOptions: q.checklist_options && q.checklist_options.length ? q.checklist_options : undefined,
        ageTable,
      });
    }

    const builtSections = sections.map((s) => ({
      id: s.id,
      domain: s.domain,
      title: s.title,
      description: s.description || undefined,
      isPuzzleTimerSection: !!s.is_puzzle_timer_section,
      questions: questionsBySection[s.id] || [],
    }));

    const bandsByAge = {};
    for (const row of bandRows || []) {
      bandsByAge[row.age] = bandsByAge[row.age] || [];
      bandsByAge[row.age].push({
        band: row.band_key,
        label: row.label,
        min: row.min_score ?? undefined,
        max: row.max_score ?? undefined,
      });
    }

    setError("");
    setContent({
      version: meta?.version || "1.0",
      status: "published",
      instructions: meta?.instructions || "",
      scoringLegend: meta?.scoring_legend || [],
      sections: builtSections,
    });
    setBands(Object.keys(bandsByAge).length > 0 ? bandsByAge : fallbackBands);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return {
    content,
    interpretationBands: bands,
    loading: content === null,
    error,
    refresh,
  };
}