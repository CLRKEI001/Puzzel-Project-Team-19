// TrainingContentEditor.js
//
// Admin editor for one module's training content blocks (the
// hero/richText/timeline/etc. content a trainee reads inside
// ModuleDetail — see src/components/TrainingModuleContent.js for the
// renderer and src/data/trainingContent.v1.js for where this content
// used to live exclusively in code).
//
// Rendered inline inside TrainingModulesAdmin.js when an admin clicks
// "Content" on a module row, the same pattern as TrainingQuizEditor.
//
// Phase 1 of the training CMS: every block's fields are editable (via
// TrainingContentBlockFieldEditor's generic structured-field form),
// blocks can be reordered, archived (soft-delete, never a hard delete),
// duplicated, and — as of this update — brand-new blocks can be added
// from a type picker (src/data/trainingBlockTemplates.js has one starter
// template per block type, matching exactly what each renderer in
// TrainingModuleContent.js expects). Not yet in this phase: lesson
// sub-structure, media library, translations, draft/publish staging, or
// version history — see the project's phased CMS plan.

import React, { useState } from "react";
import { useTrainingContentBlocks } from "../lib/useTrainingContentBlocks";
import TrainingContentBlockFieldEditor from "./TrainingContentBlockFieldEditor";
import TrainingModuleContent from "./TrainingModuleContent";
import { BLOCK_TYPE_LABELS, BLOCK_TYPE_DESCRIPTIONS, starterBlockData } from "../data/trainingBlockTemplates";

