import { useCallback, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

// Per-module training content — see supabase/migrations/020_training_content_blocks.sql.
// This is the DB-backed replacement for the hard-coded block arrays in
// src/data/trainingContent.v1.js: same block shape, same renderer
// (TrainingModuleContent.js needs no changes), but now editable from
// Admin -> Training -> Content (src/components/TrainingContentEditor.js)
// instead of a code change.
//
// Used two ways:
//   - by the trainee-facing ModuleDetail (MemberArea.js), read-only,
//     published blocks only
//   - by the admin content editor, which also needs archived blocks and
//     the write functions below

function mapRow(row) {
  return {
    id: row.id,
    moduleId: row.module_id,
    order: row.block_order,
    type: row.block_type,
    data: row.data,
    status: row.status,
    updatedAt: row.updated_at,
  };
}

export function useTrainingContentBlocks(moduleId, { includeArchived = false } = {}) {
  const [blocks, setBlocks] = useState(null); // null = loading
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!moduleId) { setBlocks([]); return; }
    let query = supabase
      .from("training_content_blocks")
      .select("*")
      .eq("module_id", moduleId)
      .order("block_order", { ascending: true });
    if (!includeArchived) query = query.eq("status", "published");

    const { data, error: err } = await query;
    if (err) {
      setError("Could not load this module's content from the database.");
      setBlocks([]);
      return;
    }
    setError("");
    setBlocks((data || []).map(mapRow));
  }, [moduleId, includeArchived]);

  useEffect(() => { refresh(); }, [refresh]);

  // Replaces one block's data in place (used by the generic field editor —
  // every edit writes the whole block's data object back, since fields
  // can be deeply nested).
  const updateBlockData = useCallback(async (blockId, newData) => {
    const { error: err } = await supabase
      .from("training_content_blocks")
      .update({ data: newData, updated_at: new Date().toISOString() })
      .eq("id", blockId);
    if (!err) refresh();
    return !err;
  }, [refresh]);

  // Soft-archive / restore — never a hard delete, per the project's
  // "don't lose training content" requirement. Archived blocks are
  // excluded from the trainee-facing read (includeArchived: false) but
  // stay visible to the admin editor for restoring later.
  const setBlockStatus = useCallback(async (blockId, status) => {
    const { error: err } = await supabase
      .from("training_content_blocks")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", blockId);
    if (!err) refresh();
    return !err;
  }, [refresh]);

  // Swaps block_order with the adjacent block in the given direction.
  const moveBlock = useCallback(async (blockId, direction) => {
    const ordered = (blocks || []).slice().sort((a, b) => a.order - b.order);
    const i = ordered.findIndex((b) => b.id === blockId);
    const j = direction === "up" ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= ordered.length) return false;
    const a = ordered[i], b = ordered[j];
    const { error: err } = await supabase.from("training_content_blocks")
      .update({ block_order: b.order }).eq("id", a.id);
    const { error: err2 } = await supabase.from("training_content_blocks")
      .update({ block_order: a.order }).eq("id", b.id);
    if (!err && !err2) refresh();
    return !err && !err2;
  }, [blocks, refresh]);

  // Duplicates a block immediately after itself — the project's
  // "Add Content" story for this phase is "start from an existing block
  // and edit it", rather than a blank per-type template (that's a later
  // CMS phase with a proper "+ Add Content" palette).
  const duplicateBlock = useCallback(async (blockId) => {
    const source = (blocks || []).find((b) => b.id === blockId);
    if (!source || !moduleId) return false;
    const ordered = (blocks || []).slice().sort((a, b) => a.order - b.order);
    // shift every later block's order up by 1 to make room right after source
    const shifted = ordered.filter((b) => b.order > source.order);
    for (const b of shifted) {
      await supabase.from("training_content_blocks").update({ block_order: b.order + 1 }).eq("id", b.id);
    }
    const { error: err } = await supabase.from("training_content_blocks").insert({
      module_id: moduleId,
      block_order: source.order + 1,
      block_type: source.type,
      data: source.data,
      status: "published",
    });
    if (!err) refresh();
    return !err;
  }, [blocks, moduleId, refresh]);

  // Adds a brand-new block of the given type, using its starter template
  // (see src/data/trainingBlockTemplates.js), appended to the end of this
  // module's content. Returns the new row's id (or null on failure) so the
  // caller can immediately open it for editing.
  const addBlock = useCallback(async (blockType, initialData) => {
    if (!moduleId) return null;
    const ordered = (blocks || []).slice().sort((a, b) => a.order - b.order);
    const nextOrder = ordered.length ? ordered[ordered.length - 1].order + 1 : 1;
    const { data, error: err } = await supabase.from("training_content_blocks").insert({
      module_id: moduleId,
      block_order: nextOrder,
      block_type: blockType,
      data: initialData,
      status: "published",
    }).select().single();
    if (err) return null;
    refresh();
    return data.id;
  }, [blocks, moduleId, refresh]);

  return {
    blocks: blocks || [],
    loading: blocks === null,
    error,
    refresh,
    updateBlockData,
    setBlockStatus,
    addBlock,
    moveBlock,
    duplicateBlock,
  };
}