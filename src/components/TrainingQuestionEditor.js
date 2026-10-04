// TrainingQuestionEditor.js
//
// Question Content Management (Admin side) — replaces TrainingQuizEditor
// as the admin-facing editor for a module's quiz questions. See:
//   - supabase/migrations/022_question_versioning_and_rls.sql (schema + RLS)
//   - src/lib/useTrainingQuestionsAdmin.js (the draft/publish data layer)
//   - src/lib/useTrainingQuestions.js (the trainee/teacher read path —
//     published rows only, enforced both here in the UI and for real by
//     the DB's RLS policy)
//
// Model: every question is a group of versioned rows sharing one
// question_key. Editing NEVER overwrites the published row — it creates
// or updates a draft row, and "Publish" is the one atomic action that
// makes that draft the live version (see useTrainingQuestionsAdmin's
// publish()). A Teacher never sees any of this UI (the route itself is
// admin-only — see App.js — and even a direct API call is rejected by
// RLS, not just by the button being hidden).

import React, { useEffect, useMemo, useState } from "react";
import { useTrainingQuestionsAdmin } from "../lib/useTrainingQuestionsAdmin";

const LANGUAGE_LABELS = { en: "English", af: "Afrikaans", xh: "isiXhosa" };

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

const badgeStyle = (bg, color) => ({
  fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px",
  padding: "3px 9px", borderRadius: 12, background: bg, color,
});

// Parses a pasted block of text shaped like:
//   What age is this for?
//   A) Four
//   *B) Five
//   C) Six
// (a leading * marks the correct option) into a translation object.
// Lightweight "paste-in" support per the spec — not a full importer.
function parsePastedQuestion(raw) {
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 3) return null;
  const [first, ...rest] = lines;
  const choices = [];
  const correctIndexes = [];
  rest.forEach((line, i) => {
    const correct = line.startsWith("*");
    const cleaned = (correct ? line.slice(1) : line).replace(/^[A-Za-z0-9][).:-]\s*/, "").trim();
    if (!cleaned) return;
    if (correct) correctIndexes.push(choices.length);
    choices.push({ id: `opt${choices.length}`, text: cleaned });
  });
  if (choices.length < 2) return null;
  return { text: first, choices, correctIndexes: correctIndexes.length ? correctIndexes : [0] };
}

function cloneDraftFields(row) {
  return JSON.parse(JSON.stringify({
    order: row.order,
    points: row.points,
    multipleSelect: row.multipleSelect,
    shuffleOptions: row.shuffleOptions,
    hint: row.hint,
    category: row.category,
    correctChoiceIds: row.correctChoiceIds,
    translations: row.translations,
  }));
}

