// ScreenerContentAdmin.js
//
// Lets an admin manage the PuzzleBox Screener's content — the general
// instructions, sections, and (via ScreenerQuestionsEditor.js and
// ScreenerScoreTableEditor.js) every question and its scoring rules —
// entirely from this screen. No code changes, no Supabase SQL editor.
//
// See supabase/migrations/007_screener_content.sql for the tables this
// reads and writes, migration 008 for the one-time seed that transcribes
// the screener's original content into them, and
// src/lib/useScreenerContent.js for the hook the live screener
// (PuzzleBoxScreener.js) reads content from.

import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useScreenerContent } from "../lib/useScreenerContent";
import ScreenerQuestionsEditor from "./ScreenerQuestionsEditor";

const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  border: "1.5px solid var(--border)",
  borderRadius: 10,
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

const DOMAINS = ["cognitive", "fine_motor", "language", "social", "emotional", "moral", "attention"];
const EMPTY_SECTION_FORM = { title: "", description: "", domain: "cognitive", isPuzzleTimerSection: false };

// ---------------------------------------------------------------------
// Instructions / scoring legend (the screener_meta singleton row)
// ---------------------------------------------------------------------
function MetaEditor() {
  const [meta, setMeta] = useState(null);
  const [instructions, setInstructions] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = async () => {
    const { data, error: err } = await supabase.from("screener_meta").select("*").eq("id", 1).maybeSingle();
    if (err) { console.error("Error loading screener meta:", err); setError("Could not load the screener's general settings."); return; }
    setMeta(data);
    setInstructions(data?.instructions || "");
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    const { error: err } = meta
      ? await supabase.from("screener_meta").update({ instructions }).eq("id", 1)
      : await supabase.from("screener_meta").insert({
          id: 1, instructions,
          scoring_legend: [{ value: 0, label: "Fail" }, { value: 1, label: "Pass" }, { value: 2, label: "Passed Confidently" }],
        });
    if (err) {
      console.error("Error saving screener meta:", err);
      setError("Could not save — " + err.message);
      setSaving(false);
      return;
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    load();
  };

  return (
    <div className="card" style={{ marginBottom: 18 }}>
      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10 }}>General instructions</div>
      {error && (
        <div style={{ padding: "8px 12px", background: "var(--pink-lt)", color: "var(--pink)", borderRadius: 9, fontSize: 12.5, fontWeight: 700, marginBottom: 10 }}>
          ⚠ {error}
        </div>
      )}
      <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical", marginBottom: 10 }}
        placeholder="Shown at the top of every screening, e.g. how to tick the circles"
        value={instructions} onChange={(e) => setInstructions(e.target.value)} />
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
        {saved && <span style={{ fontSize: 12, color: "var(--teal)", fontWeight: 700 }}>Saved</span>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Sections list
// ---------------------------------------------------------------------
export default function ScreenerContentAdmin() {
  const [sections, setSections] = useState(null);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_SECTION_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);

  const { refresh: refreshLiveContent } = useScreenerContent();

  const refresh = async () => {
    const { data, error: err } = await supabase.from("screener_sections").select("*").order("sort_order", { ascending: true });
    if (err) { console.error("Error loading sections:", err); setError("Could not load screener sections."); setSections([]); return; }
    setError("");
    setSections(data || []);
  };

  useEffect(() => { refresh(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openAdd = () => { setForm(EMPTY_SECTION_FORM); setEditingId(null); setFormError(""); setShowForm(true); };
  const openEdit = (s) => {
    setForm({ title: s.title, description: s.description || "", domain: s.domain, isPuzzleTimerSection: !!s.is_puzzle_timer_section });
    setEditingId(s.id);
    setFormError("");
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditingId(null); setFormError(""); };

  const save = async () => {
    if (!form.title.trim()) { setFormError("Please give the section a title."); return; }
    setSaving(true);
    setFormError("");

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      domain: form.domain,
      is_puzzle_timer_section: form.isPuzzleTimerSection,
    };

    let saveError;
    if (editingId) {
      ({ error: saveError } = await supabase.from("screener_sections").update(payload).eq("id", editingId));
    } else {
      const nextOrder = (sections || []).reduce((max, s) => Math.max(max, s.sort_order || 0), 0) + 1;
      ({ error: saveError } = await supabase.from("screener_sections").insert({ ...payload, sort_order: nextOrder }));
    }

    if (saveError) {
      console.error(editingId ? "Error updating section:" : "Error adding section:", saveError);
      setFormError((editingId ? "Could not save changes — " : "Could not add this section — ") + saveError.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    closeForm();
    refresh();
    refreshLiveContent();
  };

  const remove = async () => {
    if (!confirmDelete) return;
    const { error: err } = await supabase.from("screener_sections").delete().eq("id", confirmDelete.id);
    if (err) console.error("Error deleting section:", err);
    setConfirmDelete(null);
    refresh();
    refreshLiveContent();
  };

  const move = async (s, direction) => {
    const sorted = [...(sections || [])].sort((a, b) => a.sort_order - b.sort_order);
    const index = sorted.findIndex((item) => item.id === s.id);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= sorted.length) return;
    const neighbour = sorted[swapIndex];
    setBusyId(s.id);
    await Promise.all([
      supabase.from("screener_sections").update({ sort_order: neighbour.sort_order }).eq("id", s.id),
      supabase.from("screener_sections").update({ sort_order: s.sort_order }).eq("id", neighbour.id),
    ]);
    setBusyId(null);
    refresh();
    refreshLiveContent();
  };

  const sorted = [...(sections || [])].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <>
      <MetaEditor />

      <div className="search-bar">
        <span style={{ fontSize: 13, color: "var(--ink-mid)", fontWeight: 600 }}>
          {sorted.length} section{sorted.length === 1 ? "" : "s"}
        </span>
        <button className="btn btn-primary btn-sm" style={{ marginLeft: "auto" }} onClick={openAdd}>
          + Add Section
        </button>
      </div>

      {error && (
        <div style={{ padding: "10px 14px", background: "var(--pink-lt)", color: "var(--pink)", borderRadius: 10, fontSize: 13, fontWeight: 700, marginBottom: 14 }}>
          ⚠ {error}
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {sections === null ? (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ fontSize: 28 }}></div>
            <div className="empty-state-title">Loading sections...</div>
          </div>
        ) : sorted.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🧩</div>
            <div className="empty-state-title">No sections yet</div>
            <div className="empty-state-sub">Add the first section of the screener to get started.</div>
          </div>
        ) : (
          <div>
            {sorted.map((s, i) => {
              const isOpen = expandedSection === s.id;
              return (
                <div key={s.id} style={{ borderBottom: i === sorted.length - 1 ? "none" : "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <button className="btn btn-ghost btn-sm" style={{ padding: "2px 8px" }} disabled={i === 0 || busyId === s.id} onClick={() => move(s, "up")} aria-label="Move up">↑</button>
                      <button className="btn btn-ghost btn-sm" style={{ padding: "2px 8px" }} disabled={i === sorted.length - 1 || busyId === s.id} onClick={() => move(s, "down")} aria-label="Move down">↓</button>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 14 }}>{s.title}</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                        <span style={{ fontSize: 10.5, padding: "2px 8px", borderRadius: 10, background: "var(--teal-lt)", color: "var(--teal)", fontWeight: 700 }}>
                          {s.domain}
                        </span>
                        {s.is_puzzle_timer_section && (
                          <span style={{ fontSize: 10.5, padding: "2px 8px", borderRadius: 10, background: "var(--orange-lt, #FEF0E7)", color: "var(--orange, #F26522)", fontWeight: 700 }}>
                            ⏱ puzzle timer section
                          </span>
                        )}
                      </div>
                      {s.description && <div style={{ fontSize: 12, color: "var(--ink-faint)", marginTop: 5, maxWidth: 520 }}>{s.description}</div>}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button className="btn btn-teal btn-sm" onClick={() => setExpandedSection(isOpen ? null : s.id)}>
                        {isOpen ? "Hide Questions" : "Questions"}
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)}>Edit</button>
                      <button className="btn btn-sm" style={{ background: "var(--pink-lt)", color: "var(--pink)", border: "none" }} onClick={() => setConfirmDelete(s)}>Delete</button>
                    </div>
                  </div>
                  {isOpen && <ScreenerQuestionsEditor sectionId={s.id} />}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ADD / EDIT SECTION MODAL */}
      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{editingId ? "Edit Section" : "Add Section"}</div>
              <button className="modal-close" onClick={closeForm}>✕</button>
            </div>

            {formError && (
              <div style={{ padding: "10px 14px", background: "var(--pink-lt)", color: "var(--pink)", borderRadius: 10, fontSize: 13, fontWeight: 700, marginBottom: 14 }}>
                ⚠ {formError}
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Title</label>
              <input style={inputStyle} placeholder="e.g. 11. New Section" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Description (optional — shown under the section title)</label>
              <textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }}
                value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Domain</label>
              <select style={inputStyle} value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })}>
                {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--ink-mid)", marginBottom: 20, cursor: "pointer" }}>
              <input type="checkbox" checked={form.isPuzzleTimerSection} onChange={(e) => setForm({ ...form, isPuzzleTimerSection: e.target.checked })} />
              This is the section the live puzzle timer runs in (only one section should have this on)
            </label>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={closeForm}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving || !form.title.trim()}>{saving ? "Saving…" : "Save"}</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Delete "{confirmDelete.title}"?</div>
              <button className="modal-close" onClick={() => setConfirmDelete(null)}>✕</button>
            </div>
            <p style={{ fontSize: 13.5, color: "var(--ink-mid)", lineHeight: 1.6, marginBottom: 20 }}>
              This removes the section and every question and scoring rule inside it, immediately, from the live screener. This can't be undone.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn btn-sm" style={{ background: "var(--pink)", color: "#fff", border: "none", padding: "10px 18px" }} onClick={remove}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}