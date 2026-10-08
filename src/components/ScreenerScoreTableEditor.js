// ScreenerScoreTableEditor.js
//
// Age-based scoring editor for one question with scoring_type "age_table"
// or "checklist" (e.g. "the puzzle scores 2 if under 6 minutes, 1 if
// 6-13 minutes, 0 otherwise, for a 5-year-old"). Rendered inline inside
// ScreenerQuestionsEditor.js when a question of that type is expanded.
//
// Each row is one (score, min, max) range for one age. Rows are
// evaluated top to bottom and the FIRST matching range wins — the same
// rule PuzzleBoxScreener.js's original hardcoded scoring functions used,
// now expressed as data an admin can edit instead of a line of code.
// See supabase/migrations/007_screener_content.sql (screener_score_tables)
// and src/lib/useScreenerContent.js (which turns these rows back into
// that same evaluate-in-order behaviour for the live screener).

import React, { useEffect, useState } from "react";
import Doodle from "./Doodle";
import { supabase } from "../supabaseClient";

const AGES = [5, 6];

const numInputStyle = {
  width: 68,
  padding: "6px 8px",
  border: "1.5px solid var(--border)",
  borderRadius: 8,
  fontSize: 12.5,
  fontFamily: "inherit",
  outline: "none",
  background: "#fff",
};

export default function ScreenerScoreTableEditor({ questionId, valueUnit }) {
  const [rowsByAge, setRowsByAge] = useState(null); // { 5: [...], 6: [...] }
  const [error, setError] = useState("");
  const [savingKey, setSavingKey] = useState(null); // row id currently saving/deleting

  const load = async () => {
    const { data, error: err } = await supabase
      .from("screener_score_tables")
      .select("*")
      .eq("question_id", questionId)
      .order("age", { ascending: true })
      .order("sort_order", { ascending: true });
    if (err) {
      console.error("Error loading score table:", err);
      setError("Could not load the scoring table for this question.");
      return;
    }
    const grouped = { 5: [], 6: [] };
    for (const row of data || []) {
      if (!grouped[row.age]) grouped[row.age] = [];
      grouped[row.age].push(row);
    }
    setRowsByAge(grouped);
  };

  useEffect(() => { load(); }, [questionId]); // eslint-disable-line react-hooks/exhaustive-deps

  const addRow = async (age) => {
    const rows = rowsByAge[age] || [];
    const nextOrder = rows.reduce((max, r) => Math.max(max, r.sort_order || 0), 0) + 1;
    const { error: err } = await supabase.from("screener_score_tables").insert({
      question_id: questionId, age, sort_order: nextOrder, score: 0, min_value: null, max_value: null,
    });
    if (err) { console.error("Error adding score row:", err); setError("Could not add a row — " + err.message); return; }
    load();
  };

  const updateRow = async (row, patch) => {
    setSavingKey(row.id);
    const { error: err } = await supabase.from("screener_score_tables").update(patch).eq("id", row.id);
    if (err) console.error("Error updating score row:", err);
    setSavingKey(null);
    load();
  };

  const deleteRow = async (row) => {
    const { error: err } = await supabase.from("screener_score_tables").delete().eq("id", row.id);
    if (err) { console.error("Error deleting score row:", err); return; }
    load();
  };

  const moveRow = async (age, row, direction) => {
    const rows = [...(rowsByAge[age] || [])].sort((a, b) => a.sort_order - b.sort_order);
    const index = rows.findIndex((r) => r.id === row.id);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= rows.length) return;
    const neighbour = rows[swapIndex];
    setSavingKey(row.id);
    await Promise.all([
      supabase.from("screener_score_tables").update({ sort_order: neighbour.sort_order }).eq("id", row.id),
      supabase.from("screener_score_tables").update({ sort_order: row.sort_order }).eq("id", neighbour.id),
    ]);
    setSavingKey(null);
    load();
  };

  if (!rowsByAge) return <p style={{ fontSize: 12, color: "var(--ink-faint)" }}>Loading scoring table…</p>;

  return (
    <div style={{ marginTop: 10, padding: "12px 14px", borderRadius: 10, background: "var(--surface)" }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-mid)", marginBottom: 8 }}>
        Age-based scoring{valueUnit ? ` (value in ${valueUnit})` : ""} — first matching range wins
      </div>

      {error && (
        <div style={{ padding: "6px 10px", background: "var(--pink-lt)", color: "var(--pink)", borderRadius: 8, fontSize: 11.5, fontWeight: 700, marginBottom: 8 }}>
          <Doodle name="warning" size={16} inline /> {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {AGES.map((age) => {
          const rows = [...(rowsByAge[age] || [])].sort((a, b) => a.sort_order - b.sort_order);
          return (
            <div key={age}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--ink-faint)", marginBottom: 6 }}>
                Age {age}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {rows.length === 0 && <p style={{ fontSize: 11.5, color: "var(--ink-faint)" }}>No rows yet.</p>}
                {rows.map((row, i) => (
                  <div key={row.id} style={{ display: "flex", alignItems: "center", gap: 6, opacity: savingKey === row.id ? 0.6 : 1 }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <button className="btn btn-ghost btn-sm" style={{ padding: "0 5px", fontSize: 10 }} disabled={i === 0} onClick={() => moveRow(age, row, "up")}>↑</button>
                      <button className="btn btn-ghost btn-sm" style={{ padding: "0 5px", fontSize: 10 }} disabled={i === rows.length - 1} onClick={() => moveRow(age, row, "down")}>↓</button>
                    </div>
                    <label style={{ fontSize: 11, color: "var(--ink-faint)" }}>score</label>
                    <input type="number" style={numInputStyle} value={row.score}
                      onChange={(e) => updateRow(row, { score: parseInt(e.target.value, 10) || 0 })} />
                    <label style={{ fontSize: 11, color: "var(--ink-faint)" }}>min</label>
                    <input type="number" style={numInputStyle} placeholder="—" value={row.min_value ?? ""}
                      onChange={(e) => updateRow(row, { min_value: e.target.value === "" ? null : parseInt(e.target.value, 10) })} />
                    <label style={{ fontSize: 11, color: "var(--ink-faint)" }}>max</label>
                    <input type="number" style={numInputStyle} placeholder="—" value={row.max_value ?? ""}
                      onChange={(e) => updateRow(row, { max_value: e.target.value === "" ? null : parseInt(e.target.value, 10) })} />
                    <button className="btn btn-sm" style={{ background: "var(--pink-lt)", color: "var(--pink)", border: "none", padding: "4px 8px" }} onClick={() => deleteRow(row)}>✕</button>
                  </div>
                ))}
                <button className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start", marginTop: 2 }} onClick={() => addRow(age)}>
                  + Add range
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}