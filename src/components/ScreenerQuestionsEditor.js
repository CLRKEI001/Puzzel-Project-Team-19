// ScreenerQuestionsEditor.js
//
// Manages the questions inside one screener section: add, edit, reorder,
// delete, and — for age_table / checklist questions — the age-based
// scoring table (ScreenerScoreTableEditor.js). Rendered inline inside
// ScreenerContentAdmin.js when a section row is expanded.
//
// See supabase/migrations/007_screener_content.sql (screener_questions,
// screener_score_tables).

import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import ScreenerScoreTableEditor from "./ScreenerScoreTableEditor";

const SCORING_TYPES = [
  { value: "binary", label: "Pass / Fail (0 or 1)" },
  { value: "scale3", label: "Fail / Pass / Passed Confidently (0-2, manual)" },
  { value: "age_table", label: "Timed, scored by age (0-2)" },
  { value: "checklist", label: "Checklist, scored by age from count ticked" },
];

const inputStyle = {
  width: "100%",
  padding: "8px 11px",
  border: "1.5px solid var(--border)",
  borderRadius: 9,
  fontSize: 12.5,
  fontFamily: "inherit",
  outline: "none",
  background: "#fff",
};

const labelStyle = {
  fontSize: 10.5,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  color: "var(--ink-mid)",
  display: "block",
  marginBottom: 4,
};

const emptyForm = () => ({
  label: "", instruction: "", toPass: "", domainOverride: "",
  scoringType: "binary", needsConfirmation: false, checklistOptions: [""],
});

const DOMAINS = ["cognitive", "fine_motor", "language", "social", "emotional", "moral", "attention"];