function AddContentPicker({ onPick, onCancel }) {
  return (
    <div style={{ border: "1.5px dashed var(--teal)", borderRadius: 12, padding: "16px 18px", marginBottom: 14, background: "#fff" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--ink)" }}>Add a content block</div>
        <button className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
        {Object.keys(BLOCK_TYPE_LABELS).map((type) => (
          <button
            key={type}
            onClick={() => onPick(type)}
            title={BLOCK_TYPE_DESCRIPTIONS[type]}
            style={{
              textAlign: "left", cursor: "pointer", fontFamily: "inherit",
              border: "1.5px solid var(--border)", borderRadius: 10, padding: "10px 12px", background: "var(--surface, #fafafa)",
            }}
          >
            <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--ink)" }}>{BLOCK_TYPE_LABELS[type]}</div>
            <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 2, lineHeight: 1.4 }}>{BLOCK_TYPE_DESCRIPTIONS[type]}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function TrainingContentEditor({ moduleId, colorKey }) {
  const { blocks, loading, error, updateBlockData, setBlockStatus, moveBlock, duplicateBlock, addBlock } =
    useTrainingContentBlocks(moduleId, { includeArchived: true });
  const [openBlockId, setOpenBlockId] = useState(null);
  const [draft, setDraft] = useState(null); // working copy of data while editing one block
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewBlockId, setPreviewBlockId] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [adding, setAdding] = useState(false);

  const openBlock = (block) => {
    setOpenBlockId(block.id);
    setDraft(block.data);
    setSaved(false);
  };

  const closeBlock = () => { setOpenBlockId(null); setDraft(null); };

  const save = async () => {
    if (!openBlockId || !draft) return;
    setSaving(true);
    const ok = await updateBlockData(openBlockId, draft);
    setSaving(false);
    if (ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  };

  const handleAdd = async (type) => {
    setAdding(true);
    const newId = await addBlock(type, starterBlockData(type));
    setAdding(false);
    setShowPicker(false);
    if (newId) {
      // Open the new block straight into edit mode so the admin fills it
      // in immediately rather than hunting for it in the list.
      setOpenBlockId(newId);
      setDraft(starterBlockData(type));
    }
  };

  if (loading) return <div style={{ padding: 20, fontSize: 13, color: "var(--ink-mid)" }}>Loading content…</div>;

  if (error) {
    return (
      <div style={{ padding: 20, fontSize: 13, color: "var(--pink)" }}>
        {error} (Has migration 020_training_content_blocks.sql been run against this Supabase project yet?)
      </div>
    );
  }

  const published = blocks.filter((b) => b.status === "published").sort((a, b) => a.order - b.order);
  const archived = blocks.filter((b) => b.status === "archived").sort((a, b) => a.order - b.order);

  return (
    <div style={{ padding: "18px 20px 22px", background: "var(--surface, #fafafa)", borderTop: "1px solid var(--border)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, gap: 10, flexWrap: "wrap" }}>
        <p style={{ fontSize: 12, color: "var(--ink-faint)", margin: 0 }}>
          Edit this module's content blocks below. Changes save per block and go live immediately — there's no separate publish step yet.
        </p>
        {!showPicker && (
          <button className="btn btn-teal btn-sm" onClick={() => setShowPicker(true)} disabled={adding}>
            {adding ? "Adding…" : "+ Add Content"}
          </button>
        )}
      </div>

      {showPicker && <AddContentPicker onPick={handleAdd} onCancel={() => setShowPicker(false)} />}

      {published.length === 0 && (
        <div style={{ fontSize: 13, color: "var(--ink-mid)", padding: "10px 2px" }}>
          No content blocks yet for this module{blocks.length === 0 ? " — it may still be reading from the original code file (run migration 021_seed_training_content_blocks.sql to bring that content in), or this is a new module waiting for its first block" : ""}. Click "+ Add Content" above to add one.
        </div>
      )}

      {published.map((block, i) => (
        <div key={block.id} style={{ marginBottom: 10, border: "1px solid var(--border)", borderRadius: 12, background: "#fff", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", gap: 10, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px",
                padding: "3px 9px", borderRadius: 12, background: "var(--teal-lt)", color: "var(--teal)",
              }}>
                {BLOCK_TYPE_LABELS[block.type] || block.type}
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink)" }}>
                {block.data?.title || block.data?.kicker || `Block ${i + 1}`}
              </span>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button className="btn btn-ghost btn-sm" onClick={() => moveBlock(block.id, "up")} disabled={i === 0}>↑</button>
              <button className="btn btn-ghost btn-sm" onClick={() => moveBlock(block.id, "down")} disabled={i === published.length - 1}>↓</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setPreviewBlockId(previewBlockId === block.id ? null : block.id)}>
                {previewBlockId === block.id ? "Hide preview" : "Preview"}
              </button>
              <button className="btn btn-teal btn-sm" onClick={() => openBlock(block)}>Edit</button>
              <button className="btn btn-sm" onClick={() => duplicateBlock(block.id)}>Duplicate</button>
              <button
                className="btn btn-sm"
                style={{ background: "var(--pink-lt)", color: "var(--pink)", border: "none" }}
                onClick={() => setBlockStatus(block.id, "archived")}
              >
                Archive
              </button>
            </div>
          </div>

          {previewBlockId === block.id && (
            <div style={{ borderTop: "1px solid var(--border)", padding: "16px 18px", background: "var(--surface, #fafafa)" }}>
              <TrainingModuleContent content={{ blocks: [block.data] }} colorKey={colorKey} />
            </div>
          )}

          {openBlockId === block.id && (
            <div style={{ borderTop: "1px solid var(--border)", padding: "16px 18px" }}>
              <TrainingContentBlockFieldEditor data={draft} onChange={setDraft} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
                <button className="btn btn-teal btn-sm" onClick={save} disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={closeBlock}>Close</button>
                {saved && <span style={{ fontSize: 12, color: "var(--teal)", fontWeight: 700 }}>✓ Saved</span>}
              </div>
            </div>
          )}
        </div>
      ))}

      {archived.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--ink-faint)", marginBottom: 8 }}>
            Archived ({archived.length})
          </div>
          {archived.map((block) => (
            <div key={block.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px", border: "1px dashed var(--border)", borderRadius: 10, marginBottom: 6, opacity: 0.75 }}>
              <span style={{ fontSize: 12.5 }}>{BLOCK_TYPE_LABELS[block.type] || block.type} — {block.data?.title || block.data?.kicker || "Untitled"}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setBlockStatus(block.id, "published")}>Restore</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}