// TrainingQuizEditor.js
//
// Manages the quiz for one training module: questions, multiple-choice
// answers, which answer is correct, and how many points it's worth.
// Rendered inline inside TrainingModulesAdmin.js when an admin clicks
// "Quiz" on a module row. See supabase/migrations/005_training_content.sql.

import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useTrainingQuestions } from "../lib/useTrainingQuestions";

const inputStyle = {
  width: "100%",
  padding: "8px 11px",
  border: "1.5px solid var(--border)",
  borderRadius: 9,
  fontSize: 13,
  fontFamily: "inherit",
  outline: "none",
  background: "#fff",
};

const labelStyle = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.6px",
  color: "var(--ink-mid)",
  display: "block",
  marginBottom: 5,
};

const emptyForm = () => ({
  text: "",
  points: 1,
  choices: [{ text: "" }, { text: "" }],
  correctIndex: 0,
});

export default function TrainingQuizEditor({ moduleId }) {
  const { questions, loading, error, refresh } = useTrainingQuestions(moduleId);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const openAdd = () => {
    setForm(emptyForm());
    setEditingId(null);
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (q) => {
    const correctIndex = Math.max(0, q.choices.findIndex((c) => c.id === q.correctChoiceId));
    setForm({
      text: q.text,
      points: q.points,
      choices: q.choices.map((c) => ({ text: c.text })),
      correctIndex,
    });
    setEditingId(q.id);
    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormError("");
  };

  const setChoiceText = (index, text) => {
    const choices = [...form.choices];
    choices[index] = { text };
    setForm({ ...form, choices });
  };

  const addChoice = () => {
    if (form.choices.length >= 6) return;
    setForm({ ...form, choices: [...form.choices, { text: "" }] });
  };

  const removeChoice = (index) => {
    if (form.choices.length <= 2) return;
    const choices = form.choices.filter((_, i) => i !== index);
    let correctIndex = form.correctIndex;
    if (index === form.correctIndex) correctIndex = 0;
    else if (index < form.correctIndex) correctIndex -= 1;
    setForm({ ...form, choices, correctIndex });
  };

  const save = async () => {
    const text = form.text.trim();
    const choiceTexts = form.choices.map((c) => c.text.trim());

    if (!text) { setFormError("Please enter the question text."); return; }
    if (choiceTexts.some((t) => !t)) { setFormError("Every answer option needs text — fill in or remove empty ones."); return; }
    if (form.correctIndex < 0 || form.correctIndex >= choiceTexts.length) { setFormError("Please mark which answer is correct."); return; }

    setSaving(true);
    setFormError("");

    const choices = choiceTexts.map((t, i) => ({ id: `opt${i}`, text: t }));
    const payload = {
      question_text: text,
      choices,
      correct_choice_id: choices[form.correctIndex].id,
      points: Math.max(1, parseInt(form.points, 10) || 1),
    };

    let saveError;
    if (editingId) {
      ({ error: saveError } = await supabase.from("training_questions").update(payload).eq("id", editingId));
    } else {
      const nextOrder = questions.reduce((max, q) => Math.max(max, q.order || 0), 0) + 1;
      ({ error: saveError } = await supabase.from("training_questions").insert({ ...payload, module_id: moduleId, question_order: nextOrder }));
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
    const { error: deleteError } = await supabase.from("training_questions").delete().eq("id", confirmDelete.id);
    if (deleteError) console.error("Error deleting question:", deleteError);
    setConfirmDelete(null);
    refresh();
  };

  const move = async (q, direction) => {
    const sorted = [...questions].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex((item) => item.id === q.id);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= sorted.length) return;
    const neighbour = sorted[swapIndex];

    setBusyId(q.id);
    const [{ error: err1 }, { error: err2 }] = await Promise.all([
      supabase.from("training_questions").update({ question_order: neighbour.order }).eq("id", q.id),
      supabase.from("training_questions").update({ question_order: q.order }).eq("id", neighbour.id),
    ]);
    if (err1 || err2) console.error("Error reordering questions:", err1 || err2);
    setBusyId(null);
    refresh();
  };

  const sorted = [...questions].sort((a, b) => a.order - b.order);
  const totalPoints = sorted.reduce((sum, q) => sum + (q.points || 0), 0);

  return (
    <div style={{ padding: "18px 20px", background: "var(--surface)", borderTop: "1px solid var(--border)" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: 12.5, color: "var(--ink-mid)", fontWeight: 700 }}>
          {sorted.length} question{sorted.length === 1 ? "" : "s"} · {totalPoints} point{totalPoints === 1 ? "" : "s"} total
        </span>
        <button className="btn btn-primary btn-sm" style={{ marginLeft: "auto" }} onClick={openAdd}>
          + Add Question
        </button>
      </div>

      {error && (
        <div style={{ padding: "8px 12px", background: "var(--pink-lt)", color: "var(--pink)", borderRadius: 9, fontSize: 12.5, fontWeight: 700, marginBottom: 12 }}>
          ⚠ {error}
        </div>
      )}

      {loading ? (
        <p style={{ fontSize: 13, color: "var(--ink-mid)" }}>Loading questions…</p>
      ) : sorted.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--ink-faint)" }}>No questions yet for this module.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sorted.map((q, i) => (
            <div key={q.id} style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              padding: "12px 14px", borderRadius: 12, background: "#fff", border: "1px solid var(--border)",
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <button className="btn btn-ghost btn-sm" style={{ padding: "1px 7px" }} disabled={i === 0 || busyId === q.id} onClick={() => move(q, "up")} aria-label="Move up">↑</button>
                <button className="btn btn-ghost btn-sm" style={{ padding: "1px 7px" }} disabled={i === sorted.length - 1 || busyId === q.id} onClick={() => move(q, "down")} aria-label="Move down">↓</button>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 5 }}>{q.text}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {q.choices.map((c) => (
                    <span key={c.id} style={{
                      fontSize: 11.5, padding: "3px 9px", borderRadius: 12,
                      background: c.id === q.correctChoiceId ? "var(--teal-lt)" : "var(--surface)",
                      color: c.id === q.correctChoiceId ? "var(--teal)" : "var(--ink-mid)",
                      fontWeight: c.id === q.correctChoiceId ? 800 : 500,
                    }}>
                      {c.id === q.correctChoiceId ? "✓ " : ""}{c.text}
                    </span>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 5 }}>{q.points} point{q.points === 1 ? "" : "s"}</div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(q)}>Edit</button>
                <button className="btn btn-sm" style={{ background: "var(--pink-lt)", color: "var(--pink)", border: "none" }} onClick={() => setConfirmDelete(q)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT QUESTION MODAL */}
      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{editingId ? "Edit Question" : "Add Question"}</div>
              <button className="modal-close" onClick={closeForm}>✕</button>
            </div>

            {formError && (
              <div style={{ padding: "10px 14px", background: "var(--pink-lt)", color: "var(--pink)", borderRadius: 10, fontSize: 13, fontWeight: 700, marginBottom: 14 }}>
                ⚠ {formError}
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Question</label>
              <textarea
                style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
                placeholder="e.g. At what age range is The Puzzle Box Screener administered?"
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: 8 }}>
              <label style={labelStyle}>Answer options — select the correct one</label>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
              {form.choices.map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="radio"
                    name="correct-choice"
                    checked={form.correctIndex === i}
                    onChange={() => setForm({ ...form, correctIndex: i })}
                    style={{ flexShrink: 0 }}
                    aria-label={`Mark option ${i + 1} as correct`}
                  />
                  <input
                    style={inputStyle}
                    placeholder={`Option ${i + 1}`}
                    value={c.text}
                    onChange={(e) => setChoiceText(i, e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ flexShrink: 0, padding: "4px 9px" }}
                    disabled={form.choices.length <= 2}
                    onClick={() => removeChoice(i)}
                    aria-label="Remove option"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {form.choices.length < 6 && (
                <button type="button" className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start" }} onClick={addChoice}>
                  + Add option
                </button>
              )}
            </div>

            <div style={{ marginBottom: 20, maxWidth: 140 }}>
              <label style={labelStyle}>Points</label>
              <input
                type="number"
                min={1}
                style={inputStyle}
                value={form.points}
                onChange={(e) => setForm({ ...form, points: e.target.value })}
              />
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={closeForm}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </button>
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
              "{confirmDelete.text}" will be removed from this module's quiz. This can't be undone.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn btn-sm" style={{ background: "var(--pink)", color: "#fff", border: "none", padding: "10px 18px" }} onClick={remove}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}