export default function ScreenerQuestionsEditor({ sectionId }) {
  const [questions, setQuestions] = useState(null);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [expandedScoreTable, setExpandedScoreTable] = useState(null);

  const refresh = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("screener_questions")
      .select("*")
      .eq("section_id", sectionId)
      .order("sort_order", { ascending: true });
    if (err) {
      console.error("Error loading questions:", err);
      setError("Could not load this section's questions.");
      setQuestions([]);
      return;
    }
    setError("");
    setQuestions(data || []);
  }, [sectionId]);

  useEffect(() => { refresh(); }, [refresh]);

  const openAdd = () => {
    setForm(emptyForm());
    setEditingId(null);
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (q) => {
    setForm({
      label: q.label,
      instruction: q.instruction || "",
      toPass: q.to_pass || "",
      domainOverride: q.domain_override || "",
      scoringType: q.scoring_type,
      needsConfirmation: !!q.needs_confirmation,
      checklistOptions: q.checklist_options && q.checklist_options.length ? q.checklist_options : [""],
    });
    setEditingId(q.id);
    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditingId(null); setFormError(""); };

  const setChecklistOption = (i, value) => {
    const opts = [...form.checklistOptions];
    opts[i] = value;
    setForm({ ...form, checklistOptions: opts });
  };
  const addChecklistOption = () => setForm({ ...form, checklistOptions: [...form.checklistOptions, ""] });
  const removeChecklistOption = (i) => {
    if (form.checklistOptions.length <= 1) return;
    setForm({ ...form, checklistOptions: form.checklistOptions.filter((_, idx) => idx !== i) });
  };

  const save = async () => {
    if (!form.label.trim()) { setFormError("Please give the question a label."); return; }
    if (form.scoringType === "checklist" && form.checklistOptions.every((o) => !o.trim())) {
      setFormError("Add at least one checklist option.");
      return;
    }
    setSaving(true);
    setFormError("");

    const payload = {
      label: form.label.trim(),
      instruction: form.instruction.trim(),
      to_pass: form.toPass.trim(),
      domain_override: form.domainOverride || null,
      scoring_type: form.scoringType,
      needs_confirmation: form.needsConfirmation,
      checklist_options: form.scoringType === "checklist" ? form.checklistOptions.map((o) => o.trim()).filter(Boolean) : [],
    };

    let saveError;
    if (editingId) {
      ({ error: saveError } = await supabase.from("screener_questions").update(payload).eq("id", editingId));
    } else {
      const nextOrder = (questions || []).reduce((max, q) => Math.max(max, q.sort_order || 0), 0) + 1;
      ({ error: saveError } = await supabase.from("screener_questions").insert({ ...payload, section_id: sectionId, sort_order: nextOrder }));
    }

    if (saveError) {
      console.error(editingId ? "Error updating question:" : "Error adding question:", saveError);
      setFormError((editingId ? "Could not save changes — " : "Could not add this question — ") + saveError.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    closeForm();
    refresh();
  };

  const remove = async () => {
    if (!confirmDelete) return;
    const { error: err } = await supabase.from("screener_questions").delete().eq("id", confirmDelete.id);
    if (err) console.error("Error deleting question:", err);
    setConfirmDelete(null);
    refresh();
  };

  const move = async (q, direction) => {
    const sorted = [...(questions || [])].sort((a, b) => a.sort_order - b.sort_order);
    const index = sorted.findIndex((item) => item.id === q.id);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= sorted.length) return;
    const neighbour = sorted[swapIndex];
    setBusyId(q.id);
    await Promise.all([
      supabase.from("screener_questions").update({ sort_order: neighbour.sort_order }).eq("id", q.id),
      supabase.from("screener_questions").update({ sort_order: q.sort_order }).eq("id", neighbour.id),
    ]);
    setBusyId(null);
    refresh();
  };

  const scoreTableTypes = new Set(["age_table", "checklist"]);
  const sorted = [...(questions || [])].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div style={{ padding: "16px 18px", background: "var(--surface)", borderTop: "1px solid var(--border)" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: "var(--ink-mid)", fontWeight: 700 }}>
          {sorted.length} question{sorted.length === 1 ? "" : "s"}
        </span>
        <button className="btn btn-primary btn-sm" style={{ marginLeft: "auto" }} onClick={openAdd}>
          + Add Question
        </button>
      </div>

      {error && (
        <div style={{ padding: "8px 12px", background: "var(--pink-lt)", color: "var(--pink)", borderRadius: 9, fontSize: 12, fontWeight: 700, marginBottom: 10 }}>
          ⚠ {error}
        </div>
      )}

      {questions === null ? (
        <p style={{ fontSize: 13, color: "var(--ink-mid)" }}>Loading questions…</p>
      ) : sorted.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--ink-faint)" }}>No questions in this section yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sorted.map((q, i) => {
            const scoreTableOpen = expandedScoreTable === q.id;
            return (
              <div key={q.id} style={{ borderRadius: 12, background: "#fff", border: "1px solid var(--border)", overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <button className="btn btn-ghost btn-sm" style={{ padding: "1px 7px" }} disabled={i === 0 || busyId === q.id} onClick={() => move(q, "up")}>↑</button>
                    <button className="btn btn-ghost btn-sm" style={{ padding: "1px 7px" }} disabled={i === sorted.length - 1 || busyId === q.id} onClick={() => move(q, "down")}>↓</button>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{q.label}</div>
                    {q.instruction && <div style={{ fontSize: 11.5, color: "var(--ink-faint)", marginTop: 3 }}>{q.instruction}</div>}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                      <span style={{ fontSize: 10.5, padding: "2px 8px", borderRadius: 10, background: "var(--surface)", color: "var(--ink-mid)", fontWeight: 700 }}>
                        {SCORING_TYPES.find((t) => t.value === q.scoring_type)?.label || q.scoring_type}
                      </span>
                      {q.domain_override && (
                        <span style={{ fontSize: 10.5, padding: "2px 8px", borderRadius: 10, background: "var(--teal-lt)", color: "var(--teal)", fontWeight: 700 }}>
                          domain: {q.domain_override}
                        </span>
                      )}
                      {q.needs_confirmation && (
                        <span style={{ fontSize: 10.5, padding: "2px 8px", borderRadius: 10, background: "var(--pink-lt)", color: "var(--pink)", fontWeight: 700 }}>
                          needs psychologist confirmation
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    {scoreTableTypes.has(q.scoring_type) && (
                      <button className="btn btn-sm" style={{ background: scoreTableOpen ? "var(--purple)" : "var(--purple-lt, #F0EDF8)", color: scoreTableOpen ? "#fff" : "var(--purple, #6B2F8A)", border: "none" }}
                        onClick={() => setExpandedScoreTable(scoreTableOpen ? null : q.id)}>
                        {scoreTableOpen ? "Hide Scoring" : "Scoring"}
                      </button>
                    )}
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(q)}>Edit</button>
                    <button className="btn btn-sm" style={{ background: "var(--pink-lt)", color: "var(--pink)", border: "none" }} onClick={() => setConfirmDelete(q)}>Delete</button>
                  </div>
                </div>
                {scoreTableOpen && (
                  <div style={{ padding: "0 14px 14px" }}>
                    <ScreenerScoreTableEditor questionId={q.id} valueUnit={q.scoring_type === "checklist" ? "items ticked" : "seconds"} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT QUESTION MODAL */}
      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal" style={{ maxWidth: 620, maxHeight: "85vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{editingId ? "Edit Question" : "Add Question"}</div>
              <button className="modal-close" onClick={closeForm}>✕</button>
            </div>

            {formError && (
              <div style={{ padding: "10px 14px", background: "var(--pink-lt)", color: "var(--pink)", borderRadius: 10, fontSize: 13, fontWeight: 700, marginBottom: 14 }}>
                ⚠ {formError}
              </div>
            )}

            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Label</label>
              <input style={inputStyle} placeholder="e.g. Puzzle completion" value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })} />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Instruction (what the teacher says/does)</label>
              <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
                value={form.instruction} onChange={(e) => setForm({ ...form, instruction: e.target.value })} />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>To pass (shown as a hint under the question)</label>
              <input style={inputStyle} value={form.toPass} onChange={(e) => setForm({ ...form, toPass: e.target.value })} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Scoring type</label>
                <select style={inputStyle} value={form.scoringType} onChange={(e) => setForm({ ...form, scoringType: e.target.value })}>
                  {SCORING_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Domain override (optional)</label>
                <select style={inputStyle} value={form.domainOverride} onChange={(e) => setForm({ ...form, domainOverride: e.target.value })}>
                  <option value="">Use section's domain</option>
                  {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {form.scoringType === "checklist" && (
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Checklist options</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {form.checklistOptions.map((opt, i) => (
                    <div key={i} style={{ display: "flex", gap: 6 }}>
                      <input style={inputStyle} placeholder={`Option ${i + 1}`} value={opt} onChange={(e) => setChecklistOption(i, e.target.value)} />
                      <button type="button" className="btn btn-ghost btn-sm" disabled={form.checklistOptions.length <= 1} onClick={() => removeChecklistOption(i)}>✕</button>
                    </div>
                  ))}
                  <button type="button" className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start" }} onClick={addChecklistOption}>+ Add option</button>
                </div>
              </div>
            )}

            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--ink-mid)", marginBottom: 20, cursor: "pointer" }}>
              <input type="checkbox" checked={form.needsConfirmation} onChange={(e) => setForm({ ...form, needsConfirmation: e.target.checked })} />
              Scoring for this question still needs to be confirmed by the psychologists (shows a note next to it)
            </label>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={closeForm}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Delete this question?</div>
              <button className="modal-close" onClick={() => setConfirmDelete(null)}>✕</button>
            </div>
            <p style={{ fontSize: 13.5, color: "var(--ink-mid)", lineHeight: 1.6, marginBottom: 20 }}>
              "{confirmDelete.label}" and its scoring table (if any) will be removed. This can't be undone.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn btn-sm" style={{ background: "var(--pink)", color: "#fff", border: "none", padding: "10px 18px" }} onClick={remove}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}