// TrainingModulesAdmin.js
//
// Lets an admin add, edit, reorder, publish and delete the training
// modules shown on the public Training page and the logged-in Training
// tab — entirely from this screen. No code changes, no Supabase SQL
// editor. See supabase/migrations/004_training_modules.sql for the table
// this reads and writes, and src/lib/useTrainingModules.js for the
// shared read hook the public pages use.

import React, { useState } from "react";
import Doodle from "../shared/Doodle";
import { supabase } from "../../services/supabaseClient";
import { useTrainingModules, COLOR_KEYS } from "../../hooks/useTrainingModules";
import TrainingQuestionEditor from "./TrainingQuestionEditor";
import TrainingContentEditor from "./TrainingContentEditor";

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

const COLOR_SWATCH = {
  teal: "#009B8D",
  pink: "#E8175D",
  purple: "#6B2F8A",
  orange: "#F26522",
  maroon: "#7A1B3D",
};

const EMPTY_FORM = { title: "", description: "", colorKey: "teal", status: "coming_soon", videoUrl: "", contentUrl: "" };

export default function TrainingModulesAdmin() {
  const { modules: allModules, loading, error, refresh } = useTrainingModules();
  // Educators and psychologists have separate tracks — edit one at a time
  const [audience, setAudience] = useState("educator");
  const modules = allModules.filter((m) => m.audience === audience);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [busyId, setBusyId] = useState(null); // row currently reordering/toggling
  const [quizModuleId, setQuizModuleId] = useState(null); // module whose quiz panel is open
  const [contentModuleId, setContentModuleId] = useState(null); // module whose content panel is open

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (mod) => {
    setForm({
      title: mod.title,
      description: mod.description,
      colorKey: mod.colorKey,
      status: mod.status,
      videoUrl: mod.videoUrl || "",
      contentUrl: mod.contentUrl || "",
    });
    setEditingId(mod.id);
    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormError("");
  };

  const save = async () => {
    if (!form.title.trim()) {
      setFormError("Please give the module a title.");
      return;
    }
    setSaving(true);
    setFormError("");

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      color_key: form.colorKey,
      status: form.status,
      video_url: form.videoUrl.trim() || null,
      content_url: form.contentUrl.trim() || null,
    };

    let saveError;
    if (editingId) {
      ({ error: saveError } = await supabase.from("training_modules").update(payload).eq("id", editingId));
    } else {
      const nextOrder = modules.reduce((max, m) => Math.max(max, m.sortOrder || 0), 0) + 1;
      ({ error: saveError } = await supabase.from("training_modules").insert({ ...payload, audience, sort_order: nextOrder }));
    }

    if (saveError) {
      console.error(editingId ? "Error updating module:" : "Error adding module:", saveError);
      setFormError((editingId ? "Could not save changes — " : "Could not add this module — ") + saveError.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    closeForm();
    refresh();
  };

  const remove = async () => {
    if (!confirmDelete) return;
    const { error: deleteError } = await supabase.from("training_modules").delete().eq("id", confirmDelete.id);
    if (deleteError) {
      console.error("Error deleting module:", deleteError);
    }
    setConfirmDelete(null);
    refresh();
  };

  const togglePublished = async (mod) => {
    setBusyId(mod.id);
    const { error: toggleError } = await supabase
      .from("training_modules")
      .update({ status: mod.status === "published" ? "coming_soon" : "published" })
      .eq("id", mod.id);
    if (toggleError) console.error("Error updating status:", toggleError);
    setBusyId(null);
    refresh();
  };

  const move = async (mod, direction) => {
    const sorted = [...modules].sort((a, b) => a.sortOrder - b.sortOrder);
    const index = sorted.findIndex((m) => m.id === mod.id);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= sorted.length) return;
    const neighbour = sorted[swapIndex];

    setBusyId(mod.id);
    const [{ error: err1 }, { error: err2 }] = await Promise.all([
      supabase.from("training_modules").update({ sort_order: neighbour.sortOrder }).eq("id", mod.id),
      supabase.from("training_modules").update({ sort_order: mod.sortOrder }).eq("id", neighbour.id),
    ]);
    if (err1 || err2) console.error("Error reordering modules:", err1 || err2);
    setBusyId(null);
    refresh();
  };

  const sorted = [...modules].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {[["educator", "Educator training (Tier 1)"], ["psychologist", "Psychologist training (Tier 2)"]].map(([key, label]) => (
          <button
            key={key}
            className="btn btn-sm"
            onClick={() => { setAudience(key); closeForm(); setQuizModuleId(null); setContentModuleId(null); }}
            style={{
              background: audience === key ? "var(--teal)" : "var(--surface)",
              color: audience === key ? "#fff" : "var(--ink-mid)", border: "none", fontWeight: 800,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="search-bar">
        <span style={{ fontSize: 13, color: "var(--ink-mid)", fontWeight: 600 }}>
          {sorted.length} module{sorted.length === 1 ? "" : "s"}
        </span>
        <button className="btn btn-primary btn-sm" style={{ marginLeft: "auto" }} onClick={openAdd}>
          + Add Module
        </button>
      </div>

      {error && (
        <div style={{ padding: "10px 14px", background: "var(--pink-lt)", color: "var(--pink)", borderRadius: 10, fontSize: 13, fontWeight: 700, marginBottom: 14 }}>
          <Doodle name="warning" size={16} inline /> {error}
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ display: "flex", justifyContent: "center" }}><Doodle name="books" size={56} /></div>
            <div className="empty-state-title">Loading modules...</div>
          </div>
        ) : sorted.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ display: "flex", justifyContent: "center" }}><Doodle name="books" size={56} /></div>
            <div className="empty-state-title">No modules yet</div>
            <div className="empty-state-sub">Add the first training module to get started.</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 70 }}>Order</th>
                  <th>Module</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((mod, i) => (
                  <React.Fragment key={mod.id}>
                  <tr>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ padding: "2px 8px" }}
                          disabled={i === 0 || busyId === mod.id}
                          onClick={() => move(mod, "up")}
                          aria-label="Move up"
                        >
                          ↑
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ padding: "2px 8px" }}
                          disabled={i === sorted.length - 1 || busyId === mod.id}
                          onClick={() => move(mod, "down")}
                          aria-label="Move down"
                        >
                          ↓
                        </button>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{
                          width: 12, height: 12, borderRadius: "50%", flexShrink: 0,
                          background: COLOR_SWATCH[mod.colorKey] || COLOR_SWATCH.teal,
                        }} />
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 13 }}>{mod.title}</div>
                          {mod.description && (
                            <div style={{ fontSize: 11.5, color: "var(--ink-faint)", marginTop: 2, maxWidth: 360 }}>{mod.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          display: "inline-block", padding: "5px 12px", borderRadius: 20,
                          fontSize: 12, fontWeight: 700,
                          background: mod.status === "published" ? "var(--teal-lt)" : "var(--surface)",
                          color: mod.status === "published" ? "var(--teal)" : "var(--ink-mid)",
                        }}
                      >
                        {mod.status === "published" ? "Published" : "Coming soon"}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-teal btn-sm" onClick={() => togglePublished(mod)} disabled={busyId === mod.id}>
                        {mod.status === "published" ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        className="btn btn-sm"
                        style={{ marginLeft: 6, background: quizModuleId === mod.id ? "var(--purple)" : "var(--purple-lt, #F0EDF8)", color: quizModuleId === mod.id ? "#fff" : "var(--purple, #6B2F8A)", border: "none" }}
                        onClick={() => setQuizModuleId(quizModuleId === mod.id ? null : mod.id)}
                      >
                        {quizModuleId === mod.id ? "Hide Quiz" : "Quiz"}
                      </button>
                      <button
                        className="btn btn-sm"
                        style={{ marginLeft: 6, background: contentModuleId === mod.id ? "var(--teal)" : "var(--teal-lt)", color: contentModuleId === mod.id ? "#fff" : "var(--teal)", border: "none" }}
                        onClick={() => setContentModuleId(contentModuleId === mod.id ? null : mod.id)}
                      >
                        {contentModuleId === mod.id ? "Hide Content" : "Content"}
                      </button>
                      <button className="btn btn-ghost btn-sm" style={{ marginLeft: 6 }} onClick={() => openEdit(mod)}>
                        Edit
                      </button>
                      <button
                        className="btn btn-sm"
                        style={{ marginLeft: 6, background: "var(--pink-lt)", color: "var(--pink)", border: "none" }}
                        onClick={() => setConfirmDelete(mod)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  {quizModuleId === mod.id && (
                    <tr>
                      <td colSpan={4} style={{ padding: 0 }}>
                        <TrainingQuestionEditor moduleId={mod.id} />
                      </td>
                    </tr>
                  )}
                  {contentModuleId === mod.id && (
                    <tr>
                      <td colSpan={4} style={{ padding: 0 }}>
                        <TrainingContentEditor moduleId={mod.id} colorKey={mod.colorKey} />
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{editingId ? "Edit Module" : "Add Module"}</div>
              <button className="modal-close" onClick={closeForm}>✕</button>
            </div>

            {formError && (
              <div style={{ padding: "10px 14px", background: "var(--pink-lt)", color: "var(--pink)", borderRadius: 10, fontSize: 13, fontWeight: 700, marginBottom: 14 }}>
                <Doodle name="warning" size={16} inline /> {formError}
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Title</label>
              <input
                style={inputStyle}
                placeholder="e.g. Administration"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Description (optional)</label>
              <textarea
                style={{ ...inputStyle, minHeight: 70, resize: "vertical" }}
                placeholder="A line or two describing what this module covers"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Colour</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {COLOR_KEYS.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm({ ...form, colorKey: key })}
                      title={key}
                      style={{
                        width: 28, height: 28, borderRadius: "50%", background: COLOR_SWATCH[key],
                        border: form.colorKey === key ? "3px solid var(--ink)" : "2px solid transparent",
                        cursor: "pointer", padding: 0,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Status</label>
                <select
                  style={inputStyle}
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="coming_soon">Coming soon</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Video link (optional)</label>
              <input
                style={inputStyle}
                placeholder="https://... (leave blank to show a 'Video coming soon' placeholder)"
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Other resource link (optional)</label>
              <input
                style={inputStyle}
                placeholder="https://... e.g. a PDF or worksheet"
                value={form.contentUrl}
                onChange={(e) => setForm({ ...form, contentUrl: e.target.value })}
              />
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={closeForm}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving || !form.title.trim()}>
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
              <div className="modal-title">Delete "{confirmDelete.title}"?</div>
              <button className="modal-close" onClick={() => setConfirmDelete(null)}>✕</button>
            </div>
            <p style={{ fontSize: 13.5, color: "var(--ink-mid)", lineHeight: 1.6, marginBottom: 20 }}>
              This removes the module from the training page immediately. This can't be undone.
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
    </>
  );
}