function QuestionForm({ draftRow, onSave, onCancel, saving }) {
  const initial = useMemo(() => cloneDraftFields(draftRow), [draftRow]);
  const [fields, setFields] = useState(initial);
  const [history, setHistory] = useState([initial]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [lang, setLang] = useState("en");
  const [mode, setMode] = useState("edit"); // edit | preview
  const [showMore, setShowMore] = useState(false);
  const [formError, setFormError] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);

  // Warn before closing/refreshing the tab with unsaved changes — a plain
  // browser confirm is the only UI the beforeunload event allows; it can't
  // be styled or replaced with a custom modal.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const requestClose = () => {
    if (dirty && !window.confirm("You have unsaved changes to this question. Close without saving?")) return;
    onCancel();
  };

  const commit = (next) => {
    setFields(next);
    setDirty(true);
    // Snapshot for undo/redo — trimmed to the last 30 states so this
    // doesn't grow without bound during a long editing session.
    const trimmed = history.slice(0, historyIndex + 1);
    const nextHistory = [...trimmed, next].slice(-30);
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex <= 0) return;
    setHistoryIndex(historyIndex - 1);
    setFields(history[historyIndex - 1]);
    setDirty(true);
  };
  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    setHistoryIndex(historyIndex + 1);
    setFields(history[historyIndex + 1]);
    setDirty(true);
  };

  const t = fields.translations[lang] || { text: "", choices: [] };
  const canonicalChoices = fields.translations.en.choices; // option count/order is shared across languages

  const setText = (text) => {
    const translations = { ...fields.translations, [lang]: { ...fields.translations[lang], text } };
    commit({ ...fields, translations });
  };

  const setChoiceText = (index, text) => {
    const thisLangChoices = (fields.translations[lang]?.choices || []).slice();
    thisLangChoices[index] = { ...(thisLangChoices[index] || { id: canonicalChoices[index]?.id }), text };
    const translations = { ...fields.translations, [lang]: { ...fields.translations[lang], choices: thisLangChoices } };
    commit({ ...fields, translations });
  };

  const addChoice = () => {
    if (canonicalChoices.length >= 8) return;
    const newId = `opt${canonicalChoices.length}`;
    const translations = {};
    Object.keys(fields.translations).forEach((l) => {
      const choices = (fields.translations[l]?.choices || []).slice();
      choices.push({ id: newId, text: "" });
      translations[l] = { ...fields.translations[l], choices };
    });
    commit({ ...fields, translations });
  };

  const removeChoice = (index) => {
    if (canonicalChoices.length <= 2) return;
    const removedId = canonicalChoices[index]?.id;
    const translations = {};
    Object.keys(fields.translations).forEach((l) => {
      const choices = (fields.translations[l]?.choices || []).filter((_, i) => i !== index);
      translations[l] = { ...fields.translations[l], choices };
    });
    const correctChoiceIds = fields.correctChoiceIds.filter((id) => id !== removedId);
    commit({ ...fields, translations, correctChoiceIds });
  };

  const toggleCorrect = (choiceId) => {
    let correctChoiceIds;
    if (fields.multipleSelect) {
      correctChoiceIds = fields.correctChoiceIds.includes(choiceId)
        ? fields.correctChoiceIds.filter((id) => id !== choiceId)
        : [...fields.correctChoiceIds, choiceId];
    } else {
      correctChoiceIds = [choiceId];
    }
    commit({ ...fields, correctChoiceIds });
  };

  const applyPaste = () => {
    const parsed = parsePastedQuestion(pasteText);
    if (!parsed) { setFormError("Couldn't read that — use one question per line, then each option on its own line (mark the correct one with a leading *)."); return; }
    const choices = parsed.choices;
    const correctChoiceIds = parsed.correctIndexes.map((i) => choices[i].id);
    const translations = { ...fields.translations, en: { text: parsed.text, choices } };
    commit({ ...fields, translations, correctChoiceIds });
    setFormError("");
    setShowPaste(false);
    setPasteText("");
  };

  const validate = () => {
    const enText = (fields.translations.en.text || "").trim();
    if (!enText) return "English question text is required (other languages are optional, but English is the fallback trainees see if a translation is missing).";
    const enChoices = fields.translations.en.choices || [];
    if (enChoices.length < 2) return "Add at least two answer options.";
    if (enChoices.some((c) => !c.text || !c.text.trim())) return "Every English answer option needs text — fill in or remove empty ones.";
    if (!fields.correctChoiceIds || fields.correctChoiceIds.length === 0) return "Mark at least one correct answer.";
    if (!fields.multipleSelect && fields.correctChoiceIds.length > 1) return "\"Multiple responses\" is off, so only one answer can be marked correct.";
    return "";
  };

  const save = async () => {
    const err = validate();
    if (err) { setFormError(err); return; }
    setFormError("");
    const ok = await onSave(fields);
    if (ok) { setDirty(false); setLastSavedAt(new Date()); }
  };

  return (
    <div style={{ borderTop: "1px solid var(--border)", padding: "16px 18px", background: "#fff" }}>
      {/* Header: save state + mode toggle + undo/redo */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", borderRadius: 9, overflow: "hidden", border: "1.5px solid var(--border)" }}>
            <button
              className="btn btn-sm"
              style={{ border: "none", borderRadius: 0, background: mode === "edit" ? "var(--teal)" : "#fff", color: mode === "edit" ? "#fff" : "var(--ink-mid)" }}
              onClick={() => setMode("edit")}
            >
              Edit
            </button>
            <button
              className="btn btn-sm"
              style={{ border: "none", borderRadius: 0, background: mode === "preview" ? "var(--teal)" : "#fff", color: mode === "preview" ? "#fff" : "var(--ink-mid)" }}
              onClick={() => setMode("preview")}
            >
              Preview
            </button>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={undo} disabled={historyIndex <= 0} aria-label="Undo">↶ Undo</button>
          <button className="btn btn-ghost btn-sm" onClick={redo} disabled={historyIndex >= history.length - 1} aria-label="Redo">↷ Redo</button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11.5, color: dirty ? "var(--pink)" : "var(--ink-faint)", fontWeight: 700 }}>
            {dirty ? "● Unsaved changes" : lastSavedAt ? `✓ Saved ${lastSavedAt.toLocaleTimeString()}` : "No changes yet"}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={requestClose}>Close</button>
          <button className="btn btn-teal btn-sm" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save draft"}</button>
        </div>
      </div>

      {formError && (
        <div style={{ padding: "10px 14px", background: "var(--pink-lt)", color: "var(--pink)", borderRadius: 10, fontSize: 13, fontWeight: 700, marginBottom: 14 }}>
          ⚠ {formError}
        </div>
      )}

      {/* Paste-in */}
      <div style={{ marginBottom: 14 }}>
        {!showPaste ? (
          <button className="btn btn-ghost btn-sm" onClick={() => setShowPaste(true)}>📋 Paste in a question</button>
        ) : (
          <div style={{ border: "1.5px dashed var(--border)", borderRadius: 10, padding: 12 }}>
            <label style={labelStyle}>Paste question + options (one per line; mark the correct one with a leading *)</label>
            <textarea
              style={{ ...inputStyle, minHeight: 90, resize: "vertical", marginBottom: 8 }}
              placeholder={"What age is the Screener for?\nA) Three\n*B) Five\nC) Seven"}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-teal btn-sm" onClick={applyPaste}>Use this</button>
              <button className="btn btn-ghost btn-sm" onClick={() => { setShowPaste(false); setPasteText(""); }}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Language tabs — every question's text + options are stored for all three */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {Object.keys(LANGUAGE_LABELS).map((l) => (
          <button
            key={l}
            className="btn btn-sm"
            style={{
              border: "1.5px solid var(--border)",
              background: lang === l ? "var(--teal-lt)" : "#fff",
              color: lang === l ? "var(--teal)" : "var(--ink-mid)",
              fontWeight: lang === l ? 800 : 600,
            }}
            onClick={() => setLang(l)}
          >
            {LANGUAGE_LABELS[l]}{l !== "en" && !(fields.translations[l]?.text || "").trim() ? " (empty)" : ""}
          </button>
        ))}
      </div>

      {mode === "preview" ? (
        <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 16, background: "var(--surface, #fafafa)" }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>{t.text || <em style={{ color: "var(--ink-faint)" }}>No {LANGUAGE_LABELS[lang]} text yet</em>}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {(t.choices || canonicalChoices).map((c, i) => {
              const id = canonicalChoices[i]?.id;
              const correct = fields.correctChoiceIds.includes(id);
              return (
                <div key={id || i} style={{
                  padding: "8px 12px", borderRadius: 9,
                  background: correct ? "var(--teal-lt)" : "#fff",
                  border: `1.5px solid ${correct ? "var(--teal)" : "var(--border)"}`,
                  fontSize: 13, fontWeight: correct ? 800 : 500,
                  color: correct ? "var(--teal)" : "var(--ink)",
                }}>
                  {correct ? "✓ " : ""}{c.text || <em style={{ color: "var(--ink-faint)" }}>empty</em>}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Question text ({LANGUAGE_LABELS[lang]})</label>
            <textarea
              style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
              placeholder={lang === "en" ? "e.g. At what age range is The Puzzle Box Screener administered?" : `Translate the question into ${LANGUAGE_LABELS[lang]}`}
              value={t.text || ""}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: 8 }}>
            <label style={labelStyle}>Answer options — select the correct {fields.multipleSelect ? "answer(s)" : "answer"}</label>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
            {canonicalChoices.map((choice, i) => {
              const thisLangChoice = (fields.translations[lang]?.choices || [])[i];
              return (
                <div key={choice.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type={fields.multipleSelect ? "checkbox" : "radio"}
                    name="correct-choice"
                    checked={fields.correctChoiceIds.includes(choice.id)}
                    onChange={() => toggleCorrect(choice.id)}
                    style={{ flexShrink: 0 }}
                    aria-label={`Mark option ${i + 1} as correct`}
                  />
                  <input
                    style={inputStyle}
                    placeholder={`Option ${i + 1}${lang !== "en" ? ` — ${canonicalChoices[i]?.text || ""}` : ""}`}
                    value={thisLangChoice?.text || ""}
                    onChange={(e) => setChoiceText(i, e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ flexShrink: 0, padding: "4px 9px" }}
                    disabled={canonicalChoices.length <= 2}
                    onClick={() => removeChoice(i)}
                    aria-label="Remove option"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
            {canonicalChoices.length < 8 && (
              <button type="button" className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start" }} onClick={addChoice}>
                + Add option
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 16 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--ink-mid)" }}>
              <input
                type="checkbox"
                checked={fields.multipleSelect}
                onChange={(e) => {
                  const multipleSelect = e.target.checked;
                  const correctChoiceIds = multipleSelect ? fields.correctChoiceIds : fields.correctChoiceIds.slice(0, 1);
                  commit({ ...fields, multipleSelect, correctChoiceIds });
                }}
              />
              Multiple responses
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--ink-mid)" }}>
              <input
                type="checkbox"
                checked={fields.shuffleOptions}
                onChange={(e) => commit({ ...fields, shuffleOptions: e.target.checked })}
              />
              Shuffle options for each trainee
            </label>
            <div style={{ maxWidth: 120 }}>
              <label style={labelStyle}>Points</label>
              <input
                type="number"
                min={1}
                style={inputStyle}
                value={fields.points}
                onChange={(e) => commit({ ...fields, points: Math.max(1, parseInt(e.target.value, 10) || 1) })}
              />
            </div>
          </div>

          <button className="btn btn-ghost btn-sm" style={{ marginBottom: showMore ? 10 : 0 }} onClick={() => setShowMore(!showMore)}>
            {showMore ? "▾ Fewer options" : "▸ More options (hint, category)"}
          </button>
          {showMore && (
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", padding: "12px 0 2px" }}>
              <div style={{ flex: "1 1 220px" }}>
                <label style={labelStyle}>Hint (optional)</label>
                <input
                  style={inputStyle}
                  placeholder="Shown if a trainee asks for help"
                  value={fields.hint || ""}
                  onChange={(e) => commit({ ...fields, hint: e.target.value })}
                />
              </div>
              <div style={{ flex: "1 1 220px" }}>
                <label style={labelStyle}>Category (optional)</label>
                <input
                  style={inputStyle}
                  placeholder="e.g. Administration, Scoring"
                  value={fields.category || ""}
                  onChange={(e) => commit({ ...fields, category: e.target.value })}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function TrainingQuestionEditor({ moduleId }) {
  const {
    groups, loading, error,
    createDraft, startEditing, saveDraft, discardDraft, publish, archiveQuestion, moveQuestion,
  } = useTrainingQuestionsAdmin(moduleId);

  const [openKey, setOpenKey] = useState(null);
  const [openRow, setOpenRow] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [busyKey, setBusyKey] = useState(null);

  const openForEditing = async (group) => {
    const row = await startEditing(group);
    if (row) { setOpenKey(group.questionKey); setOpenRow(row); }
  };

  const openNew = async () => {
    const row = await createDraft();
    if (row) { setOpenKey(row.questionKey); setOpenRow(row); }
  };

  const closeEditor = () => { setOpenKey(null); setOpenRow(null); };

  const handleSave = async (fields) => {
    setSaving(true);
    const ok = await saveDraft(openRow.id, fields);
    setSaving(false);
    return ok;
  };

  const handlePublish = async (group) => {
    const row = group.draft || group.published;
    if (!row) return;
    setBusyKey(group.questionKey);
    await publish(group.questionKey, row.id);
    setBusyKey(null);
    if (openKey === group.questionKey) closeEditor();
  };

  const handleDiscardDraft = async (group) => {
    if (!group.draft) return;
    setBusyKey(group.questionKey);
    await discardDraft(group.draft.id);
    setBusyKey(null);
    if (openKey === group.questionKey) closeEditor();
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setBusyKey(confirmDelete.questionKey);
    await archiveQuestion(confirmDelete.questionKey);
    setBusyKey(null);
    setConfirmDelete(null);
    if (openKey === confirmDelete.questionKey) closeEditor();
  };

  if (loading) return <div style={{ padding: 20, fontSize: 13, color: "var(--ink-mid)" }}>Loading questions…</div>;

  if (error) {
    return (
      <div style={{ padding: 20, fontSize: 13, color: "var(--pink)" }}>{error}</div>
    );
  }

  const totalPoints = groups.reduce((sum, g) => sum + ((g.published || g.draft)?.points || 0), 0);

  return (
    <div style={{ padding: "18px 20px", background: "var(--surface)", borderTop: "1px solid var(--border)" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: 12.5, color: "var(--ink-mid)", fontWeight: 700 }}>
          {groups.length} question{groups.length === 1 ? "" : "s"} · {totalPoints} point{totalPoints === 1 ? "" : "s"} total (published)
        </span>
        <button className="btn btn-primary btn-sm" style={{ marginLeft: "auto" }} onClick={openNew}>
          + Add Question
        </button>
      </div>

      {groups.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--ink-faint)" }}>No questions yet for this module.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {groups.map((group, i) => {
            const display = group.published || group.draft;
            const text = display?.translations?.en?.text || "(untitled)";
            const choices = display?.translations?.en?.choices || [];
            return (
              <div key={group.questionKey} style={{ borderRadius: 12, background: "#fff", border: "1px solid var(--border)", overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <button className="btn btn-ghost btn-sm" style={{ padding: "1px 7px" }} disabled={i === 0 || busyKey === group.questionKey} onClick={() => moveQuestion(group, "up")} aria-label="Move up">↑</button>
                    <button className="btn btn-ghost btn-sm" style={{ padding: "1px 7px" }} disabled={i === groups.length - 1 || busyKey === group.questionKey} onClick={() => moveQuestion(group, "down")} aria-label="Move down">↓</button>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{text}</span>
                      {group.published ? (
                        <span style={badgeStyle("var(--teal-lt)", "var(--teal)")}>Published v{group.published.version}</span>
                      ) : (
                        <span style={badgeStyle("#F0EDF8", "#6B2F8A")}>Not published</span>
                      )}
                      {group.draft && (
                        <span style={badgeStyle("var(--pink-lt)", "var(--pink)")}>Draft v{group.draft.version} pending</span>
                      )}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {choices.map((c) => (
                        <span key={c.id} style={{
                          fontSize: 11.5, padding: "3px 9px", borderRadius: 12,
                          background: display.correctChoiceIds.includes(c.id) ? "var(--teal-lt)" : "var(--surface)",
                          color: display.correctChoiceIds.includes(c.id) ? "var(--teal)" : "var(--ink-mid)",
                          fontWeight: display.correctChoiceIds.includes(c.id) ? 800 : 500,
                        }}>
                          {display.correctChoiceIds.includes(c.id) ? "✓ " : ""}{c.text}
                        </span>
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 5 }}>{display?.points} point{display?.points === 1 ? "" : "s"}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap", maxWidth: 260, justifyContent: "flex-end" }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openForEditing(group)}>{group.draft ? "Continue editing" : "Edit"}</button>
                    {group.draft && (
                      <>
                        <button className="btn btn-teal btn-sm" disabled={busyKey === group.questionKey} onClick={() => handlePublish(group)}>Publish</button>
                        {group.published && (
                          <button className="btn btn-ghost btn-sm" disabled={busyKey === group.questionKey} onClick={() => handleDiscardDraft(group)}>Discard draft</button>
                        )}
                      </>
                    )}
                    {!group.draft && !group.published && (
                      <span style={{ fontSize: 11, color: "var(--ink-faint)", alignSelf: "center" }}>Nothing to publish</span>
                    )}
                    <button className="btn btn-sm" style={{ background: "var(--pink-lt)", color: "var(--pink)", border: "none" }} onClick={() => setConfirmDelete(group)}>Delete</button>
                  </div>
                </div>

                {openKey === group.questionKey && openRow && (
                  <QuestionForm
                    draftRow={openRow}
                    saving={saving}
                    onCancel={closeEditor}
                    onSave={handleSave}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* DELETE CONFIRM — archives, never a real delete */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Delete this question?</div>
              <button className="modal-close" onClick={() => setConfirmDelete(null)}>✕</button>
            </div>
            <p style={{ fontSize: 13.5, color: "var(--ink-mid)", lineHeight: 1.6, marginBottom: 20 }}>
              This removes it from the module's quiz immediately. It's archived rather than permanently
              deleted, so any completed screenings that used it keep their record of exactly what was asked.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn btn-sm" style={{ background: "var(--pink)", color: "#fff", border: "none", padding: "10px 18px" }} onